from django.db import transaction
from django.utils import timezone

from apps.core.audit import record_event
from apps.core.exceptions import BusinessError, ErrorCodes
from apps.feedback.models import ComplaintStatusHistory


def _set_complaint_status(actor, complaint, new_status, note=""):
    allowed = {
        "received": {"assigned", "in_review", "escalated", "rejected"},
        "assigned": {"in_review", "escalated", "resolved"},
        "in_review": {"escalated", "resolved", "rejected"},
        "escalated": {"in_review", "resolved"},
        "resolved": {"closed"},
    }
    if new_status not in allowed.get(complaint.status, set()):
        raise BusinessError("Complaint status transition is not allowed.", ErrorCodes.COMPLAINT_ASSIGNMENT_ERROR)
    old_status = complaint.status
    complaint.status = new_status
    if new_status == "closed":
        complaint.closed_at = timezone.now()
    complaint.save()
    ComplaintStatusHistory.objects.create(complaint=complaint, old_status=old_status, new_status=new_status, changed_by=actor, note=note)
    record_event(actor, f"complaint.{new_status}", complaint)
    return complaint


@transaction.atomic
def assign_complaint(actor, complaint, assignee, note=""):
    complaint.assigned_to = assignee
    complaint.save(update_fields=["assigned_to", "updated_at"])
    return _set_complaint_status(actor, complaint, "assigned", note)


def escalate_complaint(actor, complaint, manager, note=""):
    complaint.escalated_to = manager
    complaint.save(update_fields=["escalated_to", "updated_at"])
    return _set_complaint_status(actor, complaint, "escalated", note)


def resolve_complaint(actor, complaint, resolution, customer_visible_result=""):
    complaint.resolution = resolution
    complaint.customer_visible_result = customer_visible_result
    complaint.save(update_fields=["resolution", "customer_visible_result", "updated_at"])
    return _set_complaint_status(actor, complaint, "resolved", resolution)


def close_complaint(actor, complaint, note=""):
    return _set_complaint_status(actor, complaint, "closed", note)
