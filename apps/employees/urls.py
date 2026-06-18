from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.employees.views import EmployeeViewSet, StaffAvailabilityViewSet


router = DefaultRouter()
router.register("availability-blocks", StaffAvailabilityViewSet, basename="availability-blocks")
router.register("", EmployeeViewSet, basename="employees")

urlpatterns = [path("", include(router.urls))]
