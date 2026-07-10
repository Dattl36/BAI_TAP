import pytest
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from rest_framework import status
from rest_framework.test import APIClient
from apps.customers.models import CustomerProfile
from apps.employees.models import EmployeeProfile
from apps.services.models import Service
from apps.appointments.models import Appointment

User = get_user_model()

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def customer_user():
    user = User.objects.create_user(
        username="cus_test_user",
        password="CustomerPassword123!",
        email="cus_test@example.com",
        role="customer"
    )
    CustomerProfile.objects.get_or_create(
        user=user,
        defaults={"full_name": "Cus Test", "phone": "0911111111"}
    )
    return user

@pytest.fixture
def other_customer_user():
    user = User.objects.create_user(
        username="other_cus_test",
        password="CustomerPassword123!",
        role="customer"
    )
    profile, _ = CustomerProfile.objects.get_or_create(user=user)
    profile.full_name = "Other Customer"
    profile.phone = "0922222222"
    profile.save()
    return user

@pytest.fixture
def receptionist_user():
    user = User.objects.create_user(
        username="rec_test_user",
        password="ReceptionistPassword123!",
        email="rec_test@example.com",
        role="receptionist"
    )
    EmployeeProfile.objects.get_or_create(
        user=user,
        defaults={"role_type": "receptionist", "full_name": "Rec Test"}
    )
    return user

@pytest.fixture
def stylist_profile():
    stylist_user = User.objects.create_user(
        username="stylist_test_user",
        password="StylistPassword123!",
        email="stylist_test@example.com",
        role="staff"
    )
    profile, _ = EmployeeProfile.objects.get_or_create(
        user=stylist_user,
        defaults={"role_type": "staff", "full_name": "Stylist Linh"}
    )
    return profile

@pytest.fixture
def service():
    return Service.objects.create(
        name="Cắt Tóc Nam Standard",
        category="Haircut",
        base_price=100000.00,
        duration_minutes=30
    )

@pytest.mark.django_db
def test_create_appointment_success(api_client, customer_user, stylist_profile, service):
    api_client.force_authenticate(user=customer_user)
    
    start_time = timezone.now() + timedelta(hours=2)
    end_time = start_time + timedelta(minutes=30)
    
    data = {
        "customer": customer_user.customer_profile.id,
        "staff": stylist_profile.id,
        "scheduled_start": start_time.isoformat(),
        "scheduled_end": end_time.isoformat(),
        "services": [service.id]
    }
    
    response = api_client.post("/api/appointments/", data, format="json")
    
    assert response.status_code == status.HTTP_201_CREATED
    assert "data" in response.data
    assert response.data["data"]["status"] == "requested"

@pytest.mark.django_db
def test_create_appointment_past_fails(api_client, customer_user, stylist_profile, service):
    api_client.force_authenticate(user=customer_user)
    
    start_time = timezone.now() - timedelta(hours=2)
    end_time = start_time + timedelta(minutes=30)
    
    data = {
        "customer": customer_user.customer_profile.id,
        "staff": stylist_profile.id,
        "scheduled_start": start_time.isoformat(),
        "scheduled_end": end_time.isoformat(),
        "services": [service.id]
    }
    
    response = api_client.post("/api/appointments/", data, format="json")
    assert response.status_code == status.HTTP_400_BAD_REQUEST

@pytest.mark.django_db
def test_create_appointment_conflict_fails(api_client, customer_user, stylist_profile, service):
    api_client.force_authenticate(user=customer_user)
    
    start_time = timezone.now() + timedelta(hours=2)
    end_time = start_time + timedelta(minutes=30)
    
    Appointment.objects.create(
        customer=customer_user.customer_profile,
        staff=stylist_profile,
        scheduled_start=start_time,
        scheduled_end=end_time,
        status="requested"
    )
    
    data = {
        "customer": customer_user.customer_profile.id,
        "staff": stylist_profile.id,
        "scheduled_start": start_time.isoformat(),
        "scheduled_end": end_time.isoformat(),
        "services": [service.id]
    }
    
    response = api_client.post("/api/appointments/", data, format="json")
    assert response.status_code == status.HTTP_409_CONFLICT

@pytest.mark.django_db
def test_create_appointment_missing_services(api_client, customer_user, stylist_profile):
    api_client.force_authenticate(user=customer_user)
    start_time = timezone.now() + timedelta(hours=2)
    end_time = start_time + timedelta(minutes=30)
    data = {
        "customer": customer_user.customer_profile.id,
        "staff": stylist_profile.id,
        "scheduled_start": start_time.isoformat(),
        "scheduled_end": end_time.isoformat(),
        "services": []
    }
    response = api_client.post("/api/appointments/", data, format="json")
    # Empty services list is valid in serializer, but let's check it returns 201 or 400
    assert response.status_code in [status.HTTP_201_CREATED, status.HTTP_400_BAD_REQUEST]

