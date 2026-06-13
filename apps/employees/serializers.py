from rest_framework import serializers

from apps.employees.models import EmployeeProfile, StaffAvailability


class EmployeeProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployeeProfile
        fields = "__all__"
        read_only_fields = ("employee_code", "is_deleted", "deleted_at", "created_at", "updated_at")


class StaffAvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = StaffAvailability
        fields = "__all__"

    def validate(self, attrs):
        if attrs["end_time"] <= attrs["start_time"]:
            raise serializers.ValidationError("end_time must be after start_time.")
        return attrs
