from decimal import Decimal

from django.db import transaction
from django.utils import timezone

from apps.billing.models import Invoice, InvoiceItem
from apps.core.audit import record_event


@transaction.atomic
def create_invoice_from_appointment(actor, appointment):
    invoice, _ = Invoice.objects.get_or_create(customer=appointment.customer, appointment=appointment)
    invoice.items.all().delete()
    subtotal = Decimal("0.00")
    for item in appointment.appointment_services.select_related("service"):
        line_total = item.price_at_booking * item.quantity
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
            line_total = incidental.unit_price * incidental.quantity
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
    invoice.total_due = subtotal - invoice.discount_total - invoice.reward_discount
    invoice.balance_due = invoice.total_due - invoice.paid_amount
    invoice.save()
    record_event(actor, "invoice.create_from_appointment", invoice)
    return invoice


def issue_invoice(actor, invoice):
    invoice.status = "issued"
    invoice.issued_at = timezone.now()
    invoice.save()
    record_event(actor, "invoice.issue", invoice)
    return invoice


def adjust_invoice(actor, invoice, amount, reason=""):
    invoice.total_due += Decimal(str(amount))
    invoice.balance_due = invoice.total_due - invoice.paid_amount
    invoice.status = "adjusted"
    invoice.save()
    record_event(actor, "invoice.adjust", invoice, metadata={"reason": reason, "amount": str(amount)})
    return invoice
