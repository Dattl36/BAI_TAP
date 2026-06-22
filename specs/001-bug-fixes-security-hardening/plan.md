# Implementation Plan: Bug Fixes & Security Hardening - Sprint 1

## 🏗️ Architecture Overview

### Current State Issues
```
salon_backend/
├── settings.py          ← Hardcoded secrets ❌
├── urls.py
└── wsgi.py

apps/
├── accounts/
│   ├── views.py         ← Missing OTP rate limiting ❌
│   ├── serializers.py
│   └── models.py
├── appointments/
│   ├── views.py         ← Misplaced imports, public endpoint security ❌
│   ├── services.py      ← N+1 queries, timezone issues, availability endpoint ❌
│   └── models.py
├── billing/
│   ├── views.py         ← Missing reason enforcement ❌
│   ├── services.py      ← Negative invoice calculation ❌
│   └── models.py
├── customers/
│   ├── views.py         ← No wallet validation ❌
│   └── models.py
├── core/
│   ├── public_views.py
│   └── responses.py
└── payments/
    └── services.py      ← Review timezone handling

.env                      ← Hardcoded secrets ❌
```

### Proposed Solution Architecture

```
salon_backend/
├── settings.py          ← Environment-based config ✅
├── urls.py
├── wsgi.py
└── middleware.py        ← NEW: Rate limiting

apps/
├── accounts/
│   ├── views.py         ← OTP rate limiting ✅
│   ├── serializers.py
│   └── models.py
├── appointments/
│   ├── views.py         ← Fixed imports, rate limiting ✅
│   ├── services.py      ← Query optimization, timezone fix, availability ✅
│   └── models.py
├── billing/
│   ├── views.py         ← Reason enforcement ✅
│   ├── services.py      ← Safe calculations ✅
│   └── models.py
├── customers/
│   ├── views.py         ← Wallet validation ✅
│   └── models.py
├── core/
│   ├── public_views.py
│   ├── responses.py
│   ├── rate_limiter.py  ← NEW: Rate limiting utility
│   └── config_validator.py ← NEW: Config validation
└── payments/
    └── services.py      ← Timezone review ✅

.env                      ← Template (tracked)
.env.example              ← NEW: Setup reference (tracked)
```

---

## 🛠️ Technology Stack

### Backend Framework
- **Framework**: Django 5.0+
- **ORM**: Django ORM (no raw SQL)
- **API**: Django REST Framework 3.15+
- **Database**: PostgreSQL (production)
- **Cache**: Django Cache Framework (Redis recommended)

### Testing
- **Framework**: pytest-django 4.8+
- **Coverage**: pytest-cov for coverage reporting
- **Fixtures**: Django fixtures + Factory Boy
- **Mocking**: unittest.mock + responses library

### Code Quality
- **Linting**: flake8 + pylint
- **Type Checking**: mypy
- **Format**: black for code formatting
- **Pre-commit**: pre-commit hooks

### Security
- **Rate Limiting**: Django Ratelimit or custom middleware
- **Secrets**: python-dotenv for environment variables
- **Validation**: Django validators + pydantic (optional)

---

## 📋 Implementation Tasks

### Phase 1: Security Foundation (US-001)
**Objective**: Fix hardcoded secrets and environment configuration  
**Duration**: 2-3 hours  
**Owner**: DevOps/Backend Lead

#### Task 1.1: Create Environment Configuration
- **File**: `.env.example`
- **What**: Create template with all required environment variables
- **Acceptance**: Template includes all config keys with example values
```python
# .env.example
SECRET_KEY=your-secret-key-here-change-in-production
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1

DATABASE_ENGINE=django.db.backends.postgresql
DATABASE_NAME=salon_db
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432

EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

CORS_ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

CACHE_BACKEND=django.core.cache.backends.locmem.LocMemCache
```

#### Task 1.2: Update Django Settings
- **File**: `salon_backend/settings.py`
- **Changes**:
  - Load `SECRET_KEY` from `os.getenv("SECRET_KEY")`
  - Load `DEBUG` from `os.getenv("DEBUG", "False")`
  - Update `ALLOWED_HOSTS` from `os.getenv("ALLOWED_HOSTS", "")`
  - Update `CORS_ALLOW_ALL_ORIGINS = False`
  - Set `CORS_ALLOWED_ORIGINS` from `os.getenv("CORS_ALLOWED_ORIGINS", "")`
  - Load email credentials from environment

