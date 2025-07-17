from django.urls import path
from .views import CropListingView, MyListingsView

urlpatterns = [
    path('list/', CropListingView.as_view(), name='listings-create-list'),
    path('listings/my/', MyListingsView.as_view(), name='my-listings'),       
    path('listings/<int:pk>/', CropListingView.as_view(), name='listings-detail-update-delete'),  
]
