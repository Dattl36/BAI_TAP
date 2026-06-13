from django.db import models

from apps.core.models import TimeStampedModel


class ServiceExecution(TimeStampedModel):
    STATUSES = (("pending", "Pending"), ("in_progress", "In Progress"), ("completed", "Completed"), ("cancelled", "Cancelled"))

    appointment = models.OneToOneField("appointments.Appointment", on_delete=models.CASCADE, related_name="execution")
    staff = models.ForeignKey("employees.EmployeeProfile", on_delete=models.PROTECT, related_name="service_executions")
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    result_notes = models.TextField(blank=True)
    status = models.CharField(max_length=32, choices=STATUSES, default="pending")


class ServiceIncidental(TimeStampedModel):
    TYPES = (("service", "Service"), ("product", "Product"), ("other", "Other"))

    execution = models.ForeignKey(ServiceExecution, on_delete=models.CASCADE, related_name="incidentals")
    item_type = models.CharField(max_length=32, choices=TYPES, default="other")
    description = models.CharField(max_length=255)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    added_by = models.ForeignKey("employees.EmployeeProfile", null=True, blank=True, on_delete=models.SET_NULL)

    @property
    def line_total(self):
        return self.quantity * self.unit_price