```python
# salon_backend/settings.py - BEFORE
SECRET_KEY = "dev-only-salon-secret-key"
DEBUG = True
ALLOWED_HOSTS = ["*"]
CORS_ALLOW_ALL_ORIGINS = True
EMAIL_HOST_USER = os.environ.get("EMAIL_HOST_USER", "")

# salon_backend/settings.py - AFTER
import os
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

SECRET_KEY = os.getenv("SECRET_KEY", "dev-key-change-in-production")
DEBUG = os.getenv("DEBUG", "False").lower() == "true"
ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")

CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = os.getenv("CORS_ALLOWED_ORIGINS", "").split(",") if os.getenv("CORS_ALLOWED_ORIGINS") else []

EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER", "")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD", "").replace(" ", "")
```

#### Task 1.3: Add Configuration Validation
- **File**: `apps/core/config_validator.py` (NEW)
- **What**: Validate environment configuration on startup
- **Acceptance**: Raises clear errors if required config missing

```python
# apps/core/config_validator.py
import os
import logging

logger = logging.getLogger(__name__)

def validate_configuration():
    """Validate critical environment configuration on startup."""
    errors = []
    
    # Required in production
    if not os.getenv("SECRET_KEY"):
        errors.append("SECRET_KEY environment variable is required")
    
    if os.getenv("DEBUG", "False").lower() == "true":
        logger.warning("DEBUG=True should never be set in production!")
    
    # Email configuration
    if not os.getenv("EMAIL_HOST_USER"):
        logger.warning("EMAIL_HOST_USER not set - email functionality will be disabled")
    
    if not os.getenv("CORS_ALLOWED_ORIGINS"):
        logger.warning("CORS_ALLOWED_ORIGINS not set - CORS will be restrictive")
    
    if errors:
        raise ValueError(f"Configuration errors:\n" + "\n".join(errors))
    
    logger.info("✅ Configuration validation passed")

# Call in settings.py
if not DEBUG:
    validate_configuration()
```

#### Task 1.4: Update .gitignore
- **File**: `.gitignore`
- **What**: Ensure `.env` file is not committed (`.env.example` is)
- **Acceptance**: `.env` tracked in .gitignore, `.env.example` tracked in git

---

### Phase 2: Import & Code Organization (US-002)
**Objective**: Fix import issues and code organization  
**Duration**: 1 hour  
**Owner**: Code Quality Lead

#### Task 2.1: Fix Misplaced Imports in Appointments Views
- **File**: `apps/appointments/views.py`
- **Lines**: 75-92 (currently imports inside method)
- **What**: Move `from rest_framework.permissions import AllowAny` to top
- **Changes**:

```python
# BEFORE (lines 75-92)
from rest_framework.permissions import AllowAny
@action(detail=False, methods=["get"], permission_classes=[AllowAny])
def busy_staff(self, request):

# AFTER (import at top with others)
from rest_framework.permissions import AllowAny, IsAuthenticated

# Then use in method
@action(detail=False, methods=["get"], permission_classes=[AllowAny])
def busy_staff(self, request):
```

#### Task 2.2: Remove Duplicate Imports
- **File**: `apps/appointments/views.py` (line 38-39)
- **What**: Remove duplicate `from apps.appointments.services import transition_appointment`
- **Acceptance**: No duplicate imports in file

#### Task 2.3: Audit Other Modules
- **Files**: Check all view files for misplaced imports
- **Acceptance**: No imports inside methods/functions

---

### Phase 3: Invoice Calculation Safety (US-003)
**Objective**: Fix negative invoice total bug  
**Duration**: 3 hours  
**Owner**: Backend Developer

#### Task 3.1: Fix create_invoice_from_appointment
- **File**: `apps/billing/services.py` (line 42-43)
- **What**: Ensure total_due never goes negative

```python
# BEFORE
invoice.total_due = subtotal - invoice.discount_total - invoice.reward_discount

# AFTER
from decimal import Decimal
total_after_discounts = subtotal - invoice.discount_total - invoice.reward_discount
invoice.total_due = max(Decimal("0.00"), total_after_discounts)
```

#### Task 3.2: Validate Discount Amounts
- **File**: `apps/billing/services.py`
- **What**: Ensure discounts don't exceed subtotal

