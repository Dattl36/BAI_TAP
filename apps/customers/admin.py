from django.contrib import admin

from apps.customers.models import CustomerProfile


@admin.register(CustomerProfile)
class CustomerProfileAdmin(admin.ModelAdmin):
    list_display = ("code", "full_name", "phone", "email", "status", "is_deleted")
    list_filter = ("status", "is_deleted")
    search_fields = ("code", "full_name", "phone", "email")
