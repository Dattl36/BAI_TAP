from apps.billing.discount_services import apply_reward_discount
from apps.core.audit import record_event
from apps.core.exceptions import BusinessError, ErrorCodes
from apps.promotions.models import RewardPointLedger


def current_balance(customer):
    last = RewardPointLedger.objects.filter(customer=customer).order_by("-created_at", "-id").first()
    return last.balance_after if last else 0


def add_ledger(actor, customer, movement_type, points, reason="", invoice=None):
    balance = current_balance(customer) + points
    if balance < 0:
        raise BusinessError("Insufficient reward points.", ErrorCodes.INSUFFICIENT_REWARD_POINTS)
    entry = RewardPointLedger.objects.create(
        customer=customer,
        invoice=invoice,
        movement_type=movement_type,
        points=points,
        balance_after=balance,
        reason=reason,
        created_by=actor,
    )
    record_event(actor, f"reward.{movement_type}", entry)
    return entry


def redeem_points(actor, invoice, points):
    add_ledger(actor, invoice.customer, "redeem", -abs(points), "Redeemed for invoice", invoice)
    apply_reward_discount(invoice, abs(points))
    return invoice


def award_after_payment(actor, payment):
    points = int(payment.amount)
    return add_ledger(actor, payment.customer, "earn", points, "Earned after payment", payment.invoice)


def reverse_after_refund(actor, payment):
    points = -int(payment.amount)
    return add_ledger(actor, payment.customer, "reverse", points, "Reversed after refund", payment.invoice)
