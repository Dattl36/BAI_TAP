from django.db import models

from apps.core.models import SoftDeleteModel, TimeStampedModel


class Appointment(SoftDeleteModel):
    STATUSES = (
        ("requested", "Chờ xác nhận"),
        ("confirmed", "Đã xác nhận"),
        ("arrived", "Đã đến"),
        ("in_service", "Đang phục vụ"),
        ("completed", "Hoàn tất"),
        ("invoiced", "Đã xuất hóa đơn"),
        ("closed", "Closed"),
        ("cancelled", "Đã hủy"),
        ("no_show", "Không đến"),
    )
    SOURCES = (("customer", "Customer"), ("receptionist", "Receptionist"))

    customer = models.ForeignKey("customers.CustomerProfile", on_delete=models.PROTECT, related_name="appointments")
    staff = models.ForeignKey("employees.EmployeeProfile", on_delete=models.PROTECT, related_name="appointments")
    scheduled_start = models.DateTimeField()
    scheduled_end = models.DateTimeField()
    status = models.CharField(max_length=32, choices=STATUSES, default="requested")
    source = models.CharField(max_length=32, choices=SOURCES, default="customer")
    cancellation_reason = models.TextField(blank=True)
    no_show_reason = models.TextField(blank=True)

    class Meta:
        ordering = ["scheduled_start"]

    def __str__(self):
        return f"{self.customer} with {self.staff} at {self.scheduled_start}"


class AppointmentService(TimeStampedModel):
    appointment = models.ForeignKey(Appointment, on_delete=models.CASCADE, related_name="appointment_services")
    service = models.ForeignKey("services.Service", on_delete=models.PROTECT)
    price_at_booking = models.DecimalField(max_digits=12, decimal_places=2)
    duration_at_booking = models.PositiveIntegerField()
    quantity = models.PositiveIntegerField(default=1)
