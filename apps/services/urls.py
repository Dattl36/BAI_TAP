from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.services.views import ServiceViewSet


router = DefaultRouter()
router.register("", ServiceViewSet, basename="services")

urlpatterns = [path("", include(router.urls))]
