from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.feedback.views import ComplaintViewSet


router = DefaultRouter()
router.register("", ComplaintViewSet, basename="complaints")

urlpatterns = [path("", include(router.urls))]
