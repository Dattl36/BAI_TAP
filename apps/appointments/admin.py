from django.contrib import admin

from apps.appointments.models import Appointment, AppointmentService


class AppointmentServiceInline(admin.TabularInline):
    model = AppointmentService
    extra = 0


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ("customer", "staff", "scheduled_start", "scheduled_end", "status", "source")
    list_filter = ("status", "source")
    inlines = [AppointmentServiceInline]
