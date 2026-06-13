from django.conf import settings
from django.db import models

from apps.core.models import SoftDeleteModel, TimeStampedModel


class Promotion(SoftDeleteModel):
    DISCOUNT_TYPES = (("percent", "Percent"), ("amount", "Amount"))

    name = models.CharField(max_length=160)
    description = models.TextField(blank=True)
    discount_type = models.CharField(max_length=32, choices=DISCOUNT_TYPES)
    discount_value = models.DecimalField(max_digits=12, decimal_places=2)
    starts_at = models.DateTimeField()
    ends_at = models.DateTimeField()
    active = models.BooleanField(default=True)
    usage_limit = models.PositiveIntegerField(null=True, blank=True)
    service_scope = models.ManyToManyField("services.Service", blank=True, related_name="promotions")


class Voucher(SoftDeleteModel):
    STATUSES = (("active", "Active"), ("redeemed", "Redeemed"), ("expired", "Expired"), ("cancelled", "Cancelled"))
    DISCOUNT_TYPES = (("percent", "Percent"), ("amount", "Amount"))

    code = models.CharField(max_length=64, unique=True)
    customer = models.ForeignKey("customers.CustomerProfile", null=True, blank=True, on_delete=models.CASCADE, related_name="vouchers")
    promotion = models.ForeignKey(Promotion, null=True, blank=True, on_delete=models.SET_NULL, related_name="vouchers")
    discount_type = models.CharField(max_length=32, choices=DISCOUNT_TYPES)
    discount_value = models.DecimalField(max_digits=12, decimal_places=2)
    min_invoice = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    starts_at = models.DateTimeField()
    expires_at = models.DateTimeField()
    status = models.CharField(max_length=32, choices=STATUSES, default="active")
    usage_limit = models.PositiveIntegerField(default=1)
    used_count = models.PositiveIntegerField(default=0)


class VoucherRedemption(TimeStampedModel):
    voucher = models.ForeignKey(Voucher, on_delete=models.PROTECT, related_name="redemptions")
    invoice = models.OneToOneField("billing.Invoice", on_delete=models.CASCADE, related_name="voucher_redemption")
    redeemed_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    redeemed_at = models.DateTimeField(auto_now_add=True)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2)


class RewardPointLedger(TimeStampedModel):
    TYPES = (("earn", "Earn"), ("redeem", "Redeem"), ("adjust", "Adjust"), ("expire", "Expire"), ("reverse", "Reverse"))

    customer = models.ForeignKey("customers.CustomerProfile", on_delete=models.CASCADE, related_name="reward_ledger")
    invoice = models.ForeignKey("billing.Invoice", null=True, blank=True, on_delete=models.SET_NULL, related_name="reward_entries")
    movement_type = models.CharField(max_length=32, choices=TYPES)
    points = models.IntegerField()
    balance_after = models.IntegerField()
    reason = models.TextField(blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