```python
def create_invoice_from_appointment(actor, appointment):
    # ... existing code ...
    subtotal = Decimal("0.00")
    # ... calculate subtotal ...
    
    # Validate discounts
    if invoice.discount_total > subtotal:
        raise BusinessError("Discount total cannot exceed subtotal", ErrorCodes.VALIDATION_ERROR)
    if invoice.reward_discount > subtotal:
        raise BusinessError("Reward discount cannot exceed subtotal", ErrorCodes.VALIDATION_ERROR)
    
    # Calculate safely
    total_discounts = invoice.discount_total + invoice.reward_discount
    if total_discounts > subtotal:
        raise BusinessError("Total discounts exceed subtotal", ErrorCodes.VALIDATION_ERROR)
    
    invoice.total_due = subtotal - total_discounts
    invoice.balance_due = invoice.total_due - invoice.paid_amount
```

#### Task 3.3: Add Invoice Calculation Tests
- **File**: `tests/billing/test_invoice_calculations.py` (NEW)
- **What**: Test edge cases for invoice calculations
- **Tests**:
  - Test normal calculation
  - Test with full discount (total_due = 0)
  - Test with discount > subtotal (should fail)
  - Test with both discounts
  - Test balance due calculation

```python
# tests/billing/test_invoice_calculations.py
import pytest
from decimal import Decimal
from apps.billing.services import create_invoice_from_appointment
from apps.core.exceptions import BusinessError

class TestInvoiceCalculations:
    def test_invoice_calculation_normal(self, appointment_with_service):
        """Test normal invoice calculation."""
        invoice = create_invoice_from_appointment(mock_actor, appointment_with_service)
        assert invoice.total_due == Decimal("150000.00")
        assert invoice.balance_due == Decimal("150000.00")
    
    def test_invoice_never_negative(self, appointment_with_service):
        """Test that invoice total never goes negative."""
        invoice = create_invoice_from_appointment(mock_actor, appointment_with_service)
        invoice.discount_total = Decimal("200000.00")  # More than subtotal
        # Should raise error or cap to 0
        assert invoice.total_due >= Decimal("0.00")
    
    def test_excessive_discount_fails(self, appointment_with_service):
        """Test that excessive discounts are rejected."""
        with pytest.raises(BusinessError):
            # Simulate excessive discount scenario
            pass
```

---

### Phase 4: OTP Security & Rate Limiting (US-004)
**Objective**: Prevent OTP brute force attacks  
**Duration**: 4 hours  
**Owner**: Security Engineer

#### Task 4.1: Create Rate Limiter Utility
- **File**: `apps/core/rate_limiter.py` (NEW)
- **What**: Reusable rate limiting utility

```python
# apps/core/rate_limiter.py
from django.core.cache import cache
from apps.core.exceptions import BusinessError, ErrorCodes

class RateLimiter:
    """Rate limiter using Django cache."""
    
    def __init__(self, cache_key_prefix, max_attempts=3, lockout_duration=300):
        self.cache_key_prefix = cache_key_prefix
        self.max_attempts = max_attempts
        self.lockout_duration = lockout_duration
    
    def get_key(self, identifier):
        """Generate cache key for identifier."""
        return f"{self.cache_key_prefix}:{identifier}"
    
    def get_attempts(self, identifier):
        """Get current attempt count."""
        key = self.get_key(identifier)
        return cache.get(key, 0)
    
    def increment(self, identifier):
        """Increment attempt counter."""
        key = self.get_key(identifier)
        current = self.get_attempts(identifier)
        cache.set(key, current + 1, self.lockout_duration)
        return current + 1
    
    def reset(self, identifier):
        """Reset attempt counter."""
        key = self.get_key(identifier)
        cache.delete(key)
    
    def is_locked_out(self, identifier):
        """Check if identifier is locked out."""
        return self.get_attempts(identifier) >= self.max_attempts
    
    def check_and_raise(self, identifier):
        """Check rate limit and raise error if exceeded."""
        if self.is_locked_out(identifier):
            raise BusinessError(
                "Too many attempts. Please try again later.",
                ErrorCodes.RATE_LIMIT_EXCEEDED,
                status_code=429
            )

# Add ErrorCode for rate limiting
class ErrorCodes:
    # ... existing codes ...
    RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED"
```

#### Task 4.2: Add OTP Rate Limiting to Views
- **File**: `apps/accounts/views.py` (method: `verify_email`)
- **What**: Implement rate limiting in OTP verification

