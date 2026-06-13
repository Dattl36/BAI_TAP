from rest_framework import serializers

from apps.billing.models import Invoice, InvoiceItem


class InvoiceItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceItem
        fields = "__all__"
        read_only_fields = ("created_at", "updated_at")


class InvoiceSerializer(serializers.ModelSerializer):
    items = InvoiceItemSerializer(many=True, read_only=True)

    class Meta:
        model = Invoice
        fields = "__all__"
        read_only_fields = ("is_deleted", "deleted_at", "created_at", "updated_at")


class DiscountRequestSerializer(serializers.Serializer):
    voucher_code = serializers.CharField(required=False)
    points = serializers.IntegerField(required=False, min_value=1)
