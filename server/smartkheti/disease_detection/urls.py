from django.urls import path
from .views import DiseaseDetectionAPIView, AdminDetectionListAPIView,DetectionHistoryAPIView

urlpatterns = [
    path('detect/', DiseaseDetectionAPIView.as_view(), name='disease-detect'),

    path('detection-history/', DetectionHistoryAPIView.as_view(), name='detection-history'),

    path('admin/detections/', AdminDetectionListAPIView.as_view(), name='admin-detections'),

]
