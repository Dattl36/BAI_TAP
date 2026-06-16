from datetime import date, time, timedelta

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.accounts.roles import Roles
from apps.customers.models import CustomerProfile
from apps.employees.models import EmployeeProfile, StaffAvailability
from apps.promotions.models import Promotion, Voucher
from apps.services.models import Service


class Command(BaseCommand):
    help = "Khoi tao du lieu mau tieng Viet cho He thong Quan ly Salon, bao gom tai khoan, dich vu va voucher."

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING("Bat dau khoi tao du lieu mau Salon..."))
        User = get_user_model()

        # =========================================================================
        # 1. TẠO TÀI KHOẢN NGƯỜI DÙNG (Quản lý, Lễ tân, Nhân viên/Stylist, Khách hàng)
        # =========================================================================
        self.stdout.write("Dang khoi tao tai khoan nguoi dung...")
        default_pwd = "SalonPassword123!"

        # Quản lý (Manager)
        manager_user, created = User.objects.get_or_create(
            username="salon_manager",
            defaults={
                "email": "manager@salon.com",
                "phone": "0987654321",
                "full_name": "Quản lý Salon",
                "role": Roles.MANAGER,
            }
        )
        if created:
            manager_user.set_password(default_pwd)
            manager_user.save()
        EmployeeProfile.objects.get_or_create(
            user=manager_user,
            defaults={
                "role_type": Roles.MANAGER,
                "full_name": manager_user.full_name,
                "phone": manager_user.phone,
                "employment_status": "active"
            }
        )

        # Lễ tân (Receptionist)
        receptionist_user, created = User.objects.get_or_create(
            username="salon_receptionist",
            defaults={
                "email": "receptionist@salon.com",
                "phone": "0912345678",
                "full_name": "Lễ tân Salon",
                "role": Roles.RECEPTIONIST,
            }
        )
        if created:
            receptionist_user.set_password(default_pwd)
            receptionist_user.save()
        EmployeeProfile.objects.get_or_create(
            user=receptionist_user,
            defaults={
                "role_type": Roles.RECEPTIONIST,
                "full_name": receptionist_user.full_name,
                "phone": receptionist_user.phone,
                "employment_status": "active"
            }
        )

        # Nhân viên / Stylist
        stylists_data = [
            {
                "username": "stylist_elena",
                "email": "elena@salon.com",
                "phone": "0922334455",
                "full_name": "Elena Nguyễn",
                "specialties": "Thợ tạo mẫu tóc chính, Chuyên gia phục hồi tóc Keratin"
            },
            {
                "username": "stylist_marcus",
                "email": "marcus@salon.com",
                "phone": "0933445566",
                "full_name": "Marcus Phạm",
                "specialties": "Thợ cắt tóc nam chính, Chuyên gia Fade & Tạo kiểu"
            },
            {
                "username": "stylist_linh",
                "email": "linh@salon.com",
                "phone": "0944556677",
                "full_name": "Linh Trần",
                "specialties": "Chuyên gia nhuộm màu & Thiết kế Highlight sáng tạo"
            }
        ]

        created_stylists = []
        for s_data in stylists_data:
            stylist_user, created = User.objects.get_or_create(
                username=s_data["username"],
                defaults={
                    "email": s_data["email"],
                    "phone": s_data["phone"],
                    "full_name": s_data["full_name"],
                    "role": Roles.STAFF,
                }
            )
            if created:
                stylist_user.set_password(default_pwd)
                stylist_user.save()

            stylist_profile, _ = EmployeeProfile.objects.get_or_create(
                user=stylist_user,
                defaults={
                    "role_type": Roles.STAFF,
                    "full_name": stylist_user.full_name,
                    "phone": stylist_user.phone,
                    "specialties": s_data["specialties"],
                    "employment_status": "active"
                }
            )
            created_stylists.append(stylist_profile)

            # Ca lam viec cho hom nay & ngay mai
            for day_offset in [0, 1]:
                StaffAvailability.objects.get_or_create(
                    employee=stylist_profile,
                    date=date.today() + timedelta(days=day_offset),
                    start_time=time(9, 0),
                    end_time=time(18, 0),
                    defaults={
                        "availability_type": "available",
                        "reason": "Ca làm việc tiêu chuẩn"
                    }
                )

        # Khách hàng (Customers)
        customers_data = [
            {
                "username": "customer_a",
                "email": "customer_a@example.com",
                "phone": "0901112222",
                "full_name": "Nguyễn Văn A"
            },
            {
                "username": "customer_b",
                "email": "customer_b@example.com",
                "phone": "0902223333",
                "full_name": "Trần Thị B"
            }
        ]

        customer_profiles = {}
        for c_data in customers_data:
            customer_user, created = User.objects.get_or_create(
                username=c_data["username"],
                defaults={
                    "email": c_data["email"],
                    "phone": c_data["phone"],
                    "full_name": c_data["full_name"],
                    "role": Roles.CUSTOMER,
                }
            )
            if created:
                customer_user.set_password(default_pwd)
                customer_user.save()

            profile, _ = CustomerProfile.objects.get_or_create(
                user=customer_user,
                defaults={
                    "full_name": customer_user.full_name,
                    "phone": customer_user.phone,
                    "email": customer_user.email,
                    "status": "active"
                }
            )
            customer_profiles[customer_user.username] = profile

        self.stdout.write(self.style.SUCCESS("Da khoi tao xong cac tai khoan nguoi dung mau."))

        # =========================================================================
        # 2. TẠO CÁC DỊCH VỤ SALON (Services)
        # =========================================================================
        self.stdout.write("Dang tao danh muc dich vu...")
        services_to_seed = [
            {
                "name": "Cắt tóc Nam",
                "category": "Cắt tóc",
                "description": "Cắt tạo kiểu tóc nam thời thượng, cạo viền khăn nóng và tạo kiểu sáp cao cấp.",
                "base_price": 150000,
                "duration_minutes": 30
            },
            {
                "name": "Cắt tóc Nữ",
                "category": "Cắt tóc",
                "description": "Cắt thiết kế dáng tóc nữ layer, bob thời trang, kết hợp gội sâu và sấy tạo kiểu.",
                "base_price": 250000,
                "duration_minutes": 60
            },
            {
                "name": "Gội đầu & Massage thư giãn",
                "category": "Gội đầu",
                "description": "Gội đầu thảo dược dưỡng sinh 2 lần, massage ấn huyệt đầu, cổ, vai gáy thư giãn.",
                "base_price": 100000,
                "duration_minutes": 30
            },
            {
                "name": "Nhuộm tóc cao cấp",
                "category": "Nhuộm tóc",
                "description": "Nhuộm màu thời trang toàn đầu hoặc highlight balayage sử dụng màu nhuộm hữu cơ an toàn.",
                "base_price": 500000,
                "duration_minutes": 90
            },
            {
                "name": "Uốn / Duỗi tạo kiểu sự kiện",
                "category": "Tạo kiểu",
                "description": "Uốn giả tạo phồng, xoăn sóng nước hoặc duỗi thẳng phục vụ sự kiện, tiệc tùng.",
                "base_price": 120000,
                "duration_minutes": 45
            },
            {
                "name": "Hấp phục hồi Keratin chuyên sâu",
                "category": "Phục hồi",
                "description": "Liệu trình hấp nhiệt đưa hạt Keratin lấp đầy biểu bì tóc hư tổn do hóa chất, uốn nhuộm.",
                "base_price": 350000,
                "duration_minutes": 60
            },
            {
                "name": "Cạo râu & Chăm sóc râu",
                "category": "Cạo râu",
                "description": "Cạo râu tạo kiểu nghệ thuật bằng dao cạo chuyên dụng, dưỡng dầu argan cao cấp.",
                "base_price": 80000,
                "duration_minutes": 20
            }
        ]

        created_services = {}
        for s_info in services_to_seed:
            service, _ = Service.objects.get_or_create(
                name=s_info["name"],
                defaults={
                    "category": s_info["category"],
                    "description": s_info["description"],
                    "base_price": s_info["base_price"],
                    "duration_minutes": s_info["duration_minutes"],
                    "active": True,
                    "status": "active"
                }
            )
            created_services[service.name] = service

        self.stdout.write(self.style.SUCCESS("Da khoi tao xong danh muc dich vu."))

        # =========================================================================
        # 3. TẠO CÁC CHƯƠNG TRÌNH KHUYẾN MÃI & VOUCHERS
        # =========================================================================
        self.stdout.write("Dang tao cac chuong trinh khuyen mai va voucher...")

        # VIP Promotion
        vip_promo, _ = Promotion.objects.get_or_create(
            name="Chương trình ưu đãi VIP",
            defaults={
                "description": "Ưu đãi tri ân đặc quyền dành riêng cho khách hàng VIP của hệ thống",
                "discount_type": "amount",
                "discount_value": 100000,
                "starts_at": timezone.now() - timedelta(days=5),
                "ends_at": timezone.now() + timedelta(days=90),
                "active": True
            }
        )
        demo_customer = customer_profiles.get("customer_a")

        # VIP Promotion
        vip_promo, _ = Promotion.objects.get_or_create(
            name="Chương trình ưu đãi VIP",
            defaults={
                "description": "Ưu đãi tri ân đặc quyền dành riêng cho khách hàng VIP của hệ thống",
                "discount_type": "amount",
                "discount_value": 100000,
                "starts_at": timezone.now() - timedelta(days=5),
                "ends_at": timezone.now() + timedelta(days=90),
                "active": True
            }
        )
        vip_voucher, created = Voucher.objects.get_or_create(
            code="VIP30",
            defaults={
                "promotion": vip_promo,
                "customer": demo_customer,
                "discount_type": "amount",
                "discount_value": 100000,
                "min_invoice": 500000,
                "starts_at": timezone.now() - timedelta(days=5),
                "expires_at": timezone.now() + timedelta(days=90),
                "status": "active",
                "usage_limit": 50
            }
        )
        if not created or vip_voucher.customer != demo_customer:
            vip_voucher.customer = demo_customer
            vip_voucher.save()

        # Summer Promo
        summer_promo, _ = Promotion.objects.get_or_create(
            name="Khuyến mãi chào hè rực rỡ",
            defaults={
                "description": "Chương trình ưu đãi giảm giá kích cầu mùa hè sôi động",
                "discount_type": "percent",
                "discount_value": 20,
                "starts_at": timezone.now() - timedelta(days=1),
                "ends_at": timezone.now() + timedelta(days=60),
                "active": True
            }
        )
        summer_voucher, created = Voucher.objects.get_or_create(
            code="SUMMER20",
            defaults={
                "promotion": summer_promo,
                "customer": demo_customer,
                "discount_type": "percent",
                "discount_value": 20,
                "min_invoice": 300000,
                "starts_at": timezone.now() - timedelta(days=1),
                "expires_at": timezone.now() + timedelta(days=60),
                "status": "active",
                "usage_limit": 100
            }
        )
        if not created or summer_voucher.customer != demo_customer:
            summer_voucher.customer = demo_customer
            summer_voucher.save()

        # New Customer Promo
        new_cust_promo, _ = Promotion.objects.get_or_create(
            name="Chào mừng khách hàng mới",
            defaults={
                "description": "Ưu đãi chào mừng khách hàng lần đầu đăng ký sử dụng dịch vụ tại salon",
                "discount_type": "percent",
                "discount_value": 10,
                "starts_at": timezone.now() - timedelta(days=10),
                "ends_at": timezone.now() + timedelta(days=365),
                "active": True
            }
        )
        new_cust_voucher, created = Voucher.objects.get_or_create(
            code="NEWCUSTOMER10",
            defaults={
                "promotion": new_cust_promo,
                "customer": demo_customer,
                "discount_type": "percent",
                "discount_value": 10,
                "min_invoice": 200000,
                "starts_at": timezone.now() - timedelta(days=10),
                "expires_at": timezone.now() + timedelta(days=365),
                "status": "active",
                "usage_limit": 500
            }
        )
        if not created or new_cust_voucher.customer != demo_customer:
            new_cust_voucher.customer = demo_customer
            new_cust_voucher.save()

        # Haircut Promo
        haircut_promo, _ = Promotion.objects.get_or_create(
            name="Ưu đãi cắt tóc đặc biệt",
            defaults={
                "description": "Khuyến mãi giảm giá 15% áp dụng riêng cho các dịch vụ cắt tóc",
                "discount_type": "percent",
                "discount_value": 15,
                "starts_at": timezone.now() - timedelta(days=2),
                "ends_at": timezone.now() + timedelta(days=30),
                "active": True
            }
        )
        if "Cắt tóc Nam" in created_services:
            haircut_promo.service_scope.add(created_services["Cắt tóc Nam"])
        if "Cắt tóc Nữ" in created_services:
            haircut_promo.service_scope.add(created_services["Cắt tóc Nữ"])

        haircut_voucher, created = Voucher.objects.get_or_create(
            code="HAIRCUT15",
            defaults={
                "promotion": haircut_promo,
                "customer": demo_customer,
                "discount_type": "percent",
                "discount_value": 15,
                "min_invoice": 150000,
                "starts_at": timezone.now() - timedelta(days=2),
                "expires_at": timezone.now() + timedelta(days=30),
                "status": "active",
                "usage_limit": 200
            }
        )
        if not created or haircut_voucher.customer != demo_customer:
            haircut_voucher.customer = demo_customer
            haircut_voucher.save()

        self.stdout.write(self.style.SUCCESS("Da khoi tao xong cac chuong trinh khuyen mai va voucher."))

        # =========================================================================
        # 4. PRINT SUMMARY TABLE
        # =========================================================================
        self.stdout.write("\n" + "=" * 80)
        self.stdout.write(self.style.SUCCESS("KHOI TAO CO SO DU LIEU THANH CONG!"))
        self.stdout.write("=" * 80)
        self.stdout.write("\nDanh sach tai khoan dung thu nghiem:")
        self.stdout.write("-" * 80)
        self.stdout.write(f"{'Vai tro':<15} | {'Tai khoan (User)':<20} | {'Email':<25} | {'Mat khau':<15}")
        self.stdout.write("-" * 80)
        self.stdout.write(f"{'Quan ly':<15} | {'salon_manager':<20} | {'manager@salon.com':<25} | {default_pwd:<15}")
        self.stdout.write(f"{'Le tan':<15} | {'salon_receptionist':<20} | {'receptionist@salon.com':<25} | {default_pwd:<15}")
        self.stdout.write(f"{'Nhan vien':<15} | {'stylist_elena':<20} | {'elena@salon.com':<25} | {default_pwd:<15}")
        self.stdout.write(f"{'Nhan vien':<15} | {'stylist_marcus':<20} | {'marcus@salon.com':<25} | {default_pwd:<15}")
        self.stdout.write(f"{'Nhan vien':<15} | {'stylist_linh':<20} | {'linh@salon.com':<25} | {default_pwd:<15}")
        self.stdout.write(f"{'Khach hang':<15} | {'customer_a':<20} | {'customer_a@example.com':<25} | {default_pwd:<15}")
        self.stdout.write(f"{'Khach hang':<15} | {'customer_b':<20} | {'customer_b@example.com':<25} | {default_pwd:<15}")
        self.stdout.write("-" * 80)
        self.stdout.write("\nBan co the chay lai lenh nay bat cu luc nao bang cach su dung:")
        self.stdout.write(self.style.WARNING("python manage.py seed_data"))
        self.stdout.write("=" * 80 + "\n")
