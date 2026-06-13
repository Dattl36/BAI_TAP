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
    help = "Seed demo data for the salon backend."

    def handle(self, *args, **options):
        User = get_user_model()
        manager, _ = User.objects.get_or_create(username="manager", defaults={"role": Roles.MANAGER, "full_name": "Manager"})
        manager.set_password("ChangeMe123!")
        manager.save()
        receptionist, _ = User.objects.get_or_create(username="receptionist", defaults={"role": Roles.RECEPTIONIST, "full_name": "Receptionist"})
        receptionist.set_password("ChangeMe123!")
        receptionist.save()
        staff_user, _ = User.objects.get_or_create(username="staff1", defaults={"role": Roles.STAFF, "full_name": "Staff One"})
        staff_user.set_password("ChangeMe123!")
        staff_user.save()
        customer_user, _ = User.objects.get_or_create(username="customer1", defaults={"role": Roles.CUSTOMER, "full_name": "Customer One", "email": "customer@example.com"})
        customer_user.set_password("ChangeMe123!")
        customer_user.save()

        staff, _ = EmployeeProfile.objects.get_or_create(user=staff_user, defaults={"role_type": Roles.STAFF, "full_name": "Staff One"})
        EmployeeProfile.objects.get_or_create(user=receptionist, defaults={"role_type": Roles.RECEPTIONIST, "full_name": "Receptionist"})
        EmployeeProfile.objects.get_or_create(user=manager, defaults={"role_type": Roles.MANAGER, "full_name": "Manager"})
        CustomerProfile.objects.get_or_create(user=customer_user, defaults={"full_name": "Customer One", "email": customer_user.email})
        StaffAvailability.objects.get_or_create(employee=staff, date=date.today(), start_time=time(9, 0), end_time=time(17, 0))

        haircut, _ = Service.objects.get_or_create(name="Haircut", defaults={"base_price": 200000, "duration_minutes": 45, "category": "Hair"})
        Service.objects.get_or_create(name="Hair Wash", defaults={"base_price": 100000, "duration_minutes": 30, "category": "Hair"})
        Service.objects.get_or_create(name="Nail Care", defaults={"base_price": 150000, "duration_minutes": 60, "category": "Nail"})

        promo, _ = Promotion.objects.get_or_create(
            name="Welcome",
            defaults={
                "discount_type": "amount",
                "discount_value": 50000,
                "starts_at": timezone.now(),
                "ends_at": timezone.now() + timedelta(days=30),
            },
        )
        promo.service_scope.add(haircut)
        Voucher.objects.get_or_create(
            code="WELCOME50",
            defaults={
                "promotion": promo,
                "discount_type": "amount",
                "discount_value": 50000,
                "starts_at": timezone.now(),
                "expires_at": timezone.now() + timedelta(days=30),
            },
        )
        self.stdout.write(self.style.SUCCESS("Demo data seeded."))
