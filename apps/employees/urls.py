from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.employees.views import EmployeeViewSet, StaffAvailabilityViewSet


router = DefaultRouter()
router.register("", EmployeeViewSet, basename="employees")
router.register("availability-blocks", StaffAvailabilityViewSet, basename="availability-blocks")

urlpatterns = [path("", include(router.urls))]
