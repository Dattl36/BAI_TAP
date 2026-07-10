import pytest
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APIClient
from apps.services.models import Service, ServicePriceHistory

User = get_user_model()

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def manager_user():
    return User.objects.create_user(
        username="service_manager",
        password="ManagerPassword123!",
        email="manager_test@example.com",
        role="manager"
    )

@pytest.mark.django_db
def test_create_service(api_client, manager_user):
    api_client.force_authenticate(user=manager_user)
    
    service_data = {
        "name": "Cắt Tóc Nam Barber",
        "category": "Haircut",
        "description": "Cắt tóc nam chuẩn barber shop",
        "base_price": "150000.00",
        "duration_minutes": 30,
        "status": "active"
    }
    
    response = api_client.post("/api/services/", service_data, format="json")
    
    assert response.status_code == status.HTTP_201_CREATED
    assert response.data["name"] == "Cắt Tóc Nam Barber"
    assert response.data["base_price"] == "150000.00"
    assert Service.objects.filter(name="Cắt Tóc Nam Barber").exists()

@pytest.mark.django_db
def test_create_service_failed_missing_fields(api_client, manager_user):
    api_client.force_authenticate(user=manager_user)
    
    service_data = {
        "name": "",
        "base_price": ""
    }
    response = api_client.post("/api/services/", service_data, format="json")
    assert response.status_code == status.HTTP_400_BAD_REQUEST

@pytest.mark.django_db
def test_create_service_negative_price(api_client, manager_user):
    api_client.force_authenticate(user=manager_user)
    
    service_data = {
        "name": "Invalid Price Service",
        "category": "Haircut",
        "base_price": "-100.00",
        "duration_minutes": 30
    }
    response = api_client.post("/api/services/", service_data, format="json")
    # DRF raises ValidationError for invalid decimals or negative validation depending on validators
    # DecimalField handles formatting, but let's assert 400 for any field error
    assert response.status_code == status.HTTP_400_BAD_REQUEST

@pytest.mark.django_db
def test_create_service_negative_duration(api_client, manager_user):
    api_client.force_authenticate(user=manager_user)
    
    service_data = {
        "name": "Invalid Duration Service",
        "category": "Haircut",
        "base_price": "100000.00",
        "duration_minutes": -30
    }
    response = api_client.post("/api/services/", service_data, format="json")
    assert response.status_code == status.HTTP_400_BAD_REQUEST

@pytest.mark.django_db
def test_update_service_price_history(api_client, manager_user):
    api_client.force_authenticate(user=manager_user)
    
    service = Service.objects.create(
        name="Nhuộm Tóc Cao Cấp",
        category="Color",
        base_price=500000.00,
        duration_minutes=90
    )
    
    update_data = {
        "name": "Nhuộm Tóc Cao Cấp",
        "base_price": 550000.00,
        "duration_minutes": 100,
        "reason": "Tăng giá hóa chất và thời gian phục vụ"
    }
    
    response = api_client.patch(f"/api/services/{service.id}/", update_data, format="json")
    
    assert response.status_code == status.HTTP_200_OK
    assert float(response.data["base_price"]) == 550000.00
    assert response.data["duration_minutes"] == 100
    
    history = ServicePriceHistory.objects.filter(service=service).first()
    assert history is not None
    assert float(history.old_price) == 500000.00
    assert float(history.new_price) == 550000.00
    assert history.old_duration == 90
    assert history.new_duration == 100
    assert history.reason == "Tăng giá hóa chất và thời gian phục vụ"
    assert history.changed_by == manager_user

@pytest.mark.django_db
def test_view_service_price_history(api_client, manager_user):
    api_client.force_authenticate(user=manager_user)
    
    service = Service.objects.create(
        name="Price History Test",
        category="Treatment",
        base_price=200000.00,
        duration_minutes=45
    )
    
    update_data = {
        "name": "Price History Test",
        "base_price": 250000.00,
        "reason": "Update for listing"
    }
    api_client.patch(f"/api/services/{service.id}/", update_data, format="json")
    
    response = api_client.get(f"/api/services/{service.id}/price-history/")
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data["data"]) == 1

