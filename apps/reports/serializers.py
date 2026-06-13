from rest_framework import serializers


class ReportPeriodSerializer(serializers.Serializer):
    from_date = serializers.DateField(required=False)
    to_date = serializers.DateField(required=False)


class SummaryReportSerializer(serializers.Serializer):
    metric = serializers.CharField()
    value = serializers.DecimalField(max_digits=14, decimal_places=2)
