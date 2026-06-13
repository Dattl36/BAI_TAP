class Roles:
    CUSTOMER = "customer"
    RECEPTIONIST = "receptionist"
    STAFF = "staff"
    MANAGER = "manager"

    CHOICES = (
        (CUSTOMER, "Customer"),
        (RECEPTIONIST, "Receptionist"),
        (STAFF, "Staff"),
        (MANAGER, "Manager"),
    )


def has_role(user, *roles):
    return bool(getattr(user, "is_authenticated", False) and getattr(user, "role", None) in roles)


def is_customer(user):
    return has_role(user, Roles.CUSTOMER)


def is_receptionist(user):
    return has_role(user, Roles.RECEPTIONIST)


def is_staff_member(user):
    return has_role(user, Roles.STAFF)


def is_manager(user):
    return has_role(user, Roles.MANAGER)
