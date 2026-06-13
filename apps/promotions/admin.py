from django.contrib import admin

from apps.promotions.models import Promotion, RewardPointLedger, Voucher, VoucherRedemption


@admin.register(Promotion)
class PromotionAdmin(admin.ModelAdmin):
    list_display = ("name", "discount_type", "discount_value", "starts_at", "ends_at", "active")
    list_filter = ("active", "discount_type")


@admin.register(Voucher)
class VoucherAdmin(admin.ModelAdmin):
    list_display = ("code", "customer", "discount_type", "discount_value", "status", "used_count", "usage_limit")
    list_filter = ("status", "discount_type")


@admin.register(VoucherRedemption)
class VoucherRedemptionAdmin(admin.ModelAdmin):
    list_display = ("voucher", "invoice", "discount_amount", "redeemed_at")


@admin.register(RewardPointLedger)
class RewardPointLedgerAdmin(admin.ModelAdmin):
    list_display = ("customer", "movement_type", "points", "balance_after", "created_at")
    list_filter = ("movement_type",)
