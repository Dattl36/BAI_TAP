from django.conf import settings
from django.db import models

from apps.core.models import SoftDeleteModel, TimeStampedModel


class EmployeeProfile(SoftDeleteModel):
    ROLE_TYPES = (("receptionist", "Receptionist"), ("staff", "Staff"), ("manager", "Manager"))
    STATUSES = (("active", "Active"), ("inactive", "Inactive"), ("archived", "Archived"))

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="employee_profile")
    employee_code = models.CharField(max_length=32, unique=True, blank=True)
    role_type = models.CharField(max_length=32, choices=ROLE_TYPES)
    full_name = models.CharField(max_length=160)
    phone = models.CharField(max_length=32, blank=True)
    specialties = models.TextField(blank=True)
    employment_status = models.CharField(max_length=32, choices=STATUSES, default="active")

    def save(self, *args, **kwargs):
        if not self.employee_code and self.pk:
            self.employee_code = f"EMP{self.pk:05d}"
        super().save(*args, **kwargs)
        if not self.employee_code:
            self.employee_code = f"EMP{self.pk:05d}"
            super().save(update_fields=["employee_code"])

    def __str__(self):
        return self.full_name


class StaffAvailability(TimeStampedModel):
    TYPES = (("available", "Available"), ("unavailable", "Unavailable"))

    employee = models.ForeignKey(EmployeeProfile, on_delete=models.CASCADE, related_name="availability_blocks")
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    availability_type = models.CharField(max_length=32, choices=TYPES, default="available")
    reason = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ["date", "start_time"]
