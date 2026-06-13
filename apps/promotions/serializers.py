from rest_framework import serializers

from apps.promotions.models import Promotion, RewardPointLedger, Voucher, VoucherRedemption


class PromotionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Promotion
        fields = "__all__"
        read_only_fields = ("is_deleted", "deleted_at", "created_at", "updated_at")


class VoucherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Voucher
        fields = "__all__"
        read_only_fields = ("used_count", "is_deleted", "deleted_at", "created_at", "updated_at")


class VoucherRedemptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = VoucherRedemption
        fields = "__all__"
        read_only_fields = ("redeemed_at", "created_at", "updated_at")


class RewardPointLedgerSerializer(serializers.ModelSerializer):
    class Meta:
        model = RewardPointLedger
        fields = "__all__"
        read_only_fields = ("created_at", "updated_at")
