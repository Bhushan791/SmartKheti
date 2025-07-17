from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializers import ForecastRequestSerializer
from .services import fetch_forecast

class ForecastView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ForecastRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        lat = serializer.validated_data['latitude']
        lon = serializer.validated_data['longitude']

        forecast_data = fetch_forecast(lat, lon)
        return Response(forecast_data)
