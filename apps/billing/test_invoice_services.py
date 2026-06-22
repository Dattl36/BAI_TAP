from decimal import Decimal
from datetime import timedelta

import pytest
from django.utils import timezone

from apps.accounts.models import User
from apps.appointments.models import Appointment
from apps.appointments.models import AppointmentService
from apps.billing.models import Invoice
from apps.billing.services import adjust_invoice, create_invoice_from_appointment
from apps.core.exceptions import BusinessError
from apps.customers.models import CustomerProfile
from apps.employees.models import EmployeeProfile
from apps.service_execution.models import ServiceExecution, ServiceIncidental
from apps.services.models import Service


def _invoice():
    customer_user = User.objects.create_user(username="customer", password="ChangeMe123!")
    staff_user = User.objects.create_user(username="staff", password="ChangeMe123!")
    customer = CustomerProfile.objects.create(user=customer_user, full_name="Customer")
    staff = EmployeeProfile.objects.create(user=staff_user, full_name="Staff", role_type="staff")
    appointment = Appointment.objects.create(
        customer=customer,
        staff=staff,
        scheduled_start=timezone.now() + timedelta(days=1),
        scheduled_end=timezone.now() + timedelta(days=1, hours=1),
    )
    return Invoice.objects.create(
        customer=customer,
        appointment=appointment,
        subtotal=Decimal("100.00"),
        total_due=Decimal("100.00"),
        paid_amount=Decimal("0.00"),
        balance_due=Decimal("100.00"),
    )


@pytest.mark.django_db
def test_invoice_adjustment_requires_reason(admin_user):
    with pytest.raises(BusinessError):
        adjust_invoice(admin_user, _invoice(), Decimal("10.00"), " ")


@pytest.mark.django_db
def test_invoice_rejects_adjustment_that_makes_total_negative(admin_user):
    with pytest.raises(BusinessError):
        adjust_invoice(admin_user, _invoice(), Decimal("-101.00"), "valid reason")


@pytest.mark.django_db
def test_create_invoice_from_appointment_includes_services_and_incidentals(admin_user, settings):
    settings.EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"
    invoice = _invoice()
    appointment = invoice.appointment
    invoice.delete()
    service = Service.objects.create(name="Haircut", base_price=Decimal("50.00"), duration_minutes=30)
    AppointmentService.objects.create(
        appointment=appointment,
        service=service,
        price_at_booking=Decimal("50.00"),
        duration_at_booking=30,
        quantity=2,
    )
    execution = ServiceExecution.objects.create(appointment=appointment, staff=appointment.staff)
    ServiceIncidental.objects.create(
        execution=execution,
        description="Extra product",
        quantity=1,
        unit_price=Decimal("25.00"),
    )

    created = create_invoice_from_appointment(admin_user, appointment)

    assert created.subtotal == Decimal("125.00")
    assert created.total_due == Decimal("125.00")
    assert created.balance_due == Decimal("125.00")
    assert created.items.count() == 2
