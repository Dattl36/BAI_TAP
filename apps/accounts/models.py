from django.contrib.auth.models import AbstractUser
from django.db import models

from apps.accounts.roles import Roles


class User(AbstractUser):
    role = models.CharField(max_length=32, choices=Roles.CHOICES, default=Roles.CUSTOMER)
    phone = models.CharField(max_length=32, blank=True)
    full_name = models.CharField(max_length=160, blank=True)
    account_status = models.CharField(max_length=32, default="active")
    last_login_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.username} ({self.role})"
