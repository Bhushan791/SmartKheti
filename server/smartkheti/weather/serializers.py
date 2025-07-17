from rest_framework import serializers

class ForecastRequestSerializer(serializers.Serializer):
    latitude = serializers.FloatField()
    longitude = serializers.FloatField()