```python
from apps.core.rate_limiter import RateLimiter

class AuthViewSet(viewsets.GenericViewSet):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.otp_limiter = RateLimiter(
            cache_key_prefix="otp_verify",
            max_attempts=3,
            lockout_duration=300  # 5 minutes
        )
    
    @action(detail=False, methods=["post"], url_path="verify-email")
    def verify_email(self, request):
        email = request.data.get("email")
        otp = request.data.get("otp")
        
        if not email or not otp:
            raise BusinessError("Please provide email and OTP")
        
        # Check rate limit first
        self.otp_limiter.check_and_raise(email)
        
        from django.core.cache import cache
        cached_otp = cache.get(f"otp_{email}")
        
        if not cached_otp or str(cached_otp) != str(otp):
            # Increment failed attempts
            attempts = self.otp_limiter.increment(email)
            remaining = self.otp_limiter.max_attempts - attempts
            
            raise BusinessError(
                f"Invalid OTP. {remaining} attempts remaining.",
                ErrorCodes.INVALID_OTP
            )
        
        user = User.objects.filter(email=email).first()
        if not user:
            raise BusinessError("Account not found")
        
        user.is_active = True
        user.save(update_fields=["is_active"])
        
        # Clear rate limit on success
        self.otp_limiter.reset(email)
        cache.delete(f"otp_{email}")
        
        refresh = RefreshToken.for_user(user)
        return success(
            {"refresh": str(refresh), "access": str(refresh.access_token)},
            "Account verified successfully"
        )
```

#### Task 4.3: Add OTP Rate Limiting Tests
- **File**: `tests/accounts/test_otp_security.py` (NEW)
- **Tests**:
  - Test 1st attempt works
  - Test 3rd attempt works
  - Test 4th attempt fails with 429
  - Test lockout duration
  - Test reset on success
  - Test attempt counter increments

---

### Phase 5: Wallet Validation (US-005)
**Objective**: Validate wallet transactions  
**Duration**: 2 hours  
**Owner**: Backend Developer

#### Task 5.1: Add Wallet Validation
- **File**: `apps/customers/views.py` (method: `topup`)
- **What**: Validate amount before transaction

```python
from decimal import Decimal

@action(detail=True, methods=["post"])
def topup(self, request, pk=None):
    customer = self.get_object()
    amount = request.data.get("amount")
    
    # Validate amount
    if not amount:
        raise BusinessError("Top-up amount is required")
    
    try:
        amount_decimal = Decimal(str(amount))
    except:
        raise BusinessError("Invalid amount format")
    
    # Validate amount > 0
    if amount_decimal <= Decimal("0"):
        raise BusinessError("Top-up amount must be greater than 0")
    
    # Validate amount <= max limit (100M VND)
    MAX_TOPUP = Decimal("100000000")
    if amount_decimal > MAX_TOPUP:
        raise BusinessError(f"Top-up amount cannot exceed {MAX_TOPUP:,.0f} VND")
    
    # Safe transaction
    from django.db import transaction
    from apps.payments.models import WalletTransaction
    
    with transaction.atomic():
        customer.wallet_balance += amount_decimal
        customer.save(update_fields=["wallet_balance"])
        
        tx = WalletTransaction.objects.create(
            customer=customer,
            amount=amount_decimal,
            transaction_type="top_up",
            description="Customer top-up"
        )
        
        return success({
            "wallet_balance": str(customer.wallet_balance),
            "transaction_id": tx.id
        }, "Top-up successful", 201)
```

#### Task 5.2: Add Wallet Validation Tests
- **File**: `tests/customers/test_wallet_validation.py` (NEW)
- **Tests**:
  - Test valid top-up
  - Test zero amount rejected
  - Test negative amount rejected
  - Test max amount enforced
  - Test Decimal precision

---

### Phase 6: Query Optimization (US-006)
**Objective**: Fix N+1 query problem  
**Duration**: 2 hours  
**Owner**: Backend Developer

#### Task 6.1: Optimize Invoice Creation Queries
- **File**: `apps/billing/services.py` (function: `create_invoice_from_appointment`)
- **What**: Use select_related and prefetch_related

