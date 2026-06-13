from rest_framework import serializers

from apps.appointments.models import Appointment, AppointmentService


class AppointmentServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppointmentService
        fields = "__all__"


class AppointmentSerializer(serializers.ModelSerializer):
    appointment_services = AppointmentServiceSerializer(many=True, read_only=True)

    class Meta:
        model = Appointment
        fields = "__all__"
        read_only_fields = ("is_deleted", "deleted_at", "created_at", "updated_at")

    def validate(self, attrs):
        start = attrs.get("scheduled_start", getattr(self.instance, "scheduled_start", None))
        end = attrs.get("scheduled_end", getattr(self.instance, "scheduled_end", None))
        if start and end and end <= start:
            raise serializers.ValidationError("scheduled_end must be after scheduled_start.")
        return attrs


class AppointmentTransitionSerializer(serializers.Serializer):
    reason = serializers.CharField(required=False, allow_blank=True)
    scheduled_start = serializers.DateTimeField(required=False)
    scheduled_end = serializers.DateTimeField(required=False)
    staff = serializers.IntegerField(required=False)
