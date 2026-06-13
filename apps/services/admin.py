from django.contrib import admin

from apps.services.models import Service, ServicePriceHistory


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "base_price", "duration_minutes", "active", "status")
    list_filter = ("active", "status", "category")
    search_fields = ("name", "category")


@admin.register(ServicePriceHistory)
class ServicePriceHistoryAdmin(admin.ModelAdmin):
    list_display = ("service", "old_price", "new_price", "old_duration", "new_duration", "changed_at")
