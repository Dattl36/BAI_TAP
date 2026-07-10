import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "salon_backend.settings")
django.setup()

from django.contrib.auth import get_user_model
from apps.employees.models import EmployeeProfile

User = get_user_model()

# Tạo tài khoản Manager mặc định
username = "admin"
email = "admin@example.com"
password = "password123"

user, created = User.objects.get_or_create(username=username, defaults={
    "email": email,
    "full_name": "Quản Lý Hệ Thống",
    "role": "manager",
    "is_staff": True,
    "is_superuser": True,
})

if created:
    user.set_password(password)
    user.save()
    
    # Tạo luôn profile nhân viên (nếu logic signals chưa tạo)
    EmployeeProfile.objects.get_or_create(
        user=user,
        defaults={"role_type": "manager"}
    )
    print(f"[OK] Da tao tai khoan Quan ly thanh cong: {username} / {password}")
else:
    # Đảm bảo user này là manager
    user.role = "manager"
    user.is_staff = True
    user.is_superuser = True
    user.save()
    
    EmployeeProfile.objects.get_or_create(
        user=user,
        defaults={"role_type": "manager"}
    )
    print(f"[OK] Tai khoan {username} da ton tai, da cap quyen Quan ly!")
