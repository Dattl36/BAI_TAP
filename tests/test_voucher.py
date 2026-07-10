import pytest
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
from rest_framework import status
from rest_framework.test import APIClient
from apps.customers.models import CustomerProfile
from apps.employees.models import EmployeeProfile
from apps.services.models import Service
from apps.appointments.models import Appointment, AppointmentService
from apps.billing.models import Invoice
from apps.promotions.models import Promotion, Voucher, RewardPointLedger
from apps.promotions.reward_services import add_ledger, current_balance, redeem_points

User = get_user_model()

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def test_setup():
    user = User.objects.create_user(
        username="promo_customer",
        password="CustomerPassword123!",
        email="promo@example.com",
        role="customer"
    )
    customer, _ = CustomerProfile.objects.get_or_create(
        user=user,
        defaults={"full_name": "Promo Cus", "phone": "0933333333"}
    )
    
    receptionist_user = User.objects.create_user(
        username="promo_receptionist",
        password="ReceptionistPassword123!",
        role="receptionist"
    )
    receptionist, _ = EmployeeProfile.objects.get_or_create(
        user=receptionist_user,
        defaults={"role_type": "receptionist", "full_name": "Promo Receptionist"}
    )
    
    service = Service.objects.create(
        name="Uốn tóc VIP",
        category="Perm",
        base_price=400000.00,
        duration_minutes=60
    )
    
    start_time = timezone.now() + timedelta(hours=2)
    end_time = start_time + timedelta(minutes=60)
    appointment = Appointment.objects.create(
        customer=customer,
        staff=receptionist,
        scheduled_start=start_time,
        scheduled_end=end_time,
        status="requested"
    )
    
    AppointmentService.objects.create(
        appointment=appointment,
        service=service,
        price_at_booking=service.base_price,
        duration_at_booking=service.duration_minutes
    )
    
    return {
        "user": user,
        "customer": customer,
        "receptionist_user": receptionist_user,
        "appointment": appointment,
        "service": service
    }

@pytest.mark.django_db
def test_create_invoice_from_appointment(api_client, test_setup):
    api_client.force_authenticate(user=test_setup["receptionist_user"])
    appointment = test_setup["appointment"]
    
    response = api_client.post(f"/api/invoices/from-appointment/{appointment.id}/")
    assert response.status_code == status.HTTP_201_CREATED
    assert float(response.data["data"]["subtotal"]) == 400000.00
    assert response.data["data"]["status"] == "draft"

@pytest.mark.django_db
def test_issue_invoice(api_client, test_setup):
    api_client.force_authenticate(user=test_setup["receptionist_user"])
    appointment = test_setup["appointment"]
    
    response = api_client.post(f"/api/invoices/from-appointment/{appointment.id}/")
    invoice_id = response.data["data"]["id"]
    
    issue_response = api_client.post(f"/api/invoices/{invoice_id}/issue/")
    assert issue_response.status_code == status.HTTP_200_OK
    assert issue_response.data["data"]["status"] == "issued"

@pytest.mark.django_db
def test_apply_voucher_discount_amount(api_client, test_setup):
    user = test_setup["user"]
    appointment = test_setup["appointment"]
    
    api_client.force_authenticate(user=user)
    
    starts_at = timezone.now() - timedelta(days=1)
    expires_at = timezone.now() + timedelta(days=5)
    voucher = Voucher.objects.create(
        code="TESTAMOUNT50",
        discount_type="amount",
        discount_value=50000.00,
        min_invoice=200000.00,
        starts_at=starts_at,
        expires_at=expires_at,
        status="active",
        usage_limit=1
    )
    
    response = api_client.post(f"/api/invoices/from-appointment/{appointment.id}/")
    invoice_id = response.data["data"]["id"]
    
    apply_response = api_client.post(f"/api/invoices/{invoice_id}/apply-voucher/", {"voucher_code": "TESTAMOUNT50"}, format="json")
    
    assert apply_response.status_code == status.HTTP_200_OK
    assert float(apply_response.data["data"]["discount_total"]) == 50000.00
    assert float(apply_response.data["data"]["total_due"]) == 350000.00

@pytest.mark.django_db
def test_apply_voucher_discount_percent(api_client, test_setup):
    user = test_setup["user"]
    appointment = test_setup["appointment"]
    
    api_client.force_authenticate(user=user)
    
    starts_at = timezone.now() - timedelta(days=1)
    expires_at = timezone.now() + timedelta(days=5)
    voucher = Voucher.objects.create(
        code="TESTPERCENT10",
        discount_type="percent",
        discount_value=10.00,
        min_invoice=200000.00,
        starts_at=starts_at,
        expires_at=expires_at,
        status="active",
        usage_limit=1
    )
    
    response = api_client.post(f"/api/invoices/from-appointment/{appointment.id}/")
    invoice_id = response.data["data"]["id"]
    
    apply_response = api_client.post(f"/api/invoices/{invoice_id}/apply-voucher/", {"voucher_code": "TESTPERCENT10"}, format="json")
    
    assert apply_response.status_code == status.HTTP_200_OK
    assert float(apply_response.data["data"]["discount_total"]) == 40000.00
    assert float(apply_response.data["data"]["total_due"]) == 360000.00

