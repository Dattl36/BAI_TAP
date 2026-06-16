from rest_framework import serializers

from apps.promotions.models import Promotion, RewardPointLedger, Voucher, VoucherRedemption


class PromotionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Promotion
        fields = "__all__"
        read_only_fields = ("is_deleted", "deleted_at", "created_at", "updated_at")


class VoucherSerializer(serializers.ModelSerializer):
    title = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()
    start_date = serializers.DateTimeField(source="starts_at", read_only=True)
    end_date = serializers.DateTimeField(source="expires_at", read_only=True)
    quantity = serializers.IntegerField(source="usage_limit", read_only=True)
    is_active = serializers.SerializerMethodField()

    class Meta:
        model = Voucher
        fields = [
            "id", "code", "customer", "promotion", "discount_type", "discount_value",
            "min_invoice", "starts_at", "expires_at", "status", "usage_limit", "used_count",
            "title", "name", "description", "start_date", "end_date", "quantity", "is_active"
        ]
        read_only_fields = ("used_count", "is_deleted", "deleted_at", "created_at", "updated_at")

    def get_title(self, obj):
        return obj.promotion.name if obj.promotion else "Voucher Ưu Đãi"

    def get_name(self, obj):
        return obj.promotion.name if obj.promotion else "Voucher Ưu Đãi"

    def get_description(self, obj):
        return obj.promotion.description if obj.promotion else "Ưu đãi tự chăm sóc bản thân từ Salon."

    def get_is_active(self, obj):
        return obj.status == "active"


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
