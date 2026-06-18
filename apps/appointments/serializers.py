from rest_framework import serializers

from apps.appointments.models import Appointment, AppointmentService


class AppointmentServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppointmentService
        fields = "__all__"


class AppointmentSerializer(serializers.ModelSerializer):
    appointment_services = AppointmentServiceSerializer(many=True, read_only=True)
    customer_details = serializers.SerializerMethodField()
    employee_details = serializers.SerializerMethodField()
    service_details = serializers.SerializerMethodField()

    class Meta:
        model = Appointment
        fields = "__all__"
        read_only_fields = ("is_deleted", "deleted_at", "created_at", "updated_at")

    services = serializers.ListField(child=serializers.IntegerField(), write_only=True, required=False)

    def get_customer_details(self, obj):
        return {"full_name": obj.customer.full_name, "phone": obj.customer.phone} if obj.customer else None

    def get_employee_details(self, obj):
        return {"full_name": obj.staff.full_name} if obj.staff else None

    def get_service_details(self, obj):
        first_service = obj.appointment_services.first()
        return {"name": first_service.service.name} if first_service else None

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
