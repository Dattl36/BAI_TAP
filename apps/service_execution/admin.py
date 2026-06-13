from django.contrib import admin

from apps.service_execution.models import ServiceExecution, ServiceIncidental


class ServiceIncidentalInline(admin.TabularInline):
    model = ServiceIncidental
    extra = 0


@admin.register(ServiceExecution)
class ServiceExecutionAdmin(admin.ModelAdmin):
    list_display = ("appointment", "staff", "status", "started_at", "completed_at")
    list_filter = ("status",)
    inlines = [ServiceIncidentalInline]
