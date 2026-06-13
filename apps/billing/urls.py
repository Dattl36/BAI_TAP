from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.billing.views import InvoiceViewSet


router = DefaultRouter()
router.register("", InvoiceViewSet, basename="invoices")

urlpatterns = [path("", include(router.urls))]
