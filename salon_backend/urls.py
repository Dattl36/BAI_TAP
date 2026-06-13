from django.contrib import admin
from django.urls import include, path


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("apps.accounts.urls")),
    path("api/accounts/", include("apps.accounts.account_urls")),
    path("api/customers/", include("apps.customers.urls")),
    path("api/employees/", include("apps.employees.urls")),
    path("api/services/", include("apps.services.urls")),
    path("api/appointments/", include("apps.appointments.urls")),
    path("api/service-executions/", include("apps.service_execution.urls")),
    path("api/invoices/", include("apps.billing.urls")),
    path("api/payments/", include("apps.payments.urls")),
    path("api/promotions/", include("apps.promotions.urls")),
    path("api/vouchers/", include("apps.promotions.voucher_urls")),
    path("api/reward-ledger/", include("apps.promotions.reward_urls")),
    path("api/feedback/", include("apps.feedback.feedback_urls")),
    path("api/complaints/", include("apps.feedback.complaint_urls")),
    path("api/notifications/", include("apps.notifications.urls")),
    path("api/reports/", include("apps.reports.urls")),
]
