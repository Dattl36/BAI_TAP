from django.contrib import admin

from apps.employees.models import EmployeeProfile, StaffAvailability


@admin.register(EmployeeProfile)
class EmployeeProfileAdmin(admin.ModelAdmin):
    list_display = ("employee_code", "full_name", "role_type", "employment_status", "is_deleted")
    list_filter = ("role_type", "employment_status", "is_deleted")
    search_fields = ("employee_code", "full_name", "phone")


@admin.register(StaffAvailability)
class StaffAvailabilityAdmin(admin.ModelAdmin):
    list_display = ("employee", "date", "start_time", "end_time", "availability_type")
    list_filter = ("availability_type", "date")
