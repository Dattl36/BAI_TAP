from datetime import timedelta
from django.db import transaction
from django.utils import timezone

from apps.accounts.roles import Roles
from apps.appointments.models import Appointment
from apps.core.audit import record_event, record_rejection
from apps.core.exceptions import BusinessError, ErrorCodes
from apps.notifications.services import notify_user


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


def ensure_future_schedule(actor, start):
    if start < timezone.now():
        record_rejection(actor, "appointment.past_schedule", "Cannot schedule in the past.", {"entity_type": "Appointment"})
        raise BusinessError("Không thể đặt hoặc đổi lịch hẹn vào thời gian trong quá khứ.", ErrorCodes.VALIDATION_ERROR, status_code=400)


@transaction.atomic
def create_appointment(actor, **data):
    services_ids = data.pop("services", [])
    ensure_future_schedule(actor, data["scheduled_start"])
    ensure_no_conflict(actor, data["staff"], data["scheduled_start"], data["scheduled_end"])
    appointment = Appointment.objects.create(**data)
    
    if services_ids:
        from apps.services.models import Service
        from apps.appointments.models import AppointmentService
        for service_id in services_ids:
            service = Service.objects.get(id=service_id)
            AppointmentService.objects.create(
                appointment=appointment,
                service=service,
                price_at_booking=service.base_price,
                duration_at_booking=service.duration_minutes,
                quantity=1
            )
            
    record_event(actor, "appointment.create", appointment)
    notify_user(
        user=appointment.customer.user,
        category="appointment",
        title="Xác nhận lịch hẹn",
        message=f"Lịch hẹn của bạn vào lúc {appointment.scheduled_start.strftime('%d/%m/%Y %H:%M')} đã được đặt thành công.",
        related=appointment
    )
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
        
        # Tự động hoàn tiền vào ví nếu hóa đơn đã thanh toán một phần hoặc toàn bộ
        if hasattr(appointment, 'invoice') and appointment.invoice.paid_amount > 0:
            from apps.payments.models import WalletTransaction
            customer = appointment.customer
            refund_amount = appointment.invoice.paid_amount
            customer.wallet_balance += refund_amount
            customer.save(update_fields=["wallet_balance"])
            
            WalletTransaction.objects.create(
                customer=customer,
                amount=refund_amount,
                transaction_type="refund",
                description=f"Hoàn tiền do hủy lịch hẹn #{appointment.id}"
            )
            
            # Cập nhật hóa đơn
            appointment.invoice.status = "cancelled"
            appointment.invoice.save(update_fields=["status"])
        
        notify_user(
            user=appointment.customer.user,
            category="appointment",
            title="Hủy lịch hẹn",
            message="Lịch hẹn của bạn đã bị hủy.",
            related=appointment
        )
    if new_status == "no_show":
        appointment.no_show_reason = reason
    appointment.save()
    record_event(actor, f"appointment.{new_status}", appointment, prior_state=prior, resulting_state=appointment)
    return appointment


@transaction.atomic
def reschedule_appointment(actor, appointment, start, end, staff=None):
    ensure_future_schedule(actor, start)
    
    if getattr(actor, "role", None) == Roles.CUSTOMER:
        if timezone.now() > appointment.created_at + timedelta(hours=1):
            record_rejection(actor, "appointment.reschedule_timeout", "Passed 1 hour limit.", {"entity_type": "Appointment"})
            raise BusinessError("Bạn chỉ có thể thay đổi lịch hẹn trong vòng 1 giờ sau khi đặt.", ErrorCodes.VALIDATION_ERROR, status_code=403)

    staff = staff or appointment.staff
    ensure_no_conflict(actor, staff, start, end, appointment.id)
    prior = {"scheduled_start": appointment.scheduled_start.isoformat(), "scheduled_end": appointment.scheduled_end.isoformat(), "staff": appointment.staff_id}
    appointment.staff = staff
    appointment.scheduled_start = start
    appointment.scheduled_end = end
    appointment.save()
    record_event(actor, "appointment.reschedule", appointment, prior_state=prior, resulting_state=appointment)
    notify_user(
        user=appointment.customer.user,
        category="appointment",
        title="Đổi lịch hẹn",
        message=f"Lịch hẹn của bạn đã được dời sang lúc {start.strftime('%d/%m/%Y %H:%M')}.",
        related=appointment
    )
    return appointment


def update_from_service_execution(actor, appointment, status):
    mapping = {"in_progress": "in_service", "completed": "completed"}
    target = mapping.get(status)
    if target and appointment.status != target:
        return transition_appointment(actor, appointment, target)
    return appointment
