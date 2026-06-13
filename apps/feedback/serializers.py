from rest_framework import serializers

from apps.feedback.models import Complaint, ComplaintStatusHistory, Feedback


class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = "__all__"
        read_only_fields = ("is_deleted", "deleted_at", "created_at", "updated_at", "closed_at")


class ComplaintStatusHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ComplaintStatusHistory
        fields = "__all__"
        read_only_fields = ("changed_at", "created_at", "updated_at")


class ComplaintSerializer(serializers.ModelSerializer):
    status_history = ComplaintStatusHistorySerializer(many=True, read_only=True)

    class Meta:
        model = Complaint
        fields = "__all__"
        read_only_fields = ("is_deleted", "deleted_at", "created_at", "updated_at", "closed_at")
