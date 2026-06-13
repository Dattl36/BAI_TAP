from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.promotions.views import RewardLedgerViewSet


router = DefaultRouter()
router.register("", RewardLedgerViewSet, basename="reward-ledger")

urlpatterns = [path("", include(router.urls))]
