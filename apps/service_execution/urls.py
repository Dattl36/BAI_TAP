from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.service_execution.views import ServiceExecutionViewSet


router = DefaultRouter()
router.register("", ServiceExecutionViewSet, basename="service-executions")

urlpatterns = [path("", include(router.urls))]
