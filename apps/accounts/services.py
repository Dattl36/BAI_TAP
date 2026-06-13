from apps.accounts.roles import Roles
from apps.core.audit import record_event


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
        raise ValueError("Only employee roles can be created here.")
    password = data.pop("password", "ChangeMe123!")
    user = User(**data)
    user.set_password(password)
    user.save()
    record_event(actor, "account.employee_create", user, resulting_state=user)
    return user
