from rest_framework import serializers

from apps.customers.models import CustomerProfile


class CustomerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerProfile
        fields = "__all__"
        read_only_fields = ("code", "is_deleted", "deleted_at", "created_at", "updated_at")


class CustomerHistorySerializer(serializers.Serializer):
    appointments = serializers.ListField()
    invoices = serializers.ListField()
    payments = serializers.ListField()
    feedback = serializers.ListField()
    complaints = serializers.ListField()
    rewards = serializers.ListField()
    notifications = serializers.ListField()
