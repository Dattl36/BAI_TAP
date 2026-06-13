from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.feedback.views import ComplaintViewSet, FeedbackViewSet


router = DefaultRouter()
router.register("feedback", FeedbackViewSet, basename="feedback")
router.register("complaints", ComplaintViewSet, basename="complaints")

urlpatterns = [path("", include(router.urls))]
