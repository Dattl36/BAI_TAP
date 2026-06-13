from decimal import Decimal

from django.utils import timezone

from apps.core.exceptions import BusinessError, ErrorCodes
from apps.promotions.models import Voucher, VoucherRedemption


def apply_voucher(actor, invoice, code):
    now = timezone.now()
    voucher = Voucher.objects.get(code=code)
    if voucher.status != "active" or voucher.starts_at > now or voucher.expires_at < now:
        raise BusinessError("Voucher is not active.", ErrorCodes.VOUCHER_NOT_ELIGIBLE)
    if voucher.customer and voucher.customer != invoice.customer:
        raise BusinessError("Voucher does not belong to this customer.", ErrorCodes.VOUCHER_NOT_ELIGIBLE)
    if voucher.used_count >= voucher.usage_limit or invoice.subtotal < voucher.min_invoice:
        raise BusinessError("Voucher is not eligible for this invoice.", ErrorCodes.VOUCHER_NOT_ELIGIBLE)
    discount = voucher.discount_value
    if voucher.discount_type == "percent":
        discount = invoice.subtotal * voucher.discount_value / Decimal("100")
    invoice.discount_total += discount
    invoice.total_due = invoice.subtotal - invoice.discount_total - invoice.reward_discount
    invoice.balance_due = invoice.total_due - invoice.paid_amount
    invoice.save()
    voucher.used_count += 1
    voucher.status = "redeemed" if voucher.used_count >= voucher.usage_limit else voucher.status
    voucher.save()
    VoucherRedemption.objects.create(voucher=voucher, invoice=invoice, redeemed_by=actor, discount_amount=discount)
    return invoice


def apply_reward_discount(invoice, amount):
    invoice.reward_discount += Decimal(str(amount))
    invoice.total_due = invoice.subtotal - invoice.discount_total - invoice.reward_discount
    invoice.balance_due = invoice.total_due - invoice.paid_amount
    invoice.save()
    return invoice
