from rest_framework import serializers
from datetime import date, timedelta

class DiseaseReportRequestSerializer(serializers.Serializer):
    start_date = serializers.DateField()
    end_date = serializers.DateField()

    def validate(self, data):
        start = data['start_date']
        end = data['end_date']
        today = date.today()
        two_months_ago = today - timedelta(days=60)

        if start < two_months_ago:
            raise serializers.ValidationError("Start date cannot be older than 2 months ago.")
        if end > today:
            raise serializers.ValidationError("End date cannot be in the future.")
        if start > end:
            raise serializers.ValidationError("Start date must be before or equal to end date.")
        return data