@pytest.mark.django_db
def test_apply_voucher_discount_min_invoice_fails(api_client, test_setup):
    user = test_setup["user"]
    appointment = test_setup["appointment"]
    
    api_client.force_authenticate(user=user)
    
    starts_at = timezone.now() - timedelta(days=1)
    expires_at = timezone.now() + timedelta(days=5)
    voucher = Voucher.objects.create(
        code="TESTMIN500",
        discount_type="amount",
        discount_value=50000.00,
        min_invoice=500000.00,
        starts_at=starts_at,
        expires_at=expires_at,
        status="active",
        usage_limit=1
    )
    
    response = api_client.post(f"/api/invoices/from-appointment/{appointment.id}/")
    invoice_id = response.data["data"]["id"]
    
    apply_response = api_client.post(f"/api/invoices/{invoice_id}/apply-voucher/", {"voucher_code": "TESTMIN500"}, format="json")
    assert apply_response.status_code == status.HTTP_400_BAD_REQUEST

@pytest.mark.django_db
def test_apply_voucher_expired_fails(api_client, test_setup):
    user = test_setup["user"]
    appointment = test_setup["appointment"]
    api_client.force_authenticate(user=user)
    
    # Voucher expired 2 days ago
    starts_at = timezone.now() - timedelta(days=5)
    expires_at = timezone.now() - timedelta(days=2)
    voucher = Voucher.objects.create(
        code="TESTEXPIRED",
        discount_type="amount",
        discount_value=50000.00,
        starts_at=starts_at,
        expires_at=expires_at,
        status="active",
        usage_limit=1
    )
    response = api_client.post(f"/api/invoices/from-appointment/{appointment.id}/")
    invoice_id = response.data["data"]["id"]
    apply_response = api_client.post(f"/api/invoices/{invoice_id}/apply-voucher/", {"voucher_code": "TESTEXPIRED"}, format="json")
    assert apply_response.status_code == status.HTTP_400_BAD_REQUEST

@pytest.mark.django_db
def test_apply_voucher_not_started_fails(api_client, test_setup):
    user = test_setup["user"]
    appointment = test_setup["appointment"]
    api_client.force_authenticate(user=user)
    
    # Voucher starts tomorrow
    starts_at = timezone.now() + timedelta(days=1)
    expires_at = timezone.now() + timedelta(days=5)
    voucher = Voucher.objects.create(
        code="TESTFUTURE",
        discount_type="amount",
        discount_value=50000.00,
        starts_at=starts_at,
        expires_at=expires_at,
        status="active",
        usage_limit=1
    )
    response = api_client.post(f"/api/invoices/from-appointment/{appointment.id}/")
    invoice_id = response.data["data"]["id"]
    apply_response = api_client.post(f"/api/invoices/{invoice_id}/apply-voucher/", {"voucher_code": "TESTFUTURE"}, format="json")
    assert apply_response.status_code == status.HTTP_400_BAD_REQUEST

@pytest.mark.django_db
def test_apply_voucher_usage_limit_fails(api_client, test_setup):
    user = test_setup["user"]
    appointment = test_setup["appointment"]
    api_client.force_authenticate(user=user)
    
    starts_at = timezone.now() - timedelta(days=1)
    expires_at = timezone.now() + timedelta(days=5)
    voucher = Voucher.objects.create(
        code="TESTUSED",
        discount_type="amount",
        discount_value=50000.00,
        starts_at=starts_at,
        expires_at=expires_at,
        status="active",
        usage_limit=1,
        used_count=1 # Already used
    )
    response = api_client.post(f"/api/invoices/from-appointment/{appointment.id}/")
    invoice_id = response.data["data"]["id"]
    apply_response = api_client.post(f"/api/invoices/{invoice_id}/apply-voucher/", {"voucher_code": "TESTUSED"}, format="json")
    assert apply_response.status_code == status.HTTP_400_BAD_REQUEST

@pytest.mark.django_db
def test_apply_voucher_other_customer_fails(api_client, test_setup):
    user = test_setup["user"]
    appointment = test_setup["appointment"]
    api_client.force_authenticate(user=user)
    
    # Create another customer
    other_user = User.objects.create_user(username="other_cus_voucher", password="Password123!", role="customer")
    other_customer = other_user.customer_profile
    other_customer.full_name = "Other"
    other_customer.phone = "0123"
    other_customer.save()
    
    starts_at = timezone.now() - timedelta(days=1)
    expires_at = timezone.now() + timedelta(days=5)
    # Voucher is assigned to other_customer
    voucher = Voucher.objects.create(
        code="TESTOTHER",
        discount_type="amount",
        discount_value=50000.00,
        customer=other_customer,
        starts_at=starts_at,
        expires_at=expires_at,
        status="active",
        usage_limit=1
    )
    response = api_client.post(f"/api/invoices/from-appointment/{appointment.id}/")
    invoice_id = response.data["data"]["id"]
    apply_response = api_client.post(f"/api/invoices/{invoice_id}/apply-voucher/", {"voucher_code": "TESTOTHER"}, format="json")
    assert apply_response.status_code == status.HTTP_400_BAD_REQUEST

