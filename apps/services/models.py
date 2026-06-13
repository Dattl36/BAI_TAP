from django.conf import settings
from django.db import models

from apps.core.models import SoftDeleteModel, TimeStampedModel


class Service(SoftDeleteModel):
    STATUSES = (("active", "Active"), ("inactive", "Inactive"), ("archived", "Archived"))

    name = models.CharField(max_length=160)
    category = models.CharField(max_length=120, blank=True)
    description = models.TextField(blank=True)
    base_price = models.DecimalField(max_digits=12, decimal_places=2)
    duration_minutes = models.PositiveIntegerField()
    active = models.BooleanField(default=True)
    status = models.CharField(max_length=32, choices=STATUSES, default="active")

    def __str__(self):
        return self.name


class ServicePriceHistory(TimeStampedModel):
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name="price_history")
    old_price = models.DecimalField(max_digits=12, decimal_places=2)
    new_price = models.DecimalField(max_digits=12, decimal_places=2)
    old_duration = models.PositiveIntegerField()
    new_duration = models.PositiveIntegerField()
    changed_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    changed_at = models.DateTimeField(auto_now_add=True)
    reason = models.TextField(blank=True)
