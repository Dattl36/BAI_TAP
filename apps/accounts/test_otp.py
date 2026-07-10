import re

import pytest
from django.core.cache import cache

from apps.accounts.models import User
from apps.accounts.services import send_registration_otp, verify_registration_otp
from apps.core.exceptions import BusinessError


@pytest.mark.django_db
def test_registration_otp_is_single_use(settings):
    settings.EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"
    cache.clear()
    user = User.objects.create_user(username="otp-user", email="otp@example.com", password="ChangeMe123!", is_active=False)

    send_registration_otp(user)
    from django.core import mail

    otp = re.search(r"\b\d{6}\b", mail.outbox[-1].body).group(0)
    assert verify_registration_otp("OTP@example.com", otp) is True

    with pytest.raises(BusinessError):
        verify_registration_otp("otp@example.com", otp)


@pytest.mark.django_db
def test_registration_otp_locks_after_configured_failures(settings):
    settings.EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"
    settings.OTP_VERIFY_MAX_FAILURES = 1
    cache.clear()
    user = User.objects.create_user(username="otp-lock", email="lock@example.com", password="ChangeMe123!", is_active=False)
    send_registration_otp(user)

    with pytest.raises(BusinessError) as first:
        verify_registration_otp("lock@example.com", "000000")
    assert first.value.status_code == 400

    with pytest.raises(BusinessError) as second:
        verify_registration_otp("lock@example.com", "111111")
    assert second.value.status_code == 429
