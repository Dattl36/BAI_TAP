from django.db.models import Count, Sum

from apps.appointments.models import Appointment
from apps.billing.models import Invoice
from apps.service_execution.models import ServiceExecution


def revenue_summary(start=None, end=None):
    qs = Invoice.objects.filter(status__in=["paid", "partially_paid", "issued", "adjusted"])
    if start:
        qs = qs.filter(created_at__date__gte=start)
    if end:
        qs = qs.filter(created_at__date__lte=end)
    return {"total_revenue": qs.aggregate(total=Sum("paid_amount"))["total"] or 0, "invoice_count": qs.count()}


def appointment_summary(start=None, end=None):
    qs = Appointment.objects.all()
    if start:
        qs = qs.filter(scheduled_start__date__gte=start)
    if end:
        qs = qs.filter(scheduled_start__date__lte=end)
    return list(qs.values("status").annotate(count=Count("id")).order_by("status"))


def staff_performance(start=None, end=None):
    qs = ServiceExecution.objects.select_related("staff")
    if start:
        qs = qs.filter(created_at__date__gte=start)
    if end:
        qs = qs.filter(created_at__date__lte=end)
    return list(qs.values("staff__full_name").annotate(completed=Count("id")).order_by("staff__full_name"))
