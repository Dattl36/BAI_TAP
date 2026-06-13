from rest_framework import viewsets
from rest_framework.decorators import action

from apps.accounts.scopes import scope_queryset
from apps.appointments.models import Appointment
from apps.core.responses import success
from apps.service_execution.models import ServiceExecution
from apps.service_execution.serializers import ServiceExecutionSerializer, ServiceIncidentalSerializer
from apps.service_execution.services import add_incidental, complete_service, start_service


class ServiceExecutionViewSet(viewsets.ModelViewSet):
    serializer_class = ServiceExecutionSerializer

    def get_queryset(self):
        return scope_queryset(self.request.user, ServiceExecution.objects.all())

    @action(detail=False, methods=["post"], url_path=r"(?P<appointment_id>[^/.]+)/start")
    def start(self, request, appointment_id=None):
        appointment = Appointment.objects.get(id=appointment_id)
        execution = start_service(request.user, appointment)
        return success(self.get_serializer(execution).data)

    @action(detail=True, methods=["post"])
    def incidentals(self, request, pk=None):
        serializer = ServiceIncidentalSerializer(data={**request.data, "execution": self.get_object().id})
        serializer.is_valid(raise_exception=True)
        incidental = add_incidental(request.user, self.get_object(), **serializer.validated_data)
        return success(ServiceIncidentalSerializer(incidental).data, "Incidental added", 201)

    @action(detail=True, methods=["post"])
    def complete(self, request, pk=None):
        execution = complete_service(request.user, self.get_object(), request.data.get("result_notes", ""))
        return success(self.get_serializer(execution).data)
