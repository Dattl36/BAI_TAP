from rest_framework import viewsets
from rest_framework.decorators import action

from apps.accounts.roles import Roles
from apps.core.responses import success
from apps.employees.models import EmployeeProfile, StaffAvailability
from apps.employees.serializers import EmployeeProfileSerializer, StaffAvailabilitySerializer
from apps.employees.services import availability_for_employee


class EmployeeViewSet(viewsets.ModelViewSet):
    serializer_class = EmployeeProfileSerializer

    def get_queryset(self):
        if self.action in ["list", "retrieve", "availability"]:
            return EmployeeProfile.objects.all()
            
        role = getattr(self.request.user, "role", None)
        if role in {Roles.MANAGER, Roles.RECEPTIONIST}:
            return EmployeeProfile.objects.all()
        employee = getattr(self.request.user, "employee_profile", None)
        return EmployeeProfile.objects.filter(id=getattr(employee, "id", None))

    @action(detail=True, methods=["get", "post"])
    def availability(self, request, pk=None):
        employee = self.get_object()
        if request.method == "POST":
            role = getattr(self.request.user, "role", None)
            if role not in {Roles.MANAGER, Roles.RECEPTIONIST} and getattr(self.request.user, "employee_profile", None) != employee:
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied("You do not have permission to manage this employee's availability.")
            serializer = StaffAvailabilitySerializer(data={**request.data, "employee": employee.id})
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return success(serializer.data, "Availability created", 201)
        serializer = StaffAvailabilitySerializer(availability_for_employee(employee), many=True)
        return success(serializer.data)


class StaffAvailabilityViewSet(viewsets.ModelViewSet):
    queryset = StaffAvailability.objects.all()
    serializer_class = StaffAvailabilitySerializer
