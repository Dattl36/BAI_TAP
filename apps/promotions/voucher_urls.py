from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.promotions.views import VoucherViewSet


router = DefaultRouter()
router.register("", VoucherViewSet, basename="vouchers")

urlpatterns = [path("", include(router.urls))]