```python
# BEFORE (N+1 problem)
for item in appointment.appointment_services.select_related("service"):
    # This causes N additional queries for each incidental
    for incidental in execution.incidentals.all():

# AFTER (Optimized)
from django.db.models import Prefetch

def create_invoice_from_appointment(actor, appointment):
    # Fetch appointment with prefetched services and execution
    appointment = Appointment.objects.prefetch_related(
        Prefetch('appointment_services__service'),
        Prefetch('execution__incidentals')
    ).get(id=appointment.id)
    
    # Now this is efficient
    for item in appointment.appointment_services.all():
        # Service already prefetched
        service = item.service
```

#### Task 6.2: Add Query Count Tests
- **File**: `tests/billing/test_invoice_performance.py` (NEW)
- **What**: Verify query count stays low

```python
import pytest
from django.test.utils import override_settings
from django.db import connection
from django.test import override_settings

@override_settings(DEBUG=True)
class TestInvoicePerformance:
    def test_invoice_creation_query_count(self, appointment_with_service):
        """Test that invoice creation uses optimal queries."""
        from django.db import reset_queries
        
        reset_queries()
        invoice = create_invoice_from_appointment(mock_actor, appointment_with_service)
        
        # Should be <= 5 queries
        assert len(connection.queries) <= 5, f"Too many queries: {len(connection.queries)}"
```

---

### Phase 7: Availability Endpoint (US-007)
**Objective**: Implement real availability endpoint  
**Duration**: 3 hours  
**Owner**: Backend Developer

#### Task 7.1: Create Availability Function
- **File**: `apps/appointments/services.py` (NEW function)
- **What**: Generate available time slots

```python
from datetime import datetime, timedelta, time
from django.utils import timezone

def get_available_slots(staff, start_date, end_date, duration_minutes=30):
    """
    Get available time slots for staff between start_date and end_date.
    
    Returns list of available start times (datetime).
    """
    available_slots = []
    current = timezone.make_aware(
        datetime.combine(start_date.date(), time(9, 0))  # Start at 9 AM
    )
    end = timezone.make_aware(
        datetime.combine(end_date.date(), time(18, 0))  # End at 6 PM
    )
    
    slot_duration = timedelta(minutes=duration_minutes)
    
    while current + slot_duration <= end:
        # Check if slot overlaps with existing appointments
        if not has_conflict(staff, current, current + slot_duration):
            available_slots.append(current)
        
        current += timedelta(minutes=30)  # 30-minute intervals
    
    return available_slots
```

#### Task 7.2: Update Availability Endpoint
- **File**: `apps/appointments/views.py` (method: `availability`)
- **What**: Return actual availability data

```python
@action(detail=False, methods=["get"])
def availability(self, request):
    staff_id = request.query_params.get("staff_id")
    start_date = request.query_params.get("start_date")
    end_date = request.query_params.get("end_date")
    duration = int(request.query_params.get("duration", 30))
    
    if not all([staff_id, start_date, end_date]):
        return success({
            "error": "Missing parameters: staff_id, start_date, end_date"
        }, status=400)
    
    try:
        from datetime import datetime
        start = datetime.fromisoformat(start_date)
        end = datetime.fromisoformat(end_date)
        
        staff = EmployeeProfile.objects.get(id=staff_id)
        slots = get_available_slots(staff, start, end, duration)
        
        return success({
            "staff_id": staff_id,
            "start_date": start_date,
            "end_date": end_date,
            "available_slots": [s.isoformat() for s in slots]
        })
    except Exception as e:
        return success({"error": str(e)}, status=400)
```

#### Task 7.3: Add Availability Tests
- **File**: `tests/appointments/test_availability.py` (NEW)
- **Tests**:
  - Test available slots generated
  - Test booked slots excluded
  - Test staff availability considered

---

### Phase 8: Timezone Handling (US-008)
**Objective**: Fix timezone-aware datetime handling  
**Duration**: 2 hours  
**Owner**: Backend Developer

#### Task 8.1: Review Timezone Usage
- **File**: `apps/appointments/services.py` (function: `reschedule_appointment`)
- **Lines**: 123-128
- **What**: Ensure timezone-aware comparisons

```python
# BEFORE (potential naive/aware mismatch)
if timezone.now() > appointment.created_at + timedelta(hours=1):

# AFTER (guaranteed safe)
from django.utils import timezone

# Ensure both datetimes are timezone-aware
now = timezone.now()  # Returns timezone-aware in Django
created = appointment.created_at  # Should be timezone-aware from model

if now > created + timedelta(hours=1):
    # Safe comparison
```

