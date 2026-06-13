from rest_framework import viewsets
from rest_framework.decorators import action

from apps.accounts.scopes import scope_queryset
from apps.core.audit import record_event
from apps.core.responses import success
from apps.feedback.models import Complaint, Feedback
from apps.feedback.serializers import ComplaintSerializer, ComplaintStatusHistorySerializer, FeedbackSerializer
from apps.feedback.services import assign_complaint, close_complaint, escalate_complaint, resolve_complaint


class FeedbackViewSet(viewsets.ModelViewSet):
    serializer_class = FeedbackSerializer

    def get_queryset(self):
        return scope_queryset(self.request.user, Feedback.objects.all())

    def perform_create(self, serializer):
        obj = serializer.save()
        record_event(self.request.user, "feedback.create", obj)

    @action(detail=True, methods=["post"])
    def respond(self, request, pk=None):
        feedback = self.get_object()
        feedback.response = request.data.get("response", "")
        feedback.status = "responded"
        feedback.save()
        record_event(request.user, "feedback.respond", feedback)
        return success(self.get_serializer(feedback).data)

    @action(detail=True, methods=["post"])
    def close(self, request, pk=None):
        feedback = self.get_object()
        feedback.status = "closed"
        feedback.save()
        record_event(request.user, "feedback.close", feedback)
        return success(self.get_serializer(feedback).data)


class ComplaintViewSet(viewsets.ModelViewSet):
    serializer_class = ComplaintSerializer

    def get_queryset(self):
        return scope_queryset(self.request.user, Complaint.objects.all())

    def perform_create(self, serializer):
        complaint = serializer.save()
        record_event(self.request.user, "complaint.create", complaint)

    @action(detail=True, methods=["post"])
    def assign(self, request, pk=None):
        from django.contrib.auth import get_user_model

        user = get_user_model().objects.get(id=request.data["assigned_to"])
        return success(self.get_serializer(assign_complaint(request.user, self.get_object(), user, request.data.get("note", ""))).data)

    @action(detail=True, methods=["post"])
    def escalate(self, request, pk=None):
        from django.contrib.auth import get_user_model

        user = get_user_model().objects.get(id=request.data["manager"])
        return success(self.get_serializer(escalate_complaint(request.user, self.get_object(), user, request.data.get("note", ""))).data)

    @action(detail=True, methods=["post"])
    def resolve(self, request, pk=None):
        complaint = resolve_complaint(request.user, self.get_object(), request.data.get("resolution", ""), request.data.get("customer_visible_result", ""))
        return success(self.get_serializer(complaint).data)

    @action(detail=True, methods=["post"])
    def close(self, request, pk=None):
        return success(self.get_serializer(close_complaint(request.user, self.get_object(), request.data.get("note", ""))).data)

    @action(detail=True, methods=["get"])
    def history(self, request, pk=None):
        return success(ComplaintStatusHistorySerializer(self.get_object().status_history.all(), many=True).data)
