from django.db import transaction
from django.utils import timezone

from apps.billing.models import Invoice
from apps.billing.services import ZERO, _money, _recalculate_invoice
from apps.core.audit import record_event
from apps.core.exceptions import BusinessError, ErrorCodes
from apps.customers.models import CustomerProfile
from apps.notifications.services import notify_user
from apps.payments.models import PaymentStatusHistory, PaymentTransaction, WalletTransaction


@transaction.atomic
def create_payment(actor, invoice, amount, method, reference_code=""):
    amount = _money(amount)
    if amount <= ZERO:
        raise BusinessError("So tien thanh toan phai lon hon 0.", ErrorCodes.VALIDATION_ERROR)

    invoice = Invoice.objects.select_for_update().get(id=invoice.id)
    if amount > invoice.balance_due:
        raise BusinessError("So tien thanh toan vuot qua so tien con lai.", ErrorCodes.PAYMENT_STATE_ERROR)

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
    payment = PaymentTransaction.objects.select_for_update().select_related("invoice", "customer").get(id=payment.id)
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
        invoice = Invoice.objects.select_for_update().get(id=payment.invoice_id)
        if payment.amount > invoice.balance_due:
            raise BusinessError("So tien thanh toan vuot qua so tien con lai.", ErrorCodes.PAYMENT_STATE_ERROR)

        if payment.method == "wallet":
            customer = CustomerProfile.objects.select_for_update().get(id=payment.customer_id)
            if customer.wallet_balance < payment.amount:
                raise BusinessError("So du vi khong du de thanh toan", ErrorCodes.PAYMENT_STATE_ERROR)
            customer.wallet_balance = _money(customer.wallet_balance) - payment.amount
            customer.save(update_fields=["wallet_balance"])
            WalletTransaction.objects.create(
                customer=customer,
                amount=payment.amount,
                transaction_type="payment",
                description=f"Thanh toan hoa don #{payment.invoice.id}",
            )

        invoice.paid_amount = _money(invoice.paid_amount) + payment.amount
        _recalculate_invoice(invoice)
        invoice.status = "paid" if invoice.balance_due == ZERO else "partially_paid"
        invoice.save()

        if invoice.status == "paid" and invoice.appointment and invoice.appointment.status == "requested":
            from apps.appointments.services import transition_appointment

            transition_appointment(actor, invoice.appointment, "confirmed", reason="Thanh toan thanh cong")

        notify_user(
            user=payment.customer.user,
            category="payment",
            title="Thanh toan thanh cong",
            message=f"Chung toi da nhan duoc khoan thanh toan {payment.amount:,.0f} VND tu ban. Xin cam on!",
            related=payment,
        )

    if new_status == "refunded":
        invoice = Invoice.objects.select_for_update().get(id=payment.invoice_id)
        customer = CustomerProfile.objects.select_for_update().get(id=payment.customer_id)
        customer.wallet_balance = _money(customer.wallet_balance) + payment.amount
        customer.save(update_fields=["wallet_balance"])
        WalletTransaction.objects.create(
            customer=customer,
            amount=payment.amount,
            transaction_type="refund",
            description=f"Hoan tien hoa don #{invoice.id}",
        )
        invoice.paid_amount = _money(invoice.paid_amount) - payment.amount
        _recalculate_invoice(invoice)
        invoice.status = "issued" if invoice.paid_amount == ZERO else "partially_paid"
        invoice.save()

    record_event(actor, f"payment.{new_status}", payment)
    return payment
