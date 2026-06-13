from django.conf import settings
from django.db import models

from apps.core.models import SoftDeleteModel, TimeStampedModel


class PaymentTransaction(SoftDeleteModel):
    STATUSES = (
        ("attempted", "Attempted"),
        ("pending", "Pending"),
        ("successful", "Successful"),
        ("failed", "Failed"),
        ("cancelled", "Cancelled"),
        ("refunded", "Refunded"),
        ("adjusted", "Adjusted"),
    )

    invoice = models.ForeignKey("billing.Invoice", on_delete=models.PROTECT, related_name="payments")
    customer = models.ForeignKey("customers.CustomerProfile", on_delete=models.PROTECT, related_name="payments")
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    method = models.CharField(max_length=64)
    status = models.CharField(max_length=32, choices=STATUSES, default="attempted")
    reference_code = models.CharField(max_length=120, blank=True)
    failure_reason = models.TextField(blank=True)
    processed_at = models.DateTimeField(null=True, blank=True)


class PaymentStatusHistory(TimeStampedModel):
    payment = models.ForeignKey(PaymentTransaction, on_delete=models.CASCADE, related_name="status_history")
    old_status = models.CharField(max_length=32, blank=True)
    new_status = models.CharField(max_length=32)
    changed_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    changed_at = models.DateTimeField(auto_now_add=True)
    reason = models.TextField(blank=True)
