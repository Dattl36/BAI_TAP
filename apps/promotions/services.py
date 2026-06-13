from django.utils import timezone

from apps.core.audit import record_event


def archive_promotion(actor, promotion):
    promotion.active = False
    promotion.soft_delete()
    record_event(actor, "promotion.archive", promotion)
    return promotion


def cancel_voucher(actor, voucher):
    voucher.status = "cancelled"
    voucher.save(update_fields=["status", "updated_at"])
    record_event(actor, "voucher.cancel", voucher)
    return voucher
