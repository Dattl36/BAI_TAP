import pytest
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APIClient

User = get_user_model()

@pytest.fixture
def api_client():
    return APIClient()

@pytest.mark.django_db
def test_user_registration_success(api_client):
    register_data = {
        "username": "test_customer",
        "password": "CustomerPassword123!",
        "email": "customer_test@example.com",
        "phone": "0987654321",
        "full_name": "Test Customer"
    }
    response = api_client.post("/api/auth/register/", register_data, format="json")
    
    assert response.status_code == status.HTTP_201_CREATED
    assert "data" in response.data
    assert response.data["data"]["email"] == "customer_test@example.com"
    
    user = User.objects.filter(username="test_customer").first()
    assert user is not None
    assert user.role == "customer"
    assert user.customer_profile is not None

@pytest.mark.django_db
def test_user_registration_failed_duplicate(api_client):
    register_data = {
        "username": "duplicate_user",
        "password": "CustomerPassword123!",
        "email": "dup_test@example.com",
        "phone": "0987654321",
        "full_name": "First Customer"
    }
    api_client.post("/api/auth/register/", register_data, format="json")
    
    response = api_client.post("/api/auth/register/", register_data, format="json")
    assert response.status_code == status.HTTP_400_BAD_REQUEST

@pytest.mark.django_db
def test_user_registration_invalid_email(api_client):
    register_data = {
        "username": "email_user",
        "password": "CustomerPassword123!",
        "email": "not-an-email",
        "phone": "0987654321",
        "full_name": "Email User"
    }
    response = api_client.post("/api/auth/register/", register_data, format="json")
    assert response.status_code == status.HTTP_400_BAD_REQUEST

@pytest.mark.django_db
def test_user_registration_missing_password(api_client):
    register_data = {
        "username": "missing_pass_user",
        "email": "missing@example.com",
        "phone": "0987654321",
        "full_name": "Missing Pass User"
    }
    response = api_client.post("/api/auth/register/", register_data, format="json")
    assert response.status_code == status.HTTP_400_BAD_REQUEST

@pytest.mark.django_db
def test_user_registration_short_password(api_client):
    register_data = {
        "username": "short_pass_user",
        "password": "123",
        "email": "short@example.com",
        "phone": "0987654321",
        "full_name": "Short Pass User"
    }
    response = api_client.post("/api/auth/register/", register_data, format="json")
    assert response.status_code == status.HTTP_400_BAD_REQUEST

@pytest.mark.django_db
def test_user_login_success(api_client):
    user = User.objects.create_user(
        username="login_user",
        password="TestPassword123!",
        email="login_user@example.com",
        role="customer"
    )
    
    login_data = {
        "username": "login_user",
        "password": "TestPassword123!"
    }
    response = api_client.post("/api/auth/login/", login_data, format="json")
    
    assert response.status_code == status.HTTP_200_OK
    assert "access" in response.data["data"]
    assert "refresh" in response.data["data"]

@pytest.mark.django_db
def test_user_login_failed(api_client):
    login_data = {
        "username": "non_existing_user",
        "password": "WrongPassword123!"
    }
    response = api_client.post("/api/auth/login/", login_data, format="json")
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "error" in response.data

@pytest.mark.django_db
def test_user_login_empty_fields(api_client):
    login_data = {
        "username": "",
        "password": ""
    }
    response = api_client.post("/api/auth/login/", login_data, format="json")
    assert response.status_code == status.HTTP_400_BAD_REQUEST

@pytest.mark.django_db
def test_refresh_token(api_client):
    user = User.objects.create_user(
        username="refresh_user",
        password="TestPassword123!",
        email="refresh@example.com",
        role="customer"
    )
    
    # Login to get refresh token
    login_data = {
        "username": "refresh_user",
        "password": "TestPassword123!"
    }
    login_response = api_client.post("/api/auth/login/", login_data, format="json")
    refresh_token = login_response.data["data"]["refresh"]
    
    # Call refresh endpoint
    refresh_data = {"refresh": refresh_token}
    response = api_client.post("/api/auth/token/refresh/", refresh_data, format="json")
    assert response.status_code == status.HTTP_200_OK
    assert "access" in response.data

@pytest.mark.django_db
def test_get_current_user_profile(api_client):
    user = User.objects.create_user(
        username="profile_user",
        password="ProfilePassword123!",
        email="profile_user@example.com",
        role="customer",
        full_name="Profile User",
        phone="0123456789"
    )
    
    api_client.force_authenticate(user=user)
    
    response = api_client.get("/api/auth/me/")
    assert response.status_code == status.HTTP_200_OK
    assert response.data["data"]["username"] == "profile_user"

@pytest.mark.django_db
def test_get_current_user_profile_unauthorized(api_client):
    # No authentication
    response = api_client.get("/api/auth/me/")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

@pytest.mark.django_db
def test_update_current_user_profile(api_client):
    user = User.objects.create_user(
        username="update_user",
        password="UpdatePassword123!",
        email="update_user@example.com",
        role="customer",
        full_name="Old Name"
    )
    
    api_client.force_authenticate(user=user)
    
    update_data = {
        "full_name": "New Name",
        "phone": "0999999999"
    }
    response = api_client.patch("/api/auth/me/", update_data, format="json")
    
    assert response.status_code == status.HTTP_200_OK
    assert response.data["data"]["full_name"] == "New Name"
    
    user.refresh_from_db()
    assert user.full_name == "New Name"
    assert user.phone == "0999999999"
