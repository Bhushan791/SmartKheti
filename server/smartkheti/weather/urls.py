from django.urls import path
from .views import ForecastView,LocationTestView

urlpatterns = [
    path('forecast/', ForecastView.as_view(), name='weather-forecast'),
    path('test-location/', LocationTestView.as_view(), name='test-location'),
]
