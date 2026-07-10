import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "salon_backend.settings")
django.setup()

from apps.accounts.models import User
from apps.employees.models import EmployeeProfile

user = User.objects.create(username="test_admin_2", email="test2@x.com")
EmployeeProfile.objects.create(user=user, role_type="manager")
