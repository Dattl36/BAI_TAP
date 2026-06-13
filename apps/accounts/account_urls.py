from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.accounts.views import AccountViewSet


router = DefaultRouter()
router.register("", AccountViewSet, basename="accounts")

urlpatterns = [path("", include(router.urls))]
