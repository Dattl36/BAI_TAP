from apps.employees.models import StaffAvailability


def availability_for_employee(employee, date=None):
    qs = StaffAvailability.objects.filter(employee=employee)
    return qs.filter(date=date) if date else qs


def deactivate_employee(actor, employee):
    employee.employment_status = "inactive"
    employee.save(update_fields=["employment_status", "updated_at"])
    return employee