#### Task 8.2: Add Timezone Validation
- **File**: `apps/core/models.py` or base model
- **What**: Ensure all datetimes are timezone-aware

```python
from django.db import models

class BaseModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        abstract = True
    
    # Ensure timezone-aware datetimes in model
```

#### Task 8.3: Add Timezone Tests
- **File**: `tests/appointments/test_timezone_handling.py` (NEW)
- **Tests**:
  - Test reschedule window calculated correctly
  - Test timezone-aware datetime comparisons
  - Test across different timezones

---

### Phase 9: Public Endpoint Security (US-009)
**Objective**: Add rate limiting and validation  
**Duration**: 2.5 hours  
**Owner**: Security Engineer

#### Task 9.1: Create Rate Limiting Middleware
- **File**: `salon_backend/middleware.py` (NEW)
- **What**: IP-based rate limiting

```python
# salon_backend/middleware.py
from django.core.cache import cache
from django.http import JsonResponse
from apps.core.rate_limiter import RateLimiter

class RateLimitMiddleware:
    """Rate limiting middleware based on IP address."""
    
    def __init__(self, get_response):
        self.get_response = get_response
        self.limiter = RateLimiter(
            cache_key_prefix="api_rate_limit",
            max_attempts=100,
            lockout_duration=60  # Per minute
        )
    
    def __call__(self, request):
        # Get client IP
        ip = self.get_client_ip(request)
        
        # Check specific endpoints that need rate limiting
        if request.path.startswith("/api/appointments/busy_staff"):
            try:
                self.limiter.check_and_raise(ip)
            except BusinessError as e:
                return JsonResponse(
                    {"error": str(e)},
                    status=429
                )
        
        response = self.get_response(request)
        return response
    
    @staticmethod
    def get_client_ip(request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
```

#### Task 9.2: Add Input Validation to busy_staff
- **File**: `apps/appointments/views.py` (method: `busy_staff`)
- **What**: Validate time range parameters

```python
@action(detail=False, methods=["get"], permission_classes=[AllowAny])
def busy_staff(self, request):
    start = request.query_params.get("start")
    end = request.query_params.get("end")
    
    if not start or not end:
        return success({"busy_staff_ids": []})
    
    try:
        from datetime import datetime
        start_dt = datetime.fromisoformat(start)
        end_dt = datetime.fromisoformat(end)
        
        # Validate time range
        if start_dt >= end_dt:
            raise ValueError("Start time must be before end time")
        
        if (end_dt - start_dt).total_seconds() > 86400:  # Max 24 hours
            raise ValueError("Time range cannot exceed 24 hours")
    except ValueError as e:
        return success({"error": str(e)}, status=400)
    
    # Only return staff IDs, no sensitive data
    qs = Appointment.objects.filter(
        status__in=ACTIVE_STATUSES,
        scheduled_start__lt=end_dt,
        scheduled_end__gt=start_dt,
    ).values_list("staff_id", flat=True).distinct()
    
    return success({"busy_staff_ids": list(qs)})
```

#### Task 9.3: Register Middleware
- **File**: `salon_backend/settings.py`
- **What**: Add middleware to MIDDLEWARE list

```python
MIDDLEWARE = [
    # ... existing middleware ...
    "salon_backend.middleware.RateLimitMiddleware",
]
```

---

### Phase 10: Invoice Adjustment Audit (US-010)
**Objective**: Enforce reason documentation  
**Duration**: 1.5 hours  
**Owner**: Backend Developer

#### Task 10.1: Update adjust_invoice Function
- **File**: `apps/billing/services.py` (function: `adjust_invoice`)
- **What**: Make reason required with minimum length

```python
def adjust_invoice(actor, invoice, amount, reason=""):
    # Validate reason is provided and sufficient
    if not reason or len(reason.strip()) < 10:
        raise BusinessError(
            "Adjustment reason is required and must be at least 10 characters",
            ErrorCodes.VALIDATION_ERROR
        )
    
    invoice.total_due += Decimal(str(amount))
    invoice.balance_due = invoice.total_due - invoice.paid_amount
    invoice.status = "adjusted"
    invoice.save()
    
    record_event(
        actor,
        "invoice.adjust",
        invoice,
        metadata={
            "reason": reason,
            "amount": str(amount)
        }
    )
    
    return invoice
```

#### Task 10.2: Update Views to Enforce Reason
- **File**: `apps/billing/views.py` (method: `adjust`)
- **What**: Validate reason before calling service

