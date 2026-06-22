import hashlib
import secrets

from django.conf import settings
from django.core.cache import cache
from django.core.mail import send_mail

from apps.accounts.roles import Roles
from apps.core.audit import record_event
from apps.core.exceptions import BusinessError, ErrorCodes


def _normalize_email(email):
    return (email or "").strip().lower()


def _email_token(email):
    return hashlib.sha256(_normalize_email(email).encode("utf-8")).hexdigest()


def _otp_key(email):
    return f"otp:value:{_email_token(email)}"


def _otp_fail_key(email):
    return f"otp:fail:{_email_token(email)}"


def _otp_lock_key(email):
    return f"otp:lock:{_email_token(email)}"


def _otp_resend_cooldown_key(email):
    return f"otp:resend-cooldown:{_email_token(email)}"


def _otp_resend_window_key(email):
    return f"otp:resend-window:{_email_token(email)}"


def _increment_cache_counter(key, timeout):
    added = cache.add(key, 1, timeout=timeout)
    if added:
        return 1
    try:
        return cache.incr(key)
    except ValueError:
        cache.set(key, 1, timeout=timeout)
        return 1


def _generic_otp_error():
    raise BusinessError("Mã xác minh không hợp lệ hoặc đã hết hạn.", ErrorCodes.VALIDATION_ERROR)


def generate_otp():
    return f"{secrets.randbelow(1000000):06d}"


def send_registration_otp(user, *, enforce_resend_limits=False):
    email = _normalize_email(user.email)
    if enforce_resend_limits:
        if cache.get(_otp_resend_cooldown_key(email)):
            raise BusinessError("Vui lòng chờ trước khi yêu cầu mã OTP mới.", ErrorCodes.VALIDATION_ERROR, status_code=429)
        current = _increment_cache_counter(_otp_resend_window_key(email), settings.OTP_RESEND_ROLLING_SECONDS)
        if current > settings.OTP_RESEND_ROLLING_LIMIT:
            raise BusinessError("Bạn đã yêu cầu quá nhiều mã OTP. Vui lòng thử lại sau.", ErrorCodes.VALIDATION_ERROR, status_code=429)

    otp_code = generate_otp()
    cache.set(_otp_key(email), otp_code, timeout=settings.OTP_LIFETIME_SECONDS)
    cache.delete(_otp_fail_key(email))
    cache.delete(_otp_lock_key(email))
    cache.set(_otp_resend_cooldown_key(email), True, timeout=settings.OTP_RESEND_COOLDOWN_SECONDS)

    send_mail(
        "Salon App - Mã xác minh đăng ký",
        f"Mã xác minh (OTP) của bạn là: {otp_code}\nMã này sẽ hết hạn sau 5 phút.",
        settings.DEFAULT_FROM_EMAIL,
        [email],
        fail_silently=False,
    )


def verify_registration_otp(email, otp):
    email = _normalize_email(email)
    if cache.get(_otp_lock_key(email)):
        raise BusinessError("Bạn đã nhập sai quá nhiều lần. Vui lòng thử lại sau.", ErrorCodes.VALIDATION_ERROR, status_code=429)

    cached_otp = cache.get(_otp_key(email))
    if not cached_otp or str(cached_otp) != str(otp):
        failures = _increment_cache_counter(_otp_fail_key(email), settings.OTP_VERIFY_LOCKOUT_SECONDS)
        if failures > settings.OTP_VERIFY_MAX_FAILURES:
            cache.set(_otp_lock_key(email), True, timeout=settings.OTP_VERIFY_LOCKOUT_SECONDS)
            raise BusinessError("Bạn đã nhập sai quá nhiều lần. Vui lòng thử lại sau.", ErrorCodes.VALIDATION_ERROR, status_code=429)
        _generic_otp_error()

    cache.delete(_otp_key(email))
    cache.delete(_otp_fail_key(email))
    cache.delete(_otp_lock_key(email))
    return True


def create_customer_profile_for_user(user):
    from apps.customers.models import CustomerProfile

    profile, _ = CustomerProfile.objects.get_or_create(
        user=user,
        defaults={
            "full_name": user.full_name or user.username,
            "phone": user.phone,
            "email": user.email,
        },
    )
    return profile


def deactivate_user(actor, user):
    prior = {"is_active": user.is_active, "account_status": user.account_status}
    user.is_active = False
    user.account_status = "inactive"
    user.save(update_fields=["is_active", "account_status"])
    record_event(actor, "account.deactivate", user, prior_state=prior, resulting_state=user)
    return user


def create_employee_user(actor, **data):
    from django.contrib.auth import get_user_model

    User = get_user_model()
    role = data.get("role", Roles.STAFF)
    if role not in {Roles.RECEPTIONIST, Roles.STAFF, Roles.MANAGER}:
        raise ValueError("Chỉ có thể tạo tài khoản nhân viên tại đây.")
    password = data.pop("password", "ChangeMe123!")
    user = User(**data)
    user.set_password(password)
    user.save()
    record_event(actor, "account.employee_create", user, resulting_state=user)
    return user
