import pytest
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APIClient
from django.utils import timezone
from datetime import timedelta
from apps.customers.models import CustomerProfile
from apps.employees.models import EmployeeProfile
from apps.appointments.models import Appointment

User = get_user_model()

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def manager_user():
    return User.objects.create_user(
        username="perm_manager",
        password="ManagerPassword123!",
        email="perm_mgr@example.com",
        role="manager"
    )

@pytest.fixture
def customer_user():
    user = User.objects.create_user(
        username="perm_customer",
        password="CustomerPassword123!",
        email="perm_cus@example.com",
        role="customer"
    )
    profile, _ = CustomerProfile.objects.get_or_create(user=user)
    profile.full_name = "Perm Customer"
    profile.phone = "0911111111"
    profile.save()
    return user

@pytest.fixture
def receptionist_user():
    user = User.objects.create_user(
        username="perm_receptionist",
        password="ReceptionistPassword123!",
        email="perm_rec@example.com",
        role="receptionist"
    )
    EmployeeProfile.objects.create(user=user, role_type="receptionist", full_name="Perm Receptionist")
    return user

@pytest.fixture
def stylist_user():
    user = User.objects.create_user(
        username="perm_stylist",
        password="StylistPassword123!",
        email="perm_sty@example.com",
        role="staff"
    )
    EmployeeProfile.objects.create(user=user, role_type="staff", full_name="Perm Stylist")
    return user

@pytest.fixture
def target_user():
    return User.objects.create_user(
        username="deactivate_me",
        password="TargetPassword123!",
        email="target@example.com",
        role="staff"
    )

@pytest.mark.django_db
def test_manager_can_access_accounts_api(api_client, manager_user):
    api_client.force_authenticate(user=manager_user)
    response = api_client.get("/api/accounts/")
    assert response.status_code == status.HTTP_200_OK

@pytest.mark.django_db
def test_customer_cannot_access_accounts_api(api_client, customer_user):
    api_client.force_authenticate(user=customer_user)
    response = api_client.get("/api/accounts/")
    assert response.status_code == status.HTTP_403_FORBIDDEN

@pytest.mark.django_db
def test_receptionist_cannot_access_accounts_api(api_client, receptionist_user):
    api_client.force_authenticate(user=receptionist_user)
    response = api_client.get("/api/accounts/")
    assert response.status_code == status.HTTP_403_FORBIDDEN

@pytest.mark.django_db
def test_stylist_cannot_access_accounts_api(api_client, stylist_user):
    api_client.force_authenticate(user=stylist_user)
    response = api_client.get("/api/accounts/")
    assert response.status_code == status.HTTP_403_FORBIDDEN

@pytest.mark.django_db
def test_manager_can_deactivate_user(api_client, manager_user, target_user):
    api_client.force_authenticate(user=manager_user)
    
    response = api_client.post(f"/api/accounts/{target_user.id}/deactivate/")
    assert response.status_code == status.HTTP_200_OK
    
    target_user.refresh_from_db()
    assert target_user.account_status == "inactive"
    assert target_user.is_active is False

@pytest.mark.django_db
def test_customer_cannot_deactivate_user(api_client, customer_user, target_user):
    api_client.force_authenticate(user=customer_user)
    
    response = api_client.post(f"/api/accounts/{target_user.id}/deactivate/")
    assert response.status_code == status.HTTP_403_FORBIDDEN
    
    target_user.refresh_from_db()
    assert target_user.is_active is True

@pytest.mark.django_db
def test_receptionist_can_view_all_appointments(api_client, receptionist_user, customer_user, stylist_user):
    api_client.force_authenticate(user=receptionist_user)
    
    Appointment.objects.create(
        customer=customer_user.customer_profile,
        staff=stylist_user.employee_profile,
        scheduled_start=timezone.now() + timedelta(hours=2),
        scheduled_end=timezone.now() + timedelta(hours=3),
        status="requested"
    )
    
    response = api_client.get("/api/appointments/")
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) >= 1

@pytest.mark.django_db
def test_stylist_only_views_assigned_appointments(api_client, stylist_user, customer_user):
    Appointment.objects.create(
        customer=customer_user.customer_profile,
        staff=stylist_user.employee_profile,
        scheduled_start=timezone.now() + timedelta(hours=2),
        scheduled_end=timezone.now() + timedelta(hours=3),
        status="requested"
    )
    
    other_stylist_user = User.objects.create_user(
        username="other_stylist", password="StylistPassword123!", role="staff"
    )
    other_stylist = EmployeeProfile.objects.create(
        user=other_stylist_user, role_type="staff", full_name="Other Stylist"
    )
    Appointment.objects.create(
        customer=customer_user.customer_profile,
        staff=other_stylist,
        scheduled_start=timezone.now() + timedelta(hours=2),
        scheduled_end=timezone.now() + timedelta(hours=3),
        status="requested"
    )
    
    api_client.force_authenticate(user=stylist_user)
    response = api_client.get("/api/appointments/")
    
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 1
    assert response.data[0]["staff"] == stylist_user.employee_profile.id

@pytest.mark.django_db
def test_anonymous_user_blocked(api_client):
    response = api_client.get("/api/appointments/")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

@pytest.mark.django_db
def test_anonymous_user_blocked_accounts(api_client):
    response = api_client.get("/api/accounts/")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