```python
@action(detail=True, methods=["post"])
def adjust(self, request, pk=None):
    amount = request.data.get("amount", 0)
    reason = request.data.get("reason", "")
    
    if not reason or len(reason.strip()) < 10:
        raise BusinessError(
            "Reason is required (minimum 10 characters)",
            ErrorCodes.VALIDATION_ERROR
        )
    
    invoice = adjust_invoice(request.user, self.get_object(), amount, reason)
    return success(self.get_serializer(invoice).data)
```

#### Task 10.3: Add Audit Tests
- **File**: `tests/billing/test_adjustment_audit.py` (NEW)
- **Tests**:
  - Test reason required
  - Test reason length enforced
  - Test audit log created

---

### Phase 11: Status Transition Validation (US-011)
**Objective**: Strengthen state machine validation  
**Duration**: 2 hours  
**Owner**: Backend Developer

#### Task 11.1: Review Transition Logic
- **File**: `apps/appointments/services.py` (function: `transition_appointment`)
- **Lines**: 70-82
- **What**: Already has basic validation, add atomic guarantees

```python
@transaction.atomic
def transition_appointment(actor, appointment, new_status, reason=""):
    allowed = {
        "requested": {"confirmed", "cancelled"},
        "confirmed": {"arrived", "cancelled", "no_show"},
        "arrived": {"in_service"},
        "in_service": {"completed"},
        "completed": {"invoiced"},
        "invoiced": {"closed"},
    }
    
    current_status = appointment.status
    if new_status not in allowed.get(current_status, set()):
        record_rejection(
            actor,
            "appointment.invalid_transition",
            f"{current_status}->{new_status}",
            {"entity_type": "Appointment"}
        )
        raise BusinessError(
            f"Cannot transition from {current_status} to {new_status}",
            ErrorCodes.INVALID_STATUS_TRANSITION,
            status_code=400
        )
    
    # Record prior state
    prior = {
        "status": current_status,
        "updated_at": appointment.updated_at.isoformat()
    }
    
    # Perform transition
    appointment.status = new_status
    appointment.updated_at = timezone.now()
    
    # Handle side effects
    if new_status == "cancelled":
        appointment.cancellation_reason = reason
        # ... handle refund logic ...
    
    if new_status == "no_show":
        appointment.no_show_reason = reason
    
    appointment.save()
    
    # Audit
    record_event(
        actor,
        f"appointment.{new_status}",
        appointment,
        prior_state=prior,
        resulting_state={"status": new_status}
    )
    
    # Notifications
    notify_user(
        user=appointment.customer.user,
        category="appointment",
        title=f"Appointment {new_status}",
        message=f"Your appointment status changed to {new_status}",
        related=appointment
    )
    
    return appointment
```

#### Task 11.2: Add State Machine Tests
- **File**: `tests/appointments/test_transition_validation.py` (NEW)
- **Tests**:
  - Test valid transitions
  - Test invalid transitions rejected
  - Test all status combinations
  - Test atomic rollback on error

---

### Phase 12: Email Configuration Validation (US-012)
**Objective**: Validate on startup  
**Duration**: 1.5 hours  
**Owner**: DevOps Engineer

#### Task 12.1: Extend Config Validator
- **File**: `apps/core/config_validator.py`
- **What**: Add email SMTP validation

```python
def validate_email_configuration():
    """Validate email configuration and SMTP connectivity."""
    if not os.getenv("EMAIL_HOST_USER"):
        logger.warning("EMAIL not configured - notifications will be disabled")
        return
    
    # Attempt SMTP connection
    try:
        import smtplib
        
        host = os.getenv("EMAIL_HOST")
        port = int(os.getenv("EMAIL_PORT", 587))
        user = os.getenv("EMAIL_HOST_USER")
        password = os.getenv("EMAIL_HOST_PASSWORD")
        use_tls = os.getenv("EMAIL_USE_TLS", "True").lower() == "true"
        
        server = smtplib.SMTP(host, port, timeout=5)
        if use_tls:
            server.starttls()
        server.login(user, password)
        server.quit()
        
        logger.info("✅ Email configuration validated")
    except Exception as e:
        logger.error(f"❌ Email configuration error: {str(e)}")
        if not os.getenv("DEBUG", "False").lower() == "true":
            raise ValueError(f"Email configuration failed: {str(e)}")

# Call from settings.py
if os.getenv("EMAIL_HOST_USER"):
    validate_email_configuration()
```

