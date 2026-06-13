from django.db import models

from apps.core.models import SoftDeleteModel, TimeStampedModel


class Invoice(SoftDeleteModel):
    STATUSES = (
        ("draft", "Draft"),
        ("issued", "Issued"),
        ("partially_paid", "Partially Paid"),
        ("paid", "Paid"),
        ("adjusted", "Adjusted"),
        ("cancelled", "Cancelled"),
    )

    customer = models.ForeignKey("customers.CustomerProfile", on_delete=models.PROTECT, related_name="invoices")
    appointment = models.OneToOneField("appointments.Appointment", on_delete=models.PROTECT, related_name="invoice")
    status = models.CharField(max_length=32, choices=STATUSES, default="draft")
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    discount_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    reward_discount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_due = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    paid_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    balance_due = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    issued_at = models.DateTimeField(null=True, blank=True)


class InvoiceItem(TimeStampedModel):
    TYPES = (("service", "Service"), ("incidental", "Incidental"), ("adjustment", "Adjustment"))

    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name="items")
    item_type = models.CharField(max_length=32, choices=TYPES)
    service = models.ForeignKey("services.Service", null=True, blank=True, on_delete=models.SET_NULL)
    description = models.CharField(max_length=255)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    line_total = models.DecimalField(max_digits=12, decimal_places=2)
