from django.db import transaction
from django.utils import timezone

from apps.appointments.services import update_from_service_execution
from apps.core.audit import record_event
from apps.core.exceptions import BusinessError, ErrorCodes
from apps.service_execution.models import ServiceExecution, ServiceIncidental


def assigned_schedule(employee):
    return ServiceExecution.objects.filter(staff=employee).select_related("appointment", "appointment__customer")


@transaction.atomic
def start_service(actor, appointment):
    employee = getattr(actor, "employee_profile", None)
    execution, _ = ServiceExecution.objects.get_or_create(appointment=appointment, defaults={"staff": employee})
    if execution.staff != employee:
        raise BusinessError("Only the assigned staff can start this service.", ErrorCodes.PERMISSION_DENIED, status_code=403)
    execution.status = "in_progress"
    execution.started_at = timezone.now()
    execution.save()
    update_from_service_execution(actor, appointment, execution.status)
    record_event(actor, "service_execution.start", execution)
    return execution


@transaction.atomic
def add_incidental(actor, execution, **data):
    incidental = ServiceIncidental.objects.create(execution=execution, added_by=getattr(actor, "employee_profile", None), **data)
    record_event(actor, "service_execution.incidental_add", incidental)
    return incidental


@transaction.atomic
def complete_service(actor, execution, result_notes=""):
    execution.status = "completed"
    execution.completed_at = timezone.now()
    execution.result_notes = result_notes or execution.result_notes
    execution.save()
    update_from_service_execution(actor, execution.appointment, execution.status)
    record_event(actor, "service_execution.complete", execution)
    return execution
