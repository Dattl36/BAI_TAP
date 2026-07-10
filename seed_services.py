import os
import django

# Configure django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "salon_backend.settings")
django.setup()

from apps.services.models import Service

services = [
    {"name": "Cắt tóc nam (Men's Haircut)", "category": "Haircut", "description": "Cắt, gội, sấy tạo kiểu cơ bản cho nam.", "base_price": 100000, "duration_minutes": 30},
    {"name": "Cắt tóc nữ (Women's Haircut)", "category": "Haircut", "description": "Cắt, gội, sấy tạo kiểu cơ bản cho nữ.", "base_price": 200000, "duration_minutes": 45},
    {"name": "Nhuộm tóc thời trang", "category": "Coloring", "description": "Nhuộm màu thời trang, sử dụng thuốc nhuộm cao cấp.", "base_price": 500000, "duration_minutes": 120},
    {"name": "Uốn tóc (Perm)", "category": "Perm/Straightening", "description": "Uốn cong, tạo kiểu theo yêu cầu.", "base_price": 600000, "duration_minutes": 120},
    {"name": "Phục hồi tóc hư tổn", "category": "Treatment", "description": "Phục hồi Keratin chuyên sâu cho tóc hư tổn.", "base_price": 800000, "duration_minutes": 90},
    {"name": "Gội đầu dưỡng sinh", "category": "Spa", "description": "Gội đầu thảo dược kết hợp massage cổ vai gáy.", "base_price": 150000, "duration_minutes": 45},
    {"name": "Combo sáp vuốt tóc (Wax)", "category": "Product", "description": "Sản phẩm sáp vuốt tóc cao cấp tạo kiểu.", "base_price": 250000, "duration_minutes": 0},
    {"name": "Dầu gội phục hồi (Shampoo)", "category": "Product", "description": "Sản phẩm dầu gội chuyên phục hồi tóc.", "base_price": 300000, "duration_minutes": 0},
    {"name": "Tinh dầu dưỡng tóc", "category": "Product", "description": "Serum dưỡng tóc mềm mượt chống rối.", "base_price": 180000, "duration_minutes": 0},
]

for s in services:
    service, created = Service.objects.get_or_create(name=s["name"], defaults=s)
    if created:
        print(f"Created service: {service.id}")
    else:
        print(f"Service exists: {service.id}")

print("Done seeding services and products!")
