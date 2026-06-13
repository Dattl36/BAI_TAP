from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.accounts.views import AuthViewSet


router = DefaultRouter()
router.register("", AuthViewSet, basename="auth")

urlpatterns = [path("", include(router.urls))]
