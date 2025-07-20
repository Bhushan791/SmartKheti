from rest_framework import serializers
from .models import DetectionRecord

class ImageUploadSerializer(serializers.Serializer):
    image = serializers.ImageField()

class DetectionRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetectionRecord
        fields = ['id', 'detected_disease', 'detected_at', 'image']