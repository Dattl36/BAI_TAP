from rest_framework import serializers

from apps.payments.models import PaymentStatusHistory, PaymentTransaction


class PaymentStatusHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentStatusHistory
        fields = "__all__"
        read_only_fields = ("changed_at", "created_at", "updated_at")


class PaymentTransactionSerializer(serializers.ModelSerializer):
    status_history = PaymentStatusHistorySerializer(many=True, read_only=True)

    class Meta:
        model = PaymentTransaction
        fields = "__all__"
        read_only_fields = ("is_deleted", "deleted_at", "created_at", "updated_at")
