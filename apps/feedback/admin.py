from django.contrib import admin

from apps.feedback.models import Complaint, ComplaintStatusHistory, Feedback


@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ("customer", "appointment", "status", "created_at")
    list_filter = ("status",)


class ComplaintStatusHistoryInline(admin.TabularInline):
    model = ComplaintStatusHistory
    extra = 0


@admin.register(Complaint)
class ComplaintAdmin(admin.ModelAdmin):
    list_display = ("customer", "title", "severity", "status", "assigned_to", "escalated_to")
    list_filter = ("status", "severity")
    inlines = [ComplaintStatusHistoryInline]
