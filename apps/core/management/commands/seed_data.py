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
    help = "Seed complete demo data for the Salon Management System, including users, services, and vouchers."

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING("Starting premium database seeding..."))
        User = get_user_model()

        # =========================================================================
        # 1. CREATE USER ACCOUNTS (Manager, Receptionist, Staff/Stylists, Customers)
        # =========================================================================
        self.stdout.write("Creating user accounts...")
        default_pwd = "SalonPassword123!"

        # Manager
        manager_user, created = User.objects.get_or_create(
            username="salon_manager",
            defaults={
                "email": "manager@salon.com",
                "phone": "0987654321",
                "full_name": "Salon Manager",
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

        # Receptionist
        receptionist_user, created = User.objects.get_or_create(
            username="salon_receptionist",
            defaults={
                "email": "receptionist@salon.com",
                "phone": "0912345678",
                "full_name": "Salon Receptionist",
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

        # Staff / Stylists
        stylists_data = [
            {
                "username": "stylist_elena",
                "email": "elena@salon.com",
                "phone": "0922334455",
                "full_name": "Elena Nguyen",
                "specialties": "Senior Hair Stylist, Keratin Treatment Specialist"
            },
            {
                "username": "stylist_marcus",
                "email": "marcus@salon.com",
                "phone": "0933445566",
                "full_name": "Marcus Pham",
                "specialties": "Master Barber, Precision Fade & Styling Specialist"
            },
            {
                "username": "stylist_linh",
                "email": "linh@salon.com",
                "phone": "0944556677",
                "full_name": "Linh Tran",
                "specialties": "Colorist & Creative Highlights Specialist"
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

            # Set availability for today & tomorrow
            for day_offset in [0, 1]:
                StaffAvailability.objects.get_or_create(
                    employee=stylist_profile,
                    date=date.today() + timedelta(days=day_offset),
                    start_time=time(9, 0),
                    end_time=time(18, 0),
                    defaults={
                        "availability_type": "available",
                        "reason": "Standard shift"
                    }
                )

        # Customers
        customers_data = [
            {
                "username": "customer_a",
                "email": "customer_a@example.com",
                "phone": "0901112222",
                "full_name": "Nguyen Van A"
            },
            {
                "username": "customer_b",
                "email": "customer_b@example.com",
                "phone": "0902223333",
                "full_name": "Tran Thi B"
            }
        ]

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

            CustomerProfile.objects.get_or_create(
                user=customer_user,
                defaults={
                    "full_name": customer_user.full_name,
                    "phone": customer_user.phone,
                    "email": customer_user.email,
                    "status": "active"
                }
            )

        self.stdout.write(self.style.SUCCESS("User accounts successfully seeded."))

        # =========================================================================
        # 2. CREATE SALON SERVICES
        # =========================================================================
        self.stdout.write("Creating salon services...")
        services_to_seed = [
            {
                "name": "Men's Haircut",
                "category": "Haircut",
                "description": "Premium style cut, hot towel shave outline, and styling by expert stylists.",
                "base_price": 150000,
                "duration_minutes": 30
            },
            {
                "name": "Women's Haircut",
                "category": "Haircut",
                "description": "Detailed elegant layer cuts, deep hair wash, and blow dry finish.",
                "base_price": 250000,
                "duration_minutes": 60
            },
            {
                "name": "Hair Wash & Massage",
                "category": "Wash",
                "description": "Relaxing double-wash shampoo, herbal head massage, and blowout styling.",
                "base_price": 100000,
                "duration_minutes": 30
            },
            {
                "name": "Premium Hair Coloring",
                "category": "Color",
                "description": "Full-head luxury coloring or balayage highlights using ammonia-free dyes.",
                "base_price": 500000,
                "duration_minutes": 90
            },
            {
                "name": "Special Event Hair Styling",
                "category": "Styling",
                "description": "Bridal styling, updos, curls, or braids for parties and formal events.",
                "base_price": 120000,
                "duration_minutes": 45
            },
            {
                "name": "Keratin Repair Treatment",
                "category": "Treatment",
                "description": "Deep keratin nourishing conditioning to restore damaged, dry, and frizzy hair.",
                "base_price": 350000,
                "duration_minutes": 60
            },
            {
                "name": "Beard Grooming & Trim",
                "category": "Grooming",
                "description": "Precision beard shaving or trimming with premium essential oils and hot towels.",
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

        self.stdout.write(self.style.SUCCESS("Salon services successfully seeded."))

        # =========================================================================
        # 3. CREATE PROMOTIONS & VOUCHERS
        # =========================================================================
        self.stdout.write("Creating promotions and vouchers...")

        # VIP Promotion
        vip_promo, _ = Promotion.objects.get_or_create(
            name="VIP Premium Promotion",
            defaults={
                "description": "Premium rewards and discounts for VIP accounts",
                "discount_type": "amount",
                "discount_value": 100000,
                "starts_at": timezone.now() - timedelta(days=5),
                "ends_at": timezone.now() + timedelta(days=90),
                "active": True
            }
        )
        Voucher.objects.get_or_create(
            code="VIP30",
            defaults={
                "promotion": vip_promo,
                "discount_type": "amount",
                "discount_value": 100000,
                "min_invoice": 500000,
                "starts_at": timezone.now() - timedelta(days=5),
                "expires_at": timezone.now() + timedelta(days=90),
                "status": "active",
                "usage_limit": 50
            }
        )

        # Summer Promo
        summer_promo, _ = Promotion.objects.get_or_create(
            name="Summer Spark Promotion",
            defaults={
                "description": "Beat the heat with hot summer discounts",
                "discount_type": "percent",
                "discount_value": 20,
                "starts_at": timezone.now() - timedelta(days=1),
                "ends_at": timezone.now() + timedelta(days=60),
                "active": True
            }
        )
        Voucher.objects.get_or_create(
            code="SUMMER20",
            defaults={
                "promotion": summer_promo,
                "discount_type": "percent",
                "discount_value": 20,
                "min_invoice": 300000,
                "starts_at": timezone.now() - timedelta(days=1),
                "expires_at": timezone.now() + timedelta(days=60),
                "status": "active",
                "usage_limit": 100
            }
        )

        # New Customer Promo
        new_cust_promo, _ = Promotion.objects.get_or_create(
            name="New Customer Welcome",
            defaults={
                "description": "Warm welcome to our sanctuary salon with a 10% coupon",
                "discount_type": "percent",
                "discount_value": 10,
                "starts_at": timezone.now() - timedelta(days=10),
                "ends_at": timezone.now() + timedelta(days=365),
                "active": True
            }
        )
        Voucher.objects.get_or_create(
            code="NEWCUSTOMER10",
            defaults={
                "promotion": new_cust_promo,
                "discount_type": "percent",
                "discount_value": 10,
                "min_invoice": 200000,
                "starts_at": timezone.now() - timedelta(days=10),
                "expires_at": timezone.now() + timedelta(days=365),
                "status": "active",
                "usage_limit": 500
            }
        )

        # Haircut Promo
        haircut_promo, _ = Promotion.objects.get_or_create(
            name="Haircut Special discount",
            defaults={
                "description": "15% off specifically targeting haircut services",
                "discount_type": "percent",
                "discount_value": 15,
                "starts_at": timezone.now() - timedelta(days=2),
                "ends_at": timezone.now() + timedelta(days=30),
                "active": True
            }
        )
        if "Men's Haircut" in created_services:
            haircut_promo.service_scope.add(created_services["Men's Haircut"])
        if "Women's Haircut" in created_services:
            haircut_promo.service_scope.add(created_services["Women's Haircut"])

        Voucher.objects.get_or_create(
            code="HAIRCUT15",
            defaults={
                "promotion": haircut_promo,
                "discount_type": "percent",
                "discount_value": 15,
                "min_invoice": 150000,
                "starts_at": timezone.now() - timedelta(days=2),
                "expires_at": timezone.now() + timedelta(days=30),
                "status": "active",
                "usage_limit": 200
            }
        )

        self.stdout.write(self.style.SUCCESS("Promotions and vouchers successfully seeded."))

        # =========================================================================
        # 4. PRINT SUMMARY TABLE
        # =========================================================================
        self.stdout.write("\n" + "=" * 80)
        self.stdout.write(self.style.SUCCESS("DATABASE SEEDING COMPLETED SUCCESSFULLY!"))
        self.stdout.write("=" * 80)
        self.stdout.write("\nAvailable Demo Accounts for Testing:")
        self.stdout.write("-" * 80)
        self.stdout.write(f"{'Role':<15} | {'Username':<20} | {'Email':<25} | {'Password':<15}")
        self.stdout.write("-" * 80)
        self.stdout.write(f"{'Manager':<15} | {'salon_manager':<20} | {'manager@salon.com':<25} | {default_pwd:<15}")
        self.stdout.write(f"{'Receptionist':<15} | {'salon_receptionist':<20} | {'receptionist@salon.com':<25} | {default_pwd:<15}")
        self.stdout.write(f"{'Staff (Stylist)':<15} | {'stylist_elena':<20} | {'elena@salon.com':<25} | {default_pwd:<15}")
        self.stdout.write(f"{'Staff (Stylist)':<15} | {'stylist_marcus':<20} | {'marcus@salon.com':<25} | {default_pwd:<15}")
        self.stdout.write(f"{'Staff (Stylist)':<15} | {'stylist_linh':<20} | {'linh@salon.com':<25} | {default_pwd:<15}")
        self.stdout.write(f"{'Customer':<15} | {'customer_a':<20} | {'customer_a@example.com':<25} | {default_pwd:<15}")
        self.stdout.write(f"{'Customer':<15} | {'customer_b':<20} | {'customer_b@example.com':<25} | {default_pwd:<15}")
        self.stdout.write("-" * 80)
        self.stdout.write("\nRun this command to seed data at any time:")
        self.stdout.write(self.style.WARNING("python manage.py seed_data"))
        self.stdout.write("=" * 80 + "\n")
