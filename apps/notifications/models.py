from django.conf import settings
from django.db import models

from apps.core.models import SoftDeleteModel


class Notification(SoftDeleteModel):
    STATUSES = (("created", "Created"), ("delivered", "Delivered"), ("read", "Read"), ("failed", "Failed"))

    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications")
    category = models.CharField(max_length=64)
    title = models.CharField(max_length=160)
    message = models.TextField()
    related_object_type = models.CharField(max_length=120, blank=True)
    related_object_id = models.CharField(max_length=64, blank=True)
    delivery_status = models.CharField(max_length=32, choices=STATUSES, default="created")
    read_at = models.DateTimeField(null=True, blank=True)
