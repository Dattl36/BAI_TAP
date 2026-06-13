from rest_framework import viewsets
from rest_framework.decorators import action

from apps.accounts.roles import Roles
from apps.accounts.scopes import scope_queryset
from apps.core.audit import record_event
from apps.core.responses import success
from apps.customers.models import CustomerProfile
from apps.customers.serializers import CustomerProfileSerializer
from apps.customers.services import customer_history


class CustomerViewSet(viewsets.ModelViewSet):
    serializer_class = CustomerProfileSerializer
    allowed_roles = (Roles.CUSTOMER, Roles.RECEPTIONIST, Roles.MANAGER)

    def get_queryset(self):
        return scope_queryset(self.request.user, CustomerProfile.objects.all(), customer_field="user")

    def perform_update(self, serializer):
        instance = serializer.save()
        record_event(self.request.user, "customer.update", instance)

    def perform_destroy(self, instance):
        instance.soft_delete()
        record_event(self.request.user, "customer.archive", instance)

    @action(detail=True, methods=["get"])
    def history(self, request, pk=None):
        return success(customer_history(self.get_object()))
