from django.db import transaction
from django.utils import timezone

from apps.core.audit import record_event
from apps.core.exceptions import BusinessError, ErrorCodes
from apps.notifications.services import notify_user
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
        if payment.method == "wallet":
            from apps.payments.models import WalletTransaction
            customer = payment.customer
            if customer.wallet_balance < payment.amount:
                raise BusinessError("Số dư ví không đủ để thanh toán", ErrorCodes.PAYMENT_STATE_ERROR)
            customer.wallet_balance -= payment.amount
            customer.save(update_fields=["wallet_balance"])
            WalletTransaction.objects.create(
                customer=customer,
                amount=payment.amount,
                transaction_type="payment",
                description=f"Thanh toán hóa đơn #{payment.invoice.id}"
            )

        invoice = payment.invoice
        invoice.paid_amount += payment.amount
        invoice.balance_due = invoice.total_due - invoice.paid_amount
        invoice.status = "paid" if invoice.balance_due <= 0 else "partially_paid"
        invoice.save()
        notify_user(
            user=payment.customer.user,
            category="payment",
            title="Payment Successful",
            message=f"We have received your payment of {payment.amount:,.0f} VND. Thank you!",
            related=payment
        )
    record_event(actor, f"payment.{new_status}", payment)
    return payment
