from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.appointments.views import AppointmentViewSet


router = DefaultRouter()
router.register("", AppointmentViewSet, basename="appointments")

urlpatterns = [path("", include(router.urls))]
