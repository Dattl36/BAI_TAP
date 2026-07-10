import os
from datetime import timedelta
from pathlib import Path
import os
from django.core.exceptions import ImproperlyConfigured
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

load_dotenv(BASE_DIR / ".env")


def env_bool(name, default=False):
    return os.getenv(name, str(default)).strip().lower() in {"1", "true", "yes", "on"}


def env_list(name, default=""):
    return [item.strip() for item in os.getenv(name, default).split(",") if item.strip()]


DEBUG = env_bool("DEBUG", False)
SECRET_KEY = os.getenv("SECRET_KEY", "")
if not DEBUG and not SECRET_KEY:
    raise ImproperlyConfigured("SECRET_KEY is required when DEBUG=False.")
if DEBUG and not SECRET_KEY:
    SECRET_KEY = "unsafe-dev-only-salon-secret-key"

ALLOWED_HOSTS = env_list("ALLOWED_HOSTS", "localhost,127.0.0.1" if DEBUG else "")

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "corsheaders",
    "rest_framework",
    "django_filters",
    "apps.core",
    "apps.accounts",
    "apps.customers",
    "apps.employees",
    "apps.services",
    "apps.appointments",
    "apps.service_execution",
    "apps.billing",
    "apps.payments",
    "apps.promotions",
    "apps.feedback",
    "apps.notifications",
    "apps.reports",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "salon_backend.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    }
]

WSGI_APPLICATION = "salon_backend.wsgi.application"

import dj_database_url
DATABASES = {
    "default": dj_database_url.config(
        default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}",
        conn_max_age=600,
    )
}

AUTH_USER_MODEL = "accounts.User"

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "Asia/Bangkok"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

SECURE_SSL_REDIRECT = env_bool("SECURE_SSL_REDIRECT", not DEBUG)
SESSION_COOKIE_SECURE = env_bool("SESSION_COOKIE_SECURE", not DEBUG)
CSRF_COOKIE_SECURE = env_bool("CSRF_COOKIE_SECURE", not DEBUG)
SECURE_HSTS_SECONDS = int(os.getenv("SECURE_HSTS_SECONDS", "31536000" if not DEBUG else "0"))
SECURE_HSTS_INCLUDE_SUBDOMAINS = env_bool("SECURE_HSTS_INCLUDE_SUBDOMAINS", not DEBUG)
SECURE_HSTS_PRELOAD = env_bool("SECURE_HSTS_PRELOAD", not DEBUG)

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.IsAuthenticated",),
    "DEFAULT_FILTER_BACKENDS": ("django_filters.rest_framework.DjangoFilterBackend",),
    "EXCEPTION_HANDLER": "apps.core.responses.exception_handler",
    "DEFAULT_THROTTLE_CLASSES": (
        "rest_framework.throttling.ScopedRateThrottle",
    ),
    "DEFAULT_THROTTLE_RATES": {
        "otp_send": os.getenv("OTP_SEND_THROTTLE_RATE", "5/min"),
        "otp_verify": os.getenv("OTP_VERIFY_THROTTLE_RATE", "10/min"),
        "appointment_public_lookup": os.getenv("APPOINTMENT_PUBLIC_LOOKUP_THROTTLE_RATE", "30/min"),
    },
}

CORS_ALLOW_ALL_ORIGINS = DEBUG and env_bool("CORS_ALLOW_ALL_ORIGINS", False)
CORS_ALLOWED_ORIGINS = env_list("CORS_ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173" if DEBUG else "")
if not DEBUG and CORS_ALLOW_ALL_ORIGINS:
    raise ImproperlyConfigured("CORS_ALLOW_ALL_ORIGINS is not allowed when DEBUG=False.")

# Email Configuration
EMAIL_BACKEND = os.getenv(
    "EMAIL_BACKEND",
    "django.core.mail.backends.console.EmailBackend" if DEBUG else "django.core.mail.backends.smtp.EmailBackend",
)
EMAIL_HOST = os.getenv("EMAIL_HOST", "smtp.gmail.com")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", "587"))
EMAIL_USE_TLS = env_bool("EMAIL_USE_TLS", True)
EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER", "")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD", "").replace(" ", "")
DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL", "no-reply@salon.com")

CACHES = {
    "default": {
        "BACKEND": os.getenv("CACHE_BACKEND", "django.core.cache.backends.locmem.LocMemCache"),
        "LOCATION": os.getenv("CACHE_LOCATION", "salon-local-cache"),
    }
}

OTP_LIFETIME_SECONDS = int(os.getenv("OTP_LIFETIME_SECONDS", "300"))
OTP_VERIFY_MAX_FAILURES = int(os.getenv("OTP_VERIFY_MAX_FAILURES", "5"))
OTP_VERIFY_LOCKOUT_SECONDS = int(os.getenv("OTP_VERIFY_LOCKOUT_SECONDS", "300"))
OTP_RESEND_COOLDOWN_SECONDS = int(os.getenv("OTP_RESEND_COOLDOWN_SECONDS", "60"))
OTP_RESEND_ROLLING_LIMIT = int(os.getenv("OTP_RESEND_ROLLING_LIMIT", "5"))
OTP_RESEND_ROLLING_SECONDS = int(os.getenv("OTP_RESEND_ROLLING_SECONDS", "900"))
APPOINTMENT_LOOKUP_MAX_RANGE_DAYS = int(os.getenv("APPOINTMENT_LOOKUP_MAX_RANGE_DAYS", "31"))
APPOINTMENT_SLOT_INTERVAL_MINUTES = int(os.getenv("APPOINTMENT_SLOT_INTERVAL_MINUTES", "30"))
INVOICE_ADJUSTMENT_REASON_MIN_LENGTH = int(os.getenv("INVOICE_ADJUSTMENT_REASON_MIN_LENGTH", "5"))
WALLET_TRANSACTION_LIMIT = os.getenv("WALLET_TRANSACTION_LIMIT", "50000000.00")

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=15),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
}
