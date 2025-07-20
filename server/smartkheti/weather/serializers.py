from rest_framework import serializers
from .models import SavedLocation


class ForecastRequestSerializer(serializers.Serializer):
    latitude = serializers.FloatField()
    longitude = serializers.FloatField()


class SavedLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavedLocation
        fields = '__all__'
        read_only_fields = ['user']