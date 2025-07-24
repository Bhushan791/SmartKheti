from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import NotAuthenticated, ValidationError
from .models import User,OTPrequest
from .serializers import UserSerializer


import random
from django.contrib.auth import get_user_model



##Register View
class RegisterUserView(generics.CreateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response({'msg': "account created"}, status=status.HTTP_201_CREATED)
        return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        print(serializer.errors) 

#Profile View
class UserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            serializer = UserSerializer(request.user)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {"detail": f"Failed to retrieve profile: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def put(self, request):
        if not request.user.is_authenticated:
            raise NotAuthenticated("You are not authenticated to update the profile.")

        serializer = UserSerializer(
            request.user,
            data=request.data,
            context={'request': request},
            partial=True
        )

        if serializer.is_valid():
            try:
                serializer.save()
                return Response(serializer.data)
            except Exception as e:
                return Response(
                    {"detail": f"Profile update failed: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

        return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        print(serializer.errors) 




#otp request view
class RequestOTPView(APIView):
    def post(self, request):
        phone = request.data.get('phone')
        if not User.objects.filter(phone=phone).exists():
            return Response({'error': 'Phone number is not registered'}, status=400)
        

        otp = str(random.randint(100000,999999))
        OTPrequest.objects.create(phone=phone).delete()
        OTPrequest.objects.create(phone=phone, otp=otp)
        print(f"OTP for {phone} is {otp}")
        return Response({'message': 'OPT sent successfully (check console)'}, status = 200)
    


#otp-verify view
class VeriifyOTPAndChangePasswordView(APIView):
    def post(self, request):
        phone = request.data.get('phone')
        otp = request.data.get('otp')
        new_password = request.data.get('new_password')

        # 1. Check for missing fields
        if not phone:
            return Response({'error': 'Phone number is required'}, status=400)
        if not otp:
            return Response({'error': 'OTP is required'}, status=400)
        if not new_password:
            return Response({'error': 'New password is required'}, status=400)

        # 2. Check if user exists
        try:
            user = User.objects.get(phone=phone)
        except User.DoesNotExist:
            return Response({'error': 'Phone number not found'}, status=404)

        # 3. Check if OTP is valid
        otp_record = OTPrequest.objects.filter(phone=phone, otp=otp).order_by('-created_at').first()
        if not otp_record:
            return Response({'error': 'Incorrect OTP'}, status=400)
        if not otp_record.is_valid():
            return Response({'error': 'OTP has expired'}, status=400)

        # 4. Change the password
        user.set_password(new_password)
        user.save()

        return Response({'message': 'Password changed successfully'}, status=200)
