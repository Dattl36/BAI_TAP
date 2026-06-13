from django.contrib import admin

from apps.notifications.models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("recipient", "category", "title", "delivery_status", "read_at")
    list_filter = ("category", "delivery_status")
    search_fields = ("title", "message", "recipient__username")
