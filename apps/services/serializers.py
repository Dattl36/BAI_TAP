from rest_framework import serializers

from apps.services.models import Service, ServicePriceHistory


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = "__all__"
        read_only_fields = ("is_deleted", "deleted_at", "created_at", "updated_at")

    def validate_base_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Giá dịch vụ không thể là số âm.")
        return value


class ServicePriceHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ServicePriceHistory
        fields = "__all__"
        read_only_fields = ("changed_at",)
