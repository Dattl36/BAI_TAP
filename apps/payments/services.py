from django.db import transaction
from django.utils import timezone

from apps.core.audit import record_event
from apps.core.exceptions import BusinessError, ErrorCodes
from apps.payments.models import PaymentStatusHistory, PaymentTransaction


@transaction.atomic
def create_payment(actor, invoice, amount, method, reference_code=""):
    payment = PaymentTransaction.objects.create(
        invoice=invoice,
        customer=invoice.customer,
        amount=amount,
        method=method,
        reference_code=reference_code,
    )
    PaymentStatusHistory.objects.create(payment=payment, old_status="", new_status=payment.status, changed_by=actor)
    record_event(actor, "payment.create", payment)
    return payment


@transaction.atomic
def transition_payment(actor, payment, new_status, reason=""):
    allowed = {
        "attempted": {"pending", "successful", "failed", "cancelled"},
        "pending": {"successful", "failed", "cancelled"},
        "successful": {"refunded", "adjusted"},
    }
    if new_status not in allowed.get(payment.status, set()):
        raise BusinessError("Payment status transition is not allowed.", ErrorCodes.PAYMENT_STATE_ERROR)
    old_status = payment.status
    payment.status = new_status
    payment.processed_at = timezone.now()
    if new_status == "failed":
        payment.failure_reason = reason
    payment.save()
    PaymentStatusHistory.objects.create(payment=payment, old_status=old_status, new_status=new_status, changed_by=actor, reason=reason)
    if new_status == "successful":
        invoice = payment.invoice
        invoice.paid_amount += payment.amount
        invoice.balance_due = invoice.total_due - invoice.paid_amount
        invoice.status = "paid" if invoice.balance_due <= 0 else "partially_paid"
        invoice.save()
    record_event(actor, f"payment.{new_status}", payment)
    return payment
