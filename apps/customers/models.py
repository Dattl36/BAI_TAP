from django.conf import settings
from django.db import models

from apps.core.models import SoftDeleteModel


class CustomerProfile(SoftDeleteModel):
    STATUS_CHOICES = (("active", "Active"), ("inactive", "Inactive"), ("archived", "Archived"))

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="customer_profile")
    code = models.CharField(max_length=32, unique=True, blank=True)
    full_name = models.CharField(max_length=160)
    phone = models.CharField(max_length=32, blank=True)
    email = models.EmailField(blank=True)
    birth_date = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=32, blank=True)
    address = models.TextField(blank=True)
    preferences = models.TextField(blank=True)
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default="active")

    def save(self, *args, **kwargs):
        if not self.code and self.pk:
            self.code = f"CUS{self.pk:05d}"
        super().save(*args, **kwargs)
        if not self.code:
            self.code = f"CUS{self.pk:05d}"
            super().save(update_fields=["code"])

    def __str__(self):
        return self.full_name
