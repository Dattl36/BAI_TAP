from django.conf import settings
from django.db import models

from apps.core.models import SoftDeleteModel, TimeStampedModel


class Feedback(SoftDeleteModel):
    STATUSES = (("received", "Received"), ("reviewed", "Reviewed"), ("responded", "Responded"), ("closed", "Closed"))

    customer = models.ForeignKey("customers.CustomerProfile", on_delete=models.CASCADE, related_name="feedback")
    appointment = models.ForeignKey("appointments.Appointment", null=True, blank=True, on_delete=models.SET_NULL, related_name="feedback")
    message = models.TextField()
    status = models.CharField(max_length=32, choices=STATUSES, default="received")
    received_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="received_feedback")
    response = models.TextField(blank=True)
    closed_at = models.DateTimeField(null=True, blank=True)


class Complaint(SoftDeleteModel):
    STATUSES = (
        ("received", "Received"),
        ("assigned", "Assigned"),
        ("in_review", "In Review"),
        ("escalated", "Escalated"),
        ("resolved", "Resolved"),
        ("closed", "Closed"),
        ("rejected", "Rejected"),
    )

    customer = models.ForeignKey("customers.CustomerProfile", on_delete=models.CASCADE, related_name="complaints")
    appointment = models.ForeignKey("appointments.Appointment", null=True, blank=True, on_delete=models.SET_NULL, related_name="complaints")
    title = models.CharField(max_length=160)
    description = models.TextField()
    severity = models.CharField(max_length=32, default="normal")
    status = models.CharField(max_length=32, choices=STATUSES, default="received")
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="assigned_complaints")
    escalated_to = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="escalated_complaints")
    resolution = models.TextField(blank=True)
    customer_visible_result = models.TextField(blank=True)
    closed_at = models.DateTimeField(null=True, blank=True)


class ComplaintStatusHistory(TimeStampedModel):
    complaint = models.ForeignKey(Complaint, on_delete=models.CASCADE, related_name="status_history")
    old_status = models.CharField(max_length=32, blank=True)
    new_status = models.CharField(max_length=32)
    changed_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    changed_at = models.DateTimeField(auto_now_add=True)
    note = models.TextField(blank=True)
