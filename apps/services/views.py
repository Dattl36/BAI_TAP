from rest_framework import viewsets
from rest_framework.decorators import action

from apps.accounts.roles import Roles
from apps.core.responses import success
from apps.services.models import Service
from apps.services.serializers import ServicePriceHistorySerializer, ServiceSerializer
from apps.services.services import update_service_catalog


class ServiceViewSet(viewsets.ModelViewSet):
    serializer_class = ServiceSerializer

    def get_queryset(self):
        if getattr(self.request.user, "role", None) == Roles.MANAGER:
            return Service.all_objects.all()
        return Service.objects.filter(active=True, status="active")

    def perform_update(self, serializer):
        service = self.get_object()
        update_service_catalog(self.request.user, service, **serializer.validated_data)

    def perform_destroy(self, instance):
        instance.active = False
        instance.status = "archived"
        instance.save(update_fields=["active", "status", "updated_at"])
        instance.soft_delete()

    @action(detail=True, methods=["get"], url_path="price-history")
    def price_history(self, request, pk=None):
        service = self.get_object()
        return success(ServicePriceHistorySerializer(service.price_history.all(), many=True).data)
