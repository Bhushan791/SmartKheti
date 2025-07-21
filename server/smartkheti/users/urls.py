from django.urls import path
from .views import RegisterUserView, UserProfileView,RequestOTPView,VeriifyOTPAndChangePasswordView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('register/', RegisterUserView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', UserProfileView.as_view(), name='profile'),

    path('request-otp/',RequestOTPView.as_view(), name='request_otp'),

    path('verify-otp/', VeriifyOTPAndChangePasswordView.as_view(), name='verify_otp')
    
]
