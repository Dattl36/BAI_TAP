from rest_framework import serializers

from apps.service_execution.models import ServiceExecution, ServiceIncidental


class ServiceIncidentalSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceIncidental
        fields = "__all__"
        read_only_fields = ("created_at", "updated_at")


class ServiceExecutionSerializer(serializers.ModelSerializer):
    incidentals = ServiceIncidentalSerializer(many=True, read_only=True)

    class Meta:
        model = ServiceExecution
        fields = "__all__"
        read_only_fields = ("created_at", "updated_at")
