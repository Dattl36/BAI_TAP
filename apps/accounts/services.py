import hashlib
import secrets

from django.conf import settings
from django.core.cache import cache
from django.core.mail import send_mail

from apps.accounts.roles import Roles
from apps.core.audit import record_event
from apps.core.exceptions import BusinessError, ErrorCodes


def _normalize_phone(phone):
    return (phone or "").strip()

def _phone_token(phone):
    return hashlib.sha256(_normalize_phone(phone).encode("utf-8")).hexdigest()

def _otp_key(phone):
    return f"otp:value:{_phone_token(phone)}"

def _otp_fail_key(phone):
    return f"otp:fail:{_phone_token(phone)}"

def _otp_lock_key(phone):
    return f"otp:lock:{_phone_token(phone)}"

def _otp_resend_cooldown_key(phone):
    return f"otp:resend-cooldown:{_phone_token(phone)}"

def _otp_resend_window_key(phone):
    return f"otp:resend-window:{_phone_token(phone)}"


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
    phone = _normalize_phone(user.phone)
    if enforce_resend_limits:
        if cache.get(_otp_resend_cooldown_key(phone)):
            raise BusinessError("Vui lòng chờ trước khi yêu cầu mã OTP mới.", ErrorCodes.VALIDATION_ERROR, status_code=429)
        current = _increment_cache_counter(_otp_resend_window_key(phone), settings.OTP_RESEND_ROLLING_SECONDS)
        if current > settings.OTP_RESEND_ROLLING_LIMIT:
            raise BusinessError("Bạn đã yêu cầu quá nhiều mã OTP. Vui lòng thử lại sau.", ErrorCodes.VALIDATION_ERROR, status_code=429)

    otp_code = generate_otp()
    cache.set(_otp_key(phone), otp_code, timeout=settings.OTP_LIFETIME_SECONDS)
    cache.delete(_otp_fail_key(phone))
    cache.delete(_otp_lock_key(phone))
    cache.set(_otp_resend_cooldown_key(phone), True, timeout=settings.OTP_RESEND_COOLDOWN_SECONDS)

    return otp_code


def verify_registration_otp(phone, otp):
    phone = _normalize_phone(phone)
    if cache.get(_otp_lock_key(phone)):
        raise BusinessError("Bạn đã nhập sai quá nhiều lần. Vui lòng thử lại sau.", ErrorCodes.VALIDATION_ERROR, status_code=429)

    cached_otp = cache.get(_otp_key(phone))
    if not cached_otp or str(cached_otp) != str(otp):
        failures = _increment_cache_counter(_otp_fail_key(phone), settings.OTP_VERIFY_LOCKOUT_SECONDS)
        if failures > settings.OTP_VERIFY_MAX_FAILURES:
            cache.set(_otp_lock_key(phone), True, timeout=settings.OTP_VERIFY_LOCKOUT_SECONDS)
            raise BusinessError("Bạn đã nhập sai quá nhiều lần. Vui lòng thử lại sau.", ErrorCodes.VALIDATION_ERROR, status_code=429)
        _generic_otp_error()

    cache.delete(_otp_key(phone))
    cache.delete(_otp_fail_key(phone))
    cache.delete(_otp_lock_key(phone))
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
