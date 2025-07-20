from django.urls import path
from .views import ForecastView,LocationTestView,WeatherFromSavedLocationView,SavedLocationListCreateView

urlpatterns = [
    path('forecast/', ForecastView.as_view(), name='weather-forecast'),
    path('test-location/', LocationTestView.as_view(), name='test-location'),   ##test test only...
    path('saved-locations/', SavedLocationListCreateView.as_view(), name='saved-locations'),
    path('weather/saved/', WeatherFromSavedLocationView.as_view(), name='weather-from-saved'),
]