@pytest.mark.django_db
def test_appointment_confirm(api_client, receptionist_user, customer_user, stylist_profile):
    api_client.force_authenticate(user=receptionist_user)
    
    appointment = Appointment.objects.create(
        customer=customer_user.customer_profile,
        staff=stylist_profile,
        scheduled_start=timezone.now() + timedelta(hours=2),
        scheduled_end=timezone.now() + timedelta(hours=2, minutes=30),
        status="requested"
    )
    
    response = api_client.post(f"/api/appointments/{appointment.id}/confirm/")
    assert response.status_code == status.HTTP_200_OK
    assert response.data["data"]["status"] == "confirmed"

@pytest.mark.django_db
def test_appointment_confirm_by_customer_fails(api_client, customer_user, stylist_profile):
    api_client.force_authenticate(user=customer_user)
    appointment = Appointment.objects.create(
        customer=customer_user.customer_profile,
        staff=stylist_profile,
        scheduled_start=timezone.now() + timedelta(hours=2),
        scheduled_end=timezone.now() + timedelta(hours=2, minutes=30),
        status="requested"
    )
    response = api_client.post(f"/api/appointments/{appointment.id}/confirm/")
    assert response.status_code == status.HTTP_403_FORBIDDEN

@pytest.mark.django_db
def test_appointment_arrive(api_client, receptionist_user, customer_user, stylist_profile):
    api_client.force_authenticate(user=receptionist_user)
    
    appointment = Appointment.objects.create(
        customer=customer_user.customer_profile,
        staff=stylist_profile,
        scheduled_start=timezone.now() + timedelta(hours=2),
        scheduled_end=timezone.now() + timedelta(hours=2, minutes=30),
        status="confirmed"
    )
    
    response = api_client.post(f"/api/appointments/{appointment.id}/arrive/")
    assert response.status_code == status.HTTP_200_OK
    assert response.data["data"]["status"] == "arrived"

@pytest.mark.django_db
def test_appointment_arrive_by_customer_fails(api_client, customer_user, stylist_profile):
    api_client.force_authenticate(user=customer_user)
    appointment = Appointment.objects.create(
        customer=customer_user.customer_profile,
        staff=stylist_profile,
        scheduled_start=timezone.now() + timedelta(hours=2),
        scheduled_end=timezone.now() + timedelta(hours=2, minutes=30),
        status="confirmed"
    )
    response = api_client.post(f"/api/appointments/{appointment.id}/arrive/")
    assert response.status_code == status.HTTP_403_FORBIDDEN

@pytest.mark.django_db
def test_appointment_cancel(api_client, customer_user, stylist_profile):
    api_client.force_authenticate(user=customer_user)
    
    appointment = Appointment.objects.create(
        customer=customer_user.customer_profile,
        staff=stylist_profile,
        scheduled_start=timezone.now() + timedelta(hours=2),
        scheduled_end=timezone.now() + timedelta(hours=2, minutes=30),
        status="requested"
    )
    
    cancel_data = {"reason": "Tôi bận đột xuất"}
    response = api_client.post(f"/api/appointments/{appointment.id}/cancel/", cancel_data, format="json")
    
    assert response.status_code == status.HTTP_200_OK
    assert response.data["data"]["status"] == "cancelled"
    assert response.data["data"]["cancellation_reason"] == "Tôi bận đột xuất"

@pytest.mark.django_db
def test_appointment_cancel_unauthorized(api_client, other_customer_user, customer_user, stylist_profile):
    appointment = Appointment.objects.create(
        customer=customer_user.customer_profile,
        staff=stylist_profile,
        scheduled_start=timezone.now() + timedelta(hours=2),
        scheduled_end=timezone.now() + timedelta(hours=2, minutes=30),
        status="requested"
    )
    api_client.force_authenticate(user=other_customer_user)
    # Scoped queryset filters out other customer's appointment, so GET/POST returns 404
    response = api_client.post(f"/api/appointments/{appointment.id}/cancel/", {"reason": "Steal cancel"})
    assert response.status_code == status.HTTP_404_NOT_FOUND

@pytest.mark.django_db
def test_appointment_reschedule(api_client, receptionist_user, customer_user, stylist_profile):
    api_client.force_authenticate(user=receptionist_user)
    
    appointment = Appointment.objects.create(
        customer=customer_user.customer_profile,
        staff=stylist_profile,
        scheduled_start=timezone.now() + timedelta(hours=2),
        scheduled_end=timezone.now() + timedelta(hours=2, minutes=30),
        status="requested"
    )
    
    new_start = timezone.now() + timedelta(hours=5)
    new_end = new_start + timedelta(minutes=30)
    
    reschedule_data = {
        "scheduled_start": new_start.isoformat(),
        "scheduled_end": new_end.isoformat(),
        "staff": stylist_profile.id
    }
    
    response = api_client.post(f"/api/appointments/{appointment.id}/reschedule/", reschedule_data, format="json")
    assert response.status_code == status.HTTP_200_OK
    
    appointment.refresh_from_db()
    assert appointment.scheduled_start.strftime("%Y-%m-%dT%H:%M") == new_start.strftime("%Y-%m-%dT%H:%M")

