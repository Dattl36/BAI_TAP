from apps.accounts.roles import Roles


def scope_queryset(user, queryset, customer_field="customer", staff_field="staff"):
    if not getattr(user, "is_authenticated", False):
        return queryset.none()
    if user.role == Roles.MANAGER:
        return queryset
    if user.role == Roles.CUSTOMER:
        customer = getattr(user, "customer_profile", None)
        if customer is None:
            return queryset.none()
        if queryset.model.__name__ == "CustomerProfile":
            return queryset.filter(pk=customer.pk)
        return queryset.filter(**{customer_field: customer})
    if user.role == Roles.STAFF:
        employee = getattr(user, "employee_profile", None)
        if employee is None:
            return queryset.none()
        if queryset.model.__name__ == "EmployeeProfile":
            return queryset.filter(pk=employee.pk)
        return queryset.filter(**{staff_field: employee})
    if user.role == Roles.RECEPTIONIST:
        return queryset
    return queryset.none()