@pytest.mark.django_db
def test_earn_loyalty_points(api_client, test_setup):
    receptionist = test_setup["receptionist_user"]
    customer = test_setup["customer"]
    appointment = test_setup["appointment"]
    
    api_client.force_authenticate(user=receptionist)
    
    response = api_client.post(f"/api/invoices/from-appointment/{appointment.id}/")
    invoice_id = response.data["data"]["id"]
    api_client.post(f"/api/invoices/{invoice_id}/issue/")
    
    payment_data = {
        "invoice": invoice_id,
        "amount": "400000.00",
        "method": "cash"
    }
    pay_response = api_client.post("/api/payments/", payment_data, format="json")
    payment_id = pay_response.data["data"]["id"]
    
    success_response = api_client.post(f"/api/payments/{payment_id}/mark-success/")
    assert success_response.status_code == status.HTTP_200_OK
    assert current_balance(customer) == 400000

@pytest.mark.django_db
def test_refund_loyalty_point_reversal(api_client, test_setup):
    receptionist = test_setup["receptionist_user"]
    customer = test_setup["customer"]
    appointment = test_setup["appointment"]
    
    api_client.force_authenticate(user=receptionist)
    
    response = api_client.post(f"/api/invoices/from-appointment/{appointment.id}/")
    invoice_id = response.data["data"]["id"]
    api_client.post(f"/api/invoices/{invoice_id}/issue/")
    
    payment_data = {
        "invoice": invoice_id,
        "amount": "1000.00", # Use a smaller amount for easier point math
        "method": "cash"
    }
    pay_response = api_client.post("/api/payments/", payment_data, format="json")
    payment_id = pay_response.data["data"]["id"]
    
    api_client.post(f"/api/payments/{payment_id}/mark-success/")
    assert current_balance(customer) == 1000
    
    # Refund the payment
    refund_response = api_client.post(f"/api/payments/{payment_id}/refund/")
    assert refund_response.status_code == status.HTTP_200_OK
    # Loyalty balance should be reversed to 0
    assert current_balance(customer) == 0

@pytest.mark.django_db
def test_redeem_loyalty_points(api_client, test_setup):
    user = test_setup["user"]
    customer = test_setup["customer"]
    appointment = test_setup["appointment"]
    
    api_client.force_authenticate(user=user)
    
    add_ledger(user, customer, "earn", 1000, "Initial", None)
    
    response = api_client.post(f"/api/invoices/from-appointment/{appointment.id}/")
    invoice_id = response.data["data"]["id"]
    
    redeem_response = api_client.post(f"/api/invoices/{invoice_id}/use-reward-points/", {"points": 300}, format="json")
    assert redeem_response.status_code == status.HTTP_200_OK
    assert float(redeem_response.data["data"]["reward_discount"]) == 300.00
    assert float(redeem_response.data["data"]["total_due"]) == 399700.00
    assert current_balance(customer) == 700

@pytest.mark.django_db
def test_use_reward_points_insufficient_fails(api_client, test_setup):
    user = test_setup["user"]
    customer = test_setup["customer"]
    appointment = test_setup["appointment"]
    api_client.force_authenticate(user=user)
    
    # Points balance is 0 initially
    response = api_client.post(f"/api/invoices/from-appointment/{appointment.id}/")
    invoice_id = response.data["data"]["id"]
    
    # Try using 500 points
    redeem_response = api_client.post(f"/api/invoices/{invoice_id}/use-reward-points/", {"points": 500}, format="json")
    assert redeem_response.status_code == status.HTTP_400_BAD_REQUEST

@pytest.mark.django_db
def test_adjust_invoice_amount(api_client, test_setup):
    receptionist = test_setup["receptionist_user"]
    appointment = test_setup["appointment"]
    
    api_client.force_authenticate(user=receptionist)
    
    response = api_client.post(f"/api/invoices/from-appointment/{appointment.id}/")
    invoice_id = response.data["data"]["id"]
    
    adjust_data = {
        "amount": "50000.00",
        "reason": "Phụ phí sấy vip"
    }
    adjust_response = api_client.post(f"/api/invoices/{invoice_id}/adjust/", adjust_data, format="json")
    assert adjust_response.status_code == status.HTTP_200_OK
    assert float(adjust_response.data["data"]["total_due"]) == 450000.00
    assert adjust_response.data["data"]["status"] == "adjusted"
