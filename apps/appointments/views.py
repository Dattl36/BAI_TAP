from datetime import timedelta

from django.conf import settings
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import MethodNotAllowed, ValidationError
from rest_framework.filters import OrderingFilter
from rest_framework.permissions import AllowAny

from apps.accounts.scopes import scope_queryset
from apps.appointments.models import Appointment
from apps.appointments.serializers import (
    AppointmentSerializer,
    AppointmentTransitionSerializer,
    AvailabilityQuerySerializer,
    BusyStaffQuerySerializer,
)
from apps.appointments.services import create_appointment, get_available_slots, get_busy_staff_ids, reschedule_appointment, transition_appointment
from apps.core.responses import success
from apps.employees.models import EmployeeProfile


class AppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ["status", "staff", "customer", "source"]
    ordering_fields = ["scheduled_start", "created_at"]
    throttle_scope = None

    def get_queryset(self):
        return scope_queryset(self.request.user, Appointment.objects.all()).select_related("customer", "staff").prefetch_related("appointment_services__service")

    def get_throttles(self):
        if self.action in {"busy_staff", "availability"}:
            self.throttle_scope = "appointment_public_lookup"
        else:
            self.throttle_scope = None
        return super().get_throttles()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        appointment = create_appointment(request.user, **serializer.validated_data)
        return success(self.get_serializer(appointment).data, "Da tao lich hen", 201)

    def update(self, request, *args, **kwargs):
        raise MethodNotAllowed("PUT", detail="Vui long su dung endpoint /reschedule/ de cap nhat lich hen.")

    def partial_update(self, request, *args, **kwargs):
        data = request.data
        if "status" in data and len(data) == 1:
            appointment = transition_appointment(request.user, self.get_object(), data["status"])
            return success(self.get_serializer(appointment).data)

        raise MethodNotAllowed("PATCH", detail="Vui long su dung cac endpoint cu the (/reschedule/, /cancel/...) de cap nhat lich hen.")

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
        serializer = AvailabilityQuerySerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        max_range = timedelta(days=settings.APPOINTMENT_LOOKUP_MAX_RANGE_DAYS)
        if data["end"] - data["start"] > max_range:
            raise ValidationError("Khoang thoi gian tra cuu qua lon.")

        slots = get_available_slots(
            start=data["start"],
            end=data["end"],
            staff_id=data.get("staff"),
            service_id=data.get("service"),
            duration_minutes=data.get("duration_minutes"),
        )
        return success({"message": "Danh sach khung gio kha dung.", "slots": slots})

    @action(detail=False, methods=["get"], permission_classes=[AllowAny])
    def busy_staff(self, request):
        serializer = BusyStaffQuerySerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        max_range = timedelta(days=settings.APPOINTMENT_LOOKUP_MAX_RANGE_DAYS)
        if data["end"] - data["start"] > max_range:
            raise ValidationError("Khoang thoi gian tra cuu qua lon.")

        return success({"busy_staff_ids": get_busy_staff_ids(data["start"], data["end"])})
