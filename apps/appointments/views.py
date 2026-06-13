from apps.accounts.scopes import scope_queryset
from apps.appointments.models import Appointment
from apps.appointments.serializers import AppointmentSerializer, AppointmentTransitionSerializer
from apps.appointments.services import create_appointment, reschedule_appointment, transition_appointment
from apps.core.responses import success
from apps.employees.models import EmployeeProfile
from rest_framework import viewsets
from rest_framework.decorators import action


class AppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer

    def get_queryset(self):
        return scope_queryset(self.request.user, Appointment.objects.all())

    def perform_create(self, serializer):
        self.instance = create_appointment(self.request.user, **serializer.validated_data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        appointment = create_appointment(request.user, **serializer.validated_data)
        return success(self.get_serializer(appointment).data, "Appointment created", 201)

    @action(detail=True, methods=["post"])
    def confirm(self, request, pk=None):
        return success(self.get_serializer(transition_appointment(request.user, self.get_object(), "confirmed")).data)

    @action(detail=True, methods=["post"])
    def arrive(self, request, pk=None):
        return success(self.get_serializer(transition_appointment(request.user, self.get_object(), "arrived")).data)

    @action(detail=True, methods=["post"], url_path="no-show")
    def no_show(self, request, pk=None):
        reason = request.data.get("reason", "")
        return success(self.get_serializer(transition_appointment(request.user, self.get_object(), "no_show", reason)).data)

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        return success(self.get_serializer(transition_appointment(request.user, self.get_object(), "cancelled", request.data.get("reason", ""))).data)

    @action(detail=True, methods=["post"])
    def reschedule(self, request, pk=None):
        serializer = AppointmentTransitionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        staff = EmployeeProfile.objects.get(id=data["staff"]) if data.get("staff") else None
        appointment = reschedule_appointment(request.user, self.get_object(), data["scheduled_start"], data["scheduled_end"], staff)
        return success(self.get_serializer(appointment).data)

    @action(detail=False, methods=["get"])
    def availability(self, request):
        return success({"message": "Use employee availability and appointment conflict endpoints to inspect slots."})
