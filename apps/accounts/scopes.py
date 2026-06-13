from apps.accounts.roles import Roles


def scope_queryset(user, queryset, customer_field="customer", staff_field="staff"):
    if not getattr(user, "is_authenticated", False):
        return queryset.none()
    if user.role == Roles.MANAGER:
        return queryset
    if user.role == Roles.CUSTOMER:
        customer = getattr(user, "customer_profile", None)
        return queryset.filter(**{customer_field: customer}) if customer is not None else queryset.none()
    if user.role == Roles.STAFF:
        employee = getattr(user, "employee_profile", None)
        return queryset.filter(**{staff_field: employee}) if employee is not None else queryset.none()
    if user.role == Roles.RECEPTIONIST:
        return queryset
    return queryset.none()
