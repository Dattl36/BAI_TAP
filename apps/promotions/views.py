from rest_framework import viewsets
from rest_framework.decorators import action

from apps.accounts.roles import Roles
from apps.accounts.scopes import scope_queryset
from apps.core.responses import success
from apps.promotions.models import Promotion, RewardPointLedger, Voucher
from apps.promotions.reward_services import add_ledger
from apps.promotions.serializers import PromotionSerializer, RewardPointLedgerSerializer, VoucherSerializer
from apps.promotions.services import archive_promotion, cancel_voucher


class PromotionViewSet(viewsets.ModelViewSet):
    serializer_class = PromotionSerializer

    def get_queryset(self):
        if getattr(self.request.user, "role", None) == Roles.MANAGER:
            return Promotion.all_objects.all()
        return Promotion.objects.filter(active=True)

    @action(detail=True, methods=["post"])
    def archive(self, request, pk=None):
        return success(self.get_serializer(archive_promotion(request.user, self.get_object())).data)


class VoucherViewSet(viewsets.ModelViewSet):
    serializer_class = VoucherSerializer

    def get_queryset(self):
        return scope_queryset(self.request.user, Voucher.objects.all())

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        return success(self.get_serializer(cancel_voucher(request.user, self.get_object())).data)


class RewardLedgerViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = RewardPointLedgerSerializer

    def get_queryset(self):
        return scope_queryset(self.request.user, RewardPointLedger.objects.all())

    @action(detail=False, methods=["post"])
    def adjust(self, request):
        customer_id = request.data["customer"]
        from apps.customers.models import CustomerProfile

        entry = add_ledger(request.user, CustomerProfile.objects.get(id=customer_id), "adjust", int(request.data["points"]), request.data.get("reason", ""))
        return success(self.get_serializer(entry).data, "Reward adjusted", 201)
