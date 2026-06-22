from datetime import datetime, timedelta
from django.db import transaction
from django.db.models import Prefetch
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
        record_rejection(actor, "appointment.conflict", "Nhân viên không khả dụng.", {"entity_type": "Appointment"})
        raise BusinessError("Nhân viên không khả dụng trong khung giờ đã chọn.", ErrorCodes.APPOINTMENT_CONFLICT, status_code=409)


def ensure_future_schedule(actor, start):
    if start < timezone.now():
        record_rejection(actor, "appointment.past_schedule", "Không thể đặt lịch trong quá khứ.", {"entity_type": "Appointment"})
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
        raise BusinessError("Không thể chuyển lịch hẹn sang trạng thái này.", ErrorCodes.INVALID_STATUS_TRANSITION)
    prior = {"status": appointment.status}
    appointment.status = new_status
    if new_status == "cancelled":
        appointment.cancellation_reason = reason
        
        # Tự động hoàn tiền vào ví nếu hóa đơn đã thanh toán một phần hoặc toàn bộ
        if hasattr(appointment, 'invoice') and appointment.invoice.paid_amount > 0:
            from apps.billing.services import _money
            from apps.customers.models import CustomerProfile
            from apps.payments.models import WalletTransaction

            customer = CustomerProfile.objects.select_for_update().get(id=appointment.customer_id)
            refund_amount = _money(appointment.invoice.paid_amount)
            customer.wallet_balance = _money(customer.wallet_balance) + refund_amount
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


def _ensure_aware(value):
    if timezone.is_naive(value):
        return timezone.make_aware(value, timezone.get_current_timezone())
    return value


def _combine_aware(day, value):
    combined = datetime.combine(day, value)
    return timezone.make_aware(combined, timezone.get_current_timezone())


def _overlaps(start, end, other_start, other_end):
    return start < other_end and end > other_start


def get_busy_staff_ids(start, end):
    start = _ensure_aware(start)
    end = _ensure_aware(end)
    return list(
        Appointment.objects.filter(
            status__in=ACTIVE_STATUSES,
            scheduled_start__lt=end,
            scheduled_end__gt=start,
        )
        .values_list("staff_id", flat=True)
        .distinct()
    )


def get_available_slots(*, start, end, staff_id=None, service_id=None, duration_minutes=None):
    from django.conf import settings

    from apps.employees.models import EmployeeProfile, StaffAvailability
    from apps.services.models import Service

    start = _ensure_aware(start)
    end = _ensure_aware(end)
    if end <= start:
        raise BusinessError("Thoi gian ket thuc phai sau thoi gian bat dau.", ErrorCodes.VALIDATION_ERROR)

    max_range = timedelta(days=settings.APPOINTMENT_LOOKUP_MAX_RANGE_DAYS)
    if end - start > max_range:
        raise BusinessError("Khoang thoi gian tra cuu qua lon.", ErrorCodes.VALIDATION_ERROR)

    if service_id:
        duration_minutes = Service.objects.get(id=service_id).duration_minutes
    if not duration_minutes:
        raise BusinessError("Vui long chon dich vu hoac duration_minutes.", ErrorCodes.VALIDATION_ERROR)

    duration = timedelta(minutes=duration_minutes)
    interval = timedelta(minutes=settings.APPOINTMENT_SLOT_INTERVAL_MINUTES)
    availability_qs = StaffAvailability.objects.filter(date__gte=start.date(), date__lte=end.date()).order_by("date", "start_time")
    staff_qs = EmployeeProfile.objects.filter(employment_status="active").prefetch_related(
        Prefetch("availability_blocks", queryset=availability_qs, to_attr="bounded_availability_blocks")
    )
    if staff_id:
        staff_qs = staff_qs.filter(id=staff_id)

    appointments = list(
        Appointment.objects.filter(
            status__in=ACTIVE_STATUSES,
            scheduled_start__lt=end,
            scheduled_end__gt=start,
        ).only("staff_id", "scheduled_start", "scheduled_end")
    )
    appointments_by_staff = {}
    for appointment in appointments:
        appointments_by_staff.setdefault(appointment.staff_id, []).append(appointment)

    slots = []
    now = timezone.now()
    for staff in staff_qs:
        blocks = getattr(staff, "bounded_availability_blocks", [])
        available_blocks = [block for block in blocks if block.availability_type == "available"]
        unavailable_blocks = [block for block in blocks if block.availability_type == "unavailable"]
        for block in available_blocks:
            block_start = max(_combine_aware(block.date, block.start_time), start, now)
            block_end = min(_combine_aware(block.date, block.end_time), end)
            cursor = block_start
            while cursor + duration <= block_end:
                candidate_end = cursor + duration
                blocked_by_unavailable = any(
                    _overlaps(
                        cursor,
                        candidate_end,
                        _combine_aware(unavailable.date, unavailable.start_time),
                        _combine_aware(unavailable.date, unavailable.end_time),
                    )
                    for unavailable in unavailable_blocks
                )
                blocked_by_appointment = any(
                    _overlaps(cursor, candidate_end, appointment.scheduled_start, appointment.scheduled_end)
                    for appointment in appointments_by_staff.get(staff.id, [])
                )
                if not blocked_by_unavailable and not blocked_by_appointment:
                    slots.append(
                        {
                            "staff_id": staff.id,
                            "staff_name": staff.full_name,
                            "start": cursor.isoformat(),
                            "end": candidate_end.isoformat(),
                        }
                    )
                cursor += interval

    return slots
