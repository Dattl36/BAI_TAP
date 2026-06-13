from django.contrib import admin

from apps.billing.models import Invoice, InvoiceItem


class InvoiceItemInline(admin.TabularInline):
    model = InvoiceItem
    extra = 0


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ("id", "customer", "appointment", "status", "total_due", "paid_amount", "balance_due")
    list_filter = ("status",)
    inlines = [InvoiceItemInline]
