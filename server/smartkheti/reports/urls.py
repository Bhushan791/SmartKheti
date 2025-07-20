from django.urls import path
from .views import DiseaseTrendReportView

urlpatterns = [
    path('disease-trend/', DiseaseTrendReportView.as_view(), name='disease-trends-report'),
]
