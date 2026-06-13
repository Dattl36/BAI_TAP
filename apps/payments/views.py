from rest_framework import viewsets
from rest_framework.decorators import action

from apps.accounts.scopes import scope_queryset
from apps.billing.models import Invoice
from apps.core.responses import success
from apps.payments.models import PaymentTransaction
from apps.payments.serializers import PaymentStatusHistorySerializer, PaymentTransactionSerializer
from apps.payments.services import create_payment, transition_payment
from apps.promotions.reward_services import award_after_payment, reverse_after_refund


class PaymentViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentTransactionSerializer

    def get_queryset(self):
        return scope_queryset(self.request.user, PaymentTransaction.objects.all())

    def create(self, request, *args, **kwargs):
        invoice = Invoice.objects.get(id=request.data["invoice"])
        payment = create_payment(request.user, invoice, request.data["amount"], request.data["method"], request.data.get("reference_code", ""))
        return success(self.get_serializer(payment).data, "Payment recorded", 201)

    @action(detail=True, methods=["post"], url_path="mark-success")
    def mark_success(self, request, pk=None):
        payment = transition_payment(request.user, self.get_object(), "successful")
        award_after_payment(request.user, payment)
        return success(self.get_serializer(payment).data)

    @action(detail=True, methods=["post"], url_path="mark-failed")
    def mark_failed(self, request, pk=None):
        return success(self.get_serializer(transition_payment(request.user, self.get_object(), "failed", request.data.get("reason", ""))).data)

    @action(detail=True, methods=["post"])
    def refund(self, request, pk=None):
        payment = transition_payment(request.user, self.get_object(), "refunded", request.data.get("reason", ""))
        reverse_after_refund(request.user, payment)
        return success(self.get_serializer(payment).data)

    @action(detail=True, methods=["get"])
    def history(self, request, pk=None):
        return success(PaymentStatusHistorySerializer(self.get_object().status_history.all(), many=True).data)
