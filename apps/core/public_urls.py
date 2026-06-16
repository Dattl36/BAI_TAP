from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.core.public_views import (
    PublicServiceViewSet,
    PublicStylistViewSet,
    PublicPromotionViewSet,
    PublicArticleViewSet
)

router = DefaultRouter()
router.register("services", PublicServiceViewSet, basename="public-services")
router.register("stylists", PublicStylistViewSet, basename="public-stylists")
router.register("promotions", PublicPromotionViewSet, basename="public-promotions")
router.register("articles", PublicArticleViewSet, basename="public-articles")

urlpatterns = [
    path("", include(router.urls)),
]
