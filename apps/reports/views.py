from rest_framework.decorators import action
from rest_framework.viewsets import ViewSet

from apps.accounts.permissions import IsManager
from apps.core.audit import record_event
from apps.core.responses import success
from apps.reports.services import appointment_summary, revenue_summary, staff_performance


class ReportViewSet(ViewSet):
    permission_classes = [IsManager]

    def _period(self, request):
        return request.query_params.get("from"), request.query_params.get("to")

    @action(detail=False, methods=["get"])
    def revenue(self, request):
        start, end = self._period(request)
        record_event(request.user, "report.revenue", metadata={"entity_type": "Report"})
        return success(revenue_summary(start, end))

    @action(detail=False, methods=["get"])
    def appointments(self, request):
        start, end = self._period(request)
        record_event(request.user, "report.appointments", metadata={"entity_type": "Report"})
        return success(appointment_summary(start, end))

    @action(detail=False, methods=["get"])
    def services(self, request):
        return success({"popular_services": []})

    @action(detail=False, methods=["get"])
    def customers(self, request):
        return success({"active_customers": 0})

    @action(detail=False, methods=["get"], url_path="staff-performance")
    def staff_performance(self, request):
        start, end = self._period(request)
        record_event(request.user, "report.staff_performance", metadata={"entity_type": "Report"})
        return success(staff_performance(start, end))
