from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),  
    path('api/disease_detection/', include('disease_detection.urls')),
    path('api/weather/', include('weather.urls')),
    path('api/marketplace/', include('marketplace.urls')),
]
