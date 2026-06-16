from rest_framework import viewsets, mixins, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.decorators import action

from apps.services.models import Service
from apps.services.serializers import ServiceSerializer
from apps.employees.models import EmployeeProfile
from apps.employees.serializers import EmployeeProfileSerializer
from apps.promotions.models import Promotion
from apps.promotions.serializers import PromotionSerializer
from apps.core.responses import success

class PublicServiceViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [AllowAny]
    queryset = Service.objects.filter(active=True, status="active").order_by("id")
    serializer_class = ServiceSerializer


class PublicStylistViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [AllowAny]
    queryset = EmployeeProfile.objects.filter(role_type="staff", employment_status="active").order_by("id")
    serializer_class = EmployeeProfileSerializer


class PublicPromotionViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [AllowAny]
    queryset = Promotion.objects.filter(active=True).order_by("id")
    serializer_class = PromotionSerializer


class PublicArticleViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]

    def list(self, request):
        mock_articles = [
            {
                "id": 1,
                "title": "5 Bí Quyết Chăm Sóc Tóc Nhuộm Bền Màu",
                "summary": "Cách bảo vệ mái tóc nhuộm luôn rực rỡ và bóng khỏe dưới tác động của ánh nắng và hóa chất.",
                "content": "Nội dung chi tiết về chăm sóc tóc nhuộm...",
                "author": "Elena Nguyễn",
                "published_at": "2026-06-10",
                "image_url": "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500&auto=format&fit=crop&q=60",
                "category": "Chăm sóc tóc",
                "read_time": "5 phút đọc"
            },
            {
                "id": 2,
                "title": "Xu Hướng Kiểu Tóc Nam Đẹp Nhất Mùa Hè 2026",
                "summary": "Những kiểu tóc ngắn mát mẻ, cá tính dành cho phái nam trong mùa hè này.",
                "content": "Nội dung chi tiết về kiểu tóc nam...",
                "author": "Marcus Phạm",
                "published_at": "2026-06-12",
                "image_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60",
                "category": "Xu hướng",
                "read_time": "4 phút đọc"
            },
            {
                "id": 3,
                "title": "Phục Hồi Tóc Hư Tổn Tại Nhà Với Liệu Pháp Tự Nhiên",
                "summary": "Các phương pháp đơn giản nhưng cực kỳ hiệu quả để cải thiện tóc khô xơ ngay tại nhà.",
                "content": "Nội dung phục hồi tóc hư tổn...",
                "author": "Linh Trần",
                "published_at": "2026-06-15",
                "image_url": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=60",
                "category": "Mẹo hay",
                "read_time": "6 phút đọc"
            }
        ]
        return success(mock_articles)