#### Task 12.2: Add Health Check Endpoint
- **File**: `apps/core/views.py` (or new file)
- **What**: `/health` endpoint to verify configuration

```python
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """Health check endpoint."""
    checks = {
        "database": check_database(),
        "cache": check_cache(),
        "email": check_email(),
    }
    
    status = "healthy" if all(checks.values()) else "degraded"
    return Response({
        "status": status,
        "checks": checks
    })

def check_database():
    try:
        from django.db import connection
        connection.ensure_connection()
        return True
    except:
        return False

def check_cache():
    try:
        from django.core.cache import cache
        cache.set("health_check", "ok", 1)
        return cache.get("health_check") == "ok"
    except:
        return False

def check_email():
    try:
        # Minimal check - just verify SMTP connection possible
        return os.getenv("EMAIL_HOST_USER") is not None
    except:
        return False
```

---

### Phase 13: Error Handling Tests (US-013)
**Objective**: Comprehensive error scenario testing  
**Duration**: 4-5 hours  
**Owner**: QA Engineer

#### Task 13.1: Create Error Test Suite Structure
- **Directory**: `tests/error_handling/`
- **Files**:
  - `test_validation_errors.py`
  - `test_authentication_errors.py`
  - `test_business_logic_errors.py`
  - `test_permission_errors.py`

#### Task 13.2: Write Error Handling Tests
- **File**: `tests/error_handling/test_validation_errors.py`

```python
import pytest
from rest_framework.test import APIClient
from apps.core.exceptions import BusinessError, ErrorCodes

class TestValidationErrors:
    @pytest.fixture
    def client(self):
        return APIClient()
    
    def test_invalid_email_format(self, client):
        """Test invalid email rejection."""
        response = client.post("/api/auth/register/", {
            "username": "test",
            "password": "Test@123456",
            "email": "invalid-email",
        })
        assert response.status_code == 400
        assert "email" in response.data
    
    def test_short_password(self, client):
        """Test password too short."""
        response = client.post("/api/auth/register/", {
            "username": "test",
            "password": "short",
            "email": "test@example.com",
        })
        assert response.status_code == 400
    
    def test_missing_required_field(self, client):
        """Test missing required fields."""
        response = client.post("/api/auth/register/", {
            "username": "test",
            "password": "Test@123456",
            # missing email
        })
        assert response.status_code == 400
```

#### Task 13.3: Generate Coverage Report
- **Command**: `pytest --cov=apps --cov-report=html`
- **Goal**: Achieve 80%+ coverage on critical paths

---

## 📅 Implementation Timeline

| Phase | Tasks | Duration | Dependency |
|-------|-------|----------|-----------|
| 1 | Security Foundation | 2-3h | None |
| 2 | Import Organization | 1h | None |
| 3 | Invoice Calculations | 3h | None |
| 4 | OTP Security | 4h | Phase 1 |
| 5 | Wallet Validation | 2h | None |
| 6 | Query Optimization | 2h | None |
| 7 | Availability Endpoint | 3h | None |
| 8 | Timezone Handling | 2h | None |
| 9 | Public Endpoint Security | 2.5h | Phase 1 |
| 10 | Invoice Audit | 1.5h | None |
| 11 | Status Transitions | 2h | None |
| 12 | Email Validation | 1.5h | Phase 1 |
| 13 | Error Testing | 4-5h | All phases |

**Total Estimated Time**: ~33-35 hours of development

---

## 🧪 Testing Strategy

### Unit Tests
- Test each service function independently
- Mock external dependencies
- Cover happy path and edge cases
- Target: 80%+ coverage

### Integration Tests
- Test API endpoints end-to-end
- Use real database with transactions
- Verify error responses
- Test authentication/permissions

### Performance Tests
- Query count verification
- Response time benchmarks
- Load testing for rate limiting

### Security Tests
- OTP brute force prevention
- Rate limiting enforcement
- CORS policy verification
- Secret management validation

---

## 🚀 Deployment Checklist

- [ ] All tests passing (unit + integration)
- [ ] Code coverage > 80%
- [ ] No linting warnings
- [ ] Security scan passed
- [ ] .env.example updated
- [ ] Database migrations created (if needed)
- [ ] API documentation updated
- [ ] Performance baseline met
- [ ] Monitoring alerts configured
- [ ] Rollback plan documented
