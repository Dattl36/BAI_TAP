from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from apps.accounts.models import User


@admin.register(User)
class SalonUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ("Salon", {"fields": ("role", "phone", "full_name", "account_status", "last_login_at")}),
    )
    list_display = ("username", "email", "role", "account_status", "is_active")
    list_filter = ("role", "account_status", "is_active")