@pytest.mark.django_db
def test_archive_service(api_client, manager_user):
    api_client.force_authenticate(user=manager_user)
    
    service = Service.objects.create(
        name="Uốn Phồng Chân Tóc",
        category="Perm",
        base_price=300000.00,
        duration_minutes=60
    )
    
    response = api_client.delete(f"/api/services/{service.id}/")
    assert response.status_code == status.HTTP_204_NO_CONTENT
    
    service.refresh_from_db()
    assert service.active is False
    assert service.status == "archived"
    assert service.is_deleted is True

@pytest.mark.django_db
def test_update_service_status_archived(api_client, manager_user):
    api_client.force_authenticate(user=manager_user)
    service = Service.objects.create(
        name="Status Service",
        category="Perm",
        base_price=300000.00,
        duration_minutes=60,
        status="active"
    )
    response = api_client.patch(f"/api/services/{service.id}/", {"status": "archived"}, format="json")
    assert response.status_code == status.HTTP_200_OK
    assert response.data["status"] == "archived"

@pytest.mark.django_db
def test_search_filter_services_by_category(api_client, manager_user):
    api_client.force_authenticate(user=manager_user)
    
    Service.objects.create(name="Haircut A", category="Haircut", base_price=100000.00, duration_minutes=30)
    Service.objects.create(name="Perm A", category="Perm", base_price=200000.00, duration_minutes=60)
    
    response = api_client.get("/api/services/?category=Haircut")
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) >= 1
    assert response.data[0]["category"] == "Haircut"

@pytest.mark.django_db
def test_get_service_detail(api_client, manager_user):
    api_client.force_authenticate(user=manager_user)
    
    service = Service.objects.create(
        name="Detail Service",
        category="Haircut",
        base_price=150000.00,
        duration_minutes=45
    )
    response = api_client.get(f"/api/services/{service.id}/")
    assert response.status_code == status.HTTP_200_OK
    assert response.data["name"] == "Detail Service"

@pytest.mark.django_db
def test_get_service_detail_not_found(api_client, manager_user):
    api_client.force_authenticate(user=manager_user)
    response = api_client.get("/api/services/99999/")
    assert response.status_code == status.HTTP_404_NOT_FOUND

@pytest.mark.django_db
def test_list_active_services(api_client, manager_user):
    api_client.force_authenticate(user=manager_user)
    Service.objects.create(name="Active Srv", category="Haircut", base_price=100.0, duration_minutes=30, active=True)
    Service.objects.create(name="Inactive Srv", category="Haircut", base_price=100.0, duration_minutes=30, active=False)
    
    response = api_client.get("/api/services/")
    assert response.status_code == status.HTTP_200_OK
    # By default, inactive services are not returned for customers/receptionists, but managers might see all.
    # Since we authenticated as manager, we check we get results
    assert len(response.data) >= 1

@pytest.mark.django_db
def test_manager_cannot_create_service_without_name(api_client, manager_user):
    api_client.force_authenticate(user=manager_user)
    data = {"category": "Haircut", "base_price": "100000.00", "duration_minutes": 30}
    response = api_client.post("/api/services/", data, format="json")
    assert response.status_code == status.HTTP_400_BAD_REQUEST

@pytest.mark.django_db
def test_unauthenticated_user_cannot_create_service(api_client):
    data = {"name": "No Auth", "category": "Haircut", "base_price": "100.00", "duration_minutes": 30}
    response = api_client.post("/api/services/", data, format="json")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

@pytest.mark.django_db
def test_customer_cannot_update_service(api_client):
    customer = User.objects.create_user(
        username="srv_customer",
        password="CustomerPassword123!",
        role="customer"
    )
    service = Service.objects.create(
        name="Standard Service",
        category="Haircut",
        base_price=100000.00,
        duration_minutes=30
    )
    
    api_client.force_authenticate(user=customer)
    
    response = api_client.patch(f"/api/services/{service.id}/", {"base_price": "120000.00"}, format="json")
    assert response.status_code == status.HTTP_403_FORBIDDEN
