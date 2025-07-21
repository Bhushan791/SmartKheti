from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),  
    path('api/disease_detection/', include('disease_detection.urls')),
    path('api/weather/', include('weather.urls')),
    path('api/marketplace/', include('marketplace.urls')),
    path('api/reports/', include('reports.urls')),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)