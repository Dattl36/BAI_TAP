from decimal import Decimal, InvalidOperation

from django.conf import settings
from django.db import transaction
from django.db.models import Prefetch
from django.utils import timezone

from apps.billing.models import Invoice, InvoiceItem
from apps.core.audit import record_event
from apps.core.exceptions import BusinessError, ErrorCodes
from apps.notifications.services import notify_user


ZERO = Decimal("0.00")


def _money(value):
    try:
        amount = Decimal(str(value if value is not None else "0"))
    except (InvalidOperation, ValueError):
        raise BusinessError("Gia tri tien khong hop le.", ErrorCodes.VALIDATION_ERROR)
    if not amount.is_finite():
        raise BusinessError("Gia tri tien khong hop le.", ErrorCodes.VALIDATION_ERROR)
    return amount.quantize(Decimal("0.01"))


def _recalculate_invoice(invoice):
    subtotal = _money(invoice.subtotal)
    discount_total = _money(invoice.discount_total)
    reward_discount = _money(invoice.reward_discount)
    paid_amount = _money(invoice.paid_amount)
    combined_discount = discount_total + reward_discount

    if subtotal < ZERO or discount_total < ZERO or reward_discount < ZERO or paid_amount < ZERO:
        raise BusinessError("Gia tri hoa don khong duoc am.", ErrorCodes.VALIDATION_ERROR)
    if combined_discount > subtotal:
        raise BusinessError("Tong giam gia khong duoc vuot qua tam tinh.", ErrorCodes.VALIDATION_ERROR)

    total_due = subtotal - combined_discount
    balance_due = total_due - paid_amount
    if balance_due < ZERO:
        raise BusinessError("So tien da thanh toan vuot qua tong hoa don.", ErrorCodes.PAYMENT_STATE_ERROR)

    invoice.total_due = total_due
    invoice.balance_due = balance_due
    return invoice


@transaction.atomic
def create_invoice_from_appointment(actor, appointment):
    appointment = (
        appointment.__class__.objects.select_related("customer", "customer__user")
        .prefetch_related(
            Prefetch("appointment_services", queryset=appointment.appointment_services.model.objects.select_related("service")),
            "execution__incidentals",
        )
        .get(id=appointment.id)
    )
    invoice, _ = Invoice.objects.select_for_update().get_or_create(customer=appointment.customer, appointment=appointment)
    invoice.items.all().delete()

    subtotal = ZERO
    for item in appointment.appointment_services.all():
        line_total = _money(item.price_at_booking) * item.quantity
        subtotal += line_total
        InvoiceItem.objects.create(
            invoice=invoice,
            item_type="service",
            service=item.service,
            description=item.service.name,
            quantity=item.quantity,
            unit_price=item.price_at_booking,
            line_total=line_total,
        )

    execution = getattr(appointment, "execution", None)
    if execution:
        for incidental in execution.incidentals.all():
            line_total = _money(incidental.unit_price) * incidental.quantity
            subtotal += line_total
            InvoiceItem.objects.create(
                invoice=invoice,
                item_type="incidental",
                description=incidental.description,
                quantity=incidental.quantity,
                unit_price=incidental.unit_price,
                line_total=line_total,
            )

    invoice.subtotal = subtotal
    _recalculate_invoice(invoice)
    invoice.save()
    record_event(actor, "invoice.create_from_appointment", invoice)
    notify_user(
        user=invoice.customer.user,
        category="billing",
        title="Hoa don moi",
        message=f"Hoa don tri gia {invoice.total_due:,.0f} VND da duoc tao cho lich hen cua ban.",
        related=invoice,
    )
    return invoice


def issue_invoice(actor, invoice):
    _recalculate_invoice(invoice)
    invoice.status = "issued"
    invoice.issued_at = timezone.now()
    invoice.save()
    record_event(actor, "invoice.issue", invoice)
    return invoice


@transaction.atomic
def adjust_invoice(actor, invoice, amount, reason=""):
    reason = (reason or "").strip()
    if len(reason) < settings.INVOICE_ADJUSTMENT_REASON_MIN_LENGTH:
        raise BusinessError("Ly do dieu chinh hoa don qua ngan.", ErrorCodes.VALIDATION_ERROR)

    invoice = Invoice.objects.select_for_update().get(id=invoice.id)
    prior = {
        "subtotal": str(invoice.subtotal),
        "total_due": str(invoice.total_due),
        "balance_due": str(invoice.balance_due),
        "status": invoice.status,
    }
    amount = _money(amount)
    invoice.subtotal = _money(invoice.subtotal) + amount
    _recalculate_invoice(invoice)
    invoice.status = "adjusted"
    invoice.save()
    record_event(actor, "invoice.adjust", invoice, prior_state=prior, resulting_state=invoice, metadata={"reason": reason, "amount": str(amount)})
    return invoice
