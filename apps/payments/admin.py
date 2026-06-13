from django.contrib import admin

from apps.payments.models import PaymentStatusHistory, PaymentTransaction


class PaymentStatusHistoryInline(admin.TabularInline):
    model = PaymentStatusHistory
    extra = 0


@admin.register(PaymentTransaction)
class PaymentTransactionAdmin(admin.ModelAdmin):
    list_display = ("id", "invoice", "customer", "amount", "method", "status", "processed_at")
    list_filter = ("status", "method")
    inlines = [PaymentStatusHistoryInline]
