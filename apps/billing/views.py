from rest_framework import viewsets
from rest_framework.decorators import action

from apps.accounts.scopes import scope_queryset
from apps.appointments.models import Appointment
from apps.billing.discount_services import apply_voucher
from apps.billing.models import Invoice
from apps.billing.serializers import DiscountRequestSerializer, InvoiceSerializer
from apps.billing.services import adjust_invoice, create_invoice_from_appointment, issue_invoice
from apps.core.responses import success
from apps.promotions.reward_services import redeem_points


class InvoiceViewSet(viewsets.ModelViewSet):
    serializer_class = InvoiceSerializer

    def get_queryset(self):
        return scope_queryset(self.request.user, Invoice.objects.all())

    @action(detail=False, methods=["post"], url_path=r"from-appointment/(?P<appointment_id>[^/.]+)")
    def from_appointment(self, request, appointment_id=None):
        invoice = create_invoice_from_appointment(request.user, Appointment.objects.get(id=appointment_id))
        return success(self.get_serializer(invoice).data, "Invoice created", 201)

    @action(detail=True, methods=["post"], url_path="apply-voucher")
    def apply_voucher_action(self, request, pk=None):
        serializer = DiscountRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        invoice = apply_voucher(request.user, self.get_object(), serializer.validated_data["voucher_code"])
        return success(self.get_serializer(invoice).data)

    @action(detail=True, methods=["post"], url_path="use-reward-points")
    def use_reward_points(self, request, pk=None):
        serializer = DiscountRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        invoice = redeem_points(request.user, self.get_object(), serializer.validated_data["points"])
        return success(self.get_serializer(invoice).data)

    @action(detail=True, methods=["post"])
    def issue(self, request, pk=None):
        return success(self.get_serializer(issue_invoice(request.user, self.get_object())).data)

    @action(detail=True, methods=["post"])
    def adjust(self, request, pk=None):
        invoice = adjust_invoice(request.user, self.get_object(), request.data.get("amount", 0), request.data.get("reason", ""))
        return success(self.get_serializer(invoice).data)
