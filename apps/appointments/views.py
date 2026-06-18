from apps.accounts.scopes import scope_queryset
from apps.appointments.models import Appointment
from apps.appointments.serializers import AppointmentSerializer, AppointmentTransitionSerializer
from apps.appointments.services import create_appointment, reschedule_appointment, transition_appointment
from apps.core.responses import success
from apps.employees.models import EmployeeProfile
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter


class AppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ["status", "staff", "customer", "source"]
    ordering_fields = ["scheduled_start", "created_at"]

    def get_queryset(self):
        return scope_queryset(self.request.user, Appointment.objects.all())

    def perform_create(self, serializer):
        self.instance = create_appointment(self.request.user, **serializer.validated_data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        appointment = create_appointment(request.user, **serializer.validated_data)
        return success(self.get_serializer(appointment).data, "Appointment created", 201)

    def update(self, request, *args, **kwargs):
        from rest_framework.exceptions import MethodNotAllowed
        raise MethodNotAllowed("PUT", detail="Vui lòng sử dụng endpoint /reschedule/ để cập nhật lịch hẹn.")

    def partial_update(self, request, *args, **kwargs):
        data = request.data
        if "status" in data and len(data) == 1:
            from apps.appointments.services import transition_appointment
            appointment = transition_appointment(request.user, self.get_object(), data["status"])
            return success(self.get_serializer(appointment).data)
        
        from rest_framework.exceptions import MethodNotAllowed
        raise MethodNotAllowed("PATCH", detail="Vui lòng sử dụng các endpoint cụ thể (/reschedule/, /cancel/...) để cập nhật lịch hẹn.")

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

    from rest_framework.permissions import AllowAny
    @action(detail=False, methods=["get"], permission_classes=[AllowAny])
    def busy_staff(self, request):
        start = request.query_params.get("start")
        end = request.query_params.get("end")
        if not start or not end:
            return success({"busy_staff_ids": []})
            
        from apps.appointments.models import Appointment
        ACTIVE_STATUSES = ["requested", "confirmed", "arrived", "in_service"]
        qs = Appointment.objects.filter(
            status__in=ACTIVE_STATUSES,
            scheduled_start__lt=end,
            scheduled_end__gt=start,
        ).values_list("staff_id", flat=True)
        
        return success({"busy_staff_ids": list(set(qs))})