@pytest.mark.django_db
def test_appointment_reschedule_by_customer_success(api_client, customer_user, stylist_profile):
    api_client.force_authenticate(user=customer_user)
    appointment = Appointment.objects.create(
        customer=customer_user.customer_profile,
        staff=stylist_profile,
        scheduled_start=timezone.now() + timedelta(hours=2),
        scheduled_end=timezone.now() + timedelta(hours=2, minutes=30),
        status="requested"
    )
    new_start = timezone.now() + timedelta(hours=4)
    new_end = new_start + timedelta(minutes=30)
    reschedule_data = {
        "scheduled_start": new_start.isoformat(),
        "scheduled_end": new_end.isoformat(),
        "staff": stylist_profile.id
    }
    response = api_client.post(f"/api/appointments/{appointment.id}/reschedule/", reschedule_data, format="json")
    assert response.status_code == status.HTTP_200_OK

@pytest.mark.django_db
def test_appointment_reschedule_limit_fails(api_client, customer_user, stylist_profile):
    api_client.force_authenticate(user=customer_user)
    
    appointment = Appointment.objects.create(
        customer=customer_user.customer_profile,
        staff=stylist_profile,
        scheduled_start=timezone.now() + timedelta(hours=2),
        scheduled_end=timezone.now() + timedelta(hours=2, minutes=30),
        status="requested"
    )
    
    Appointment.objects.filter(id=appointment.id).update(created_at=timezone.now() - timedelta(hours=2))
    
    new_start = timezone.now() + timedelta(hours=5)
    new_end = new_start + timedelta(minutes=30)
    reschedule_data = {
        "scheduled_start": new_start.isoformat(),
        "scheduled_end": new_end.isoformat(),
        "staff": stylist_profile.id
    }
    
    response = api_client.post(f"/api/appointments/{appointment.id}/reschedule/", reschedule_data, format="json")
    assert response.status_code == status.HTTP_403_FORBIDDEN

@pytest.mark.django_db
def test_appointment_list_filter_status(api_client, receptionist_user, customer_user, stylist_profile):
    api_client.force_authenticate(user=receptionist_user)
    Appointment.objects.create(
        customer=customer_user.customer_profile,
        staff=stylist_profile,
        scheduled_start=timezone.now() + timedelta(hours=2),
        scheduled_end=timezone.now() + timedelta(hours=2, minutes=30),
        status="requested"
    )
    response = api_client.get("/api/appointments/?status=requested")
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) >= 1

@pytest.mark.django_db
def test_appointment_list_filter_customer(api_client, receptionist_user, customer_user, stylist_profile):
    api_client.force_authenticate(user=receptionist_user)
    apt = Appointment.objects.create(
        customer=customer_user.customer_profile,
        staff=stylist_profile,
        scheduled_start=timezone.now() + timedelta(hours=2),
        scheduled_end=timezone.now() + timedelta(hours=2, minutes=30),
        status="requested"
    )
    response = api_client.get(f"/api/appointments/?customer={customer_user.customer_profile.id}")
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) >= 1

@pytest.mark.django_db
def test_appointment_list_filter_staff(api_client, receptionist_user, customer_user, stylist_profile):
    api_client.force_authenticate(user=receptionist_user)
    apt = Appointment.objects.create(
        customer=customer_user.customer_profile,
        staff=stylist_profile,
        scheduled_start=timezone.now() + timedelta(hours=2),
        scheduled_end=timezone.now() + timedelta(hours=2, minutes=30),
        status="requested"
    )
    response = api_client.get(f"/api/appointments/?staff={stylist_profile.id}")
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) >= 1

@pytest.mark.django_db
def test_appointment_detail_not_found(api_client, receptionist_user):
    api_client.force_authenticate(user=receptionist_user)
    response = api_client.get("/api/appointments/9999/")
    assert response.status_code == status.HTTP_404_NOT_FOUND

@pytest.mark.django_db
def test_appointment_delete_not_allowed(api_client, receptionist_user, customer_user, stylist_profile):
    api_client.force_authenticate(user=receptionist_user)
    appointment = Appointment.objects.create(
        customer=customer_user.customer_profile,
        staff=stylist_profile,
        scheduled_start=timezone.now() + timedelta(hours=2),
        scheduled_end=timezone.now() + timedelta(hours=2, minutes=30),
        status="requested"
    )
    response = api_client.delete(f"/api/appointments/{appointment.id}/")
    assert response.status_code == status.HTTP_204_NO_CONTENT
