from django.db import transaction
from django.utils import timezone

from apps.appointments.models import Appointment
from apps.core.audit import record_event, record_rejection
from apps.core.exceptions import BusinessError, ErrorCodes


ACTIVE_STATUSES = ["requested", "confirmed", "arrived", "in_service"]


def has_conflict(staff, start, end, exclude_id=None):
    qs = Appointment.objects.filter(
        staff=staff,
        status__in=ACTIVE_STATUSES,
        scheduled_start__lt=end,
        scheduled_end__gt=start,
    )
    if exclude_id:
        qs = qs.exclude(id=exclude_id)
    return qs.exists()


def ensure_no_conflict(actor, staff, start, end, exclude_id=None):
    if has_conflict(staff, start, end, exclude_id):
        record_rejection(actor, "appointment.conflict", "Staff is unavailable.", {"entity_type": "Appointment"})
        raise BusinessError("Staff is unavailable for the selected time.", ErrorCodes.APPOINTMENT_CONFLICT, status_code=409)


@transaction.atomic
def create_appointment(actor, **data):
    ensure_no_conflict(actor, data["staff"], data["scheduled_start"], data["scheduled_end"])
    appointment = Appointment.objects.create(**data)
    record_event(actor, "appointment.create", appointment)
    return appointment


@transaction.atomic
def transition_appointment(actor, appointment, new_status, reason=""):
    allowed = {
        "requested": {"confirmed", "cancelled"},
        "confirmed": {"arrived", "cancelled", "no_show"},
        "arrived": {"in_service"},
        "in_service": {"completed"},
        "completed": {"invoiced"},
        "invoiced": {"closed"},
    }
    if new_status not in allowed.get(appointment.status, set()):
        record_rejection(actor, "appointment.invalid_transition", f"{appointment.status}->{new_status}", {"entity_type": "Appointment"})
        raise BusinessError("Appointment status transition is not allowed.", ErrorCodes.INVALID_STATUS_TRANSITION)
    prior = {"status": appointment.status}
    appointment.status = new_status
    if new_status == "cancelled":
        appointment.cancellation_reason = reason
    if new_status == "no_show":
        appointment.no_show_reason = reason
    appointment.save()
    record_event(actor, f"appointment.{new_status}", appointment, prior_state=prior, resulting_state=appointment)
    return appointment


@transaction.atomic
def reschedule_appointment(actor, appointment, start, end, staff=None):
    staff = staff or appointment.staff
    ensure_no_conflict(actor, staff, start, end, appointment.id)
    prior = {"scheduled_start": appointment.scheduled_start.isoformat(), "scheduled_end": appointment.scheduled_end.isoformat(), "staff": appointment.staff_id}
    appointment.staff = staff
    appointment.scheduled_start = start
    appointment.scheduled_end = end
    appointment.save()
    record_event(actor, "appointment.reschedule", appointment, prior_state=prior, resulting_state=appointment)
    return appointment


def update_from_service_execution(actor, appointment, status):
    mapping = {"in_progress": "in_service", "completed": "completed"}
    target = mapping.get(status)
    if target and appointment.status != target:
        return transition_appointment(actor, appointment, target)
    return appointment
