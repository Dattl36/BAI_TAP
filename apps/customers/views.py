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

    @action(detail=True, methods=["post"])
    def topup(self, request, pk=None):
        customer = self.get_object()
        amount = request.data.get("amount")
        if not amount:
            from apps.core.exceptions import BusinessError
            raise BusinessError("Số tiền nạp không hợp lệ")
        
        from decimal import Decimal
        from django.db import transaction
        from apps.payments.models import WalletTransaction
        
        with transaction.atomic():
            amount_decimal = Decimal(amount)
            customer.wallet_balance += amount_decimal
            customer.save(update_fields=["wallet_balance"])
            
            tx = WalletTransaction.objects.create(
                customer=customer,
                amount=amount_decimal,
                transaction_type="top_up",
                description="Khách hàng nạp tiền vào ví"
            )
            return success({"wallet_balance": customer.wallet_balance, "transaction_id": tx.id})

    @action(detail=True, methods=["get"])
    def wallet_transactions(self, request, pk=None):
        customer = self.get_object()
        transactions = customer.wallet_transactions.all().order_by("-created_at")
        data = [{
            "id": tx.id,
            "amount": tx.amount,
            "transaction_type": tx.transaction_type,
            "description": tx.description,
            "created_at": tx.created_at
        } for tx in transactions]
        return success(data)
