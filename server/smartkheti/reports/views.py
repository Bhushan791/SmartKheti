from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from datetime import datetime
import logging

from disease_detection.models import DetectionRecord
from .serializers import DiseaseReportRequestSerializer

logger = logging.getLogger(__name__)

class DiseaseTrendReportView(APIView):
    authentication_classes = []
    permission_classes = []
    
    def get(self, request):
        try:
            start_date_str = request.query_params.get('start_date')
            end_date_str = request.query_params.get('end_date')
            
            queryset = DetectionRecord.objects.select_related('user').all()
            
            # Filter by date if both parameters provided
            if start_date_str and end_date_str:
                serializer = DiseaseReportRequestSerializer(data={
                    'start_date': start_date_str,
                    'end_date': end_date_str
                })
                
                if not serializer.is_valid():
                    return Response(
                        {"error": "Invalid date parameters", "details": serializer.errors},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                start_date = serializer.validated_data['start_date']
                end_date = serializer.validated_data['end_date']
                
                # Create timezone-aware datetime objects
                start_datetime = timezone.make_aware(datetime.combine(start_date, datetime.min.time()))
                end_datetime = timezone.make_aware(datetime.combine(end_date, datetime.max.time()))
                
                queryset = queryset.filter(
                    detected_at__gte=start_datetime,
                    detected_at__lte=end_datetime
                )
                
            elif start_date_str or end_date_str:
                return Response(
                    {"error": "Both start_date and end_date are required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            queryset = queryset.order_by('-detected_at')
            
            # Build response data
            report_data = []
            for detection in queryset:
                location = detection.user.district if (detection.user and detection.user.district) else "Unknown"
                
                report_data.append({
                    "disease_name": detection.detected_disease,
                    "detected_at": detection.detected_at.strftime('%Y-%m-%d %H:%M:%S') if detection.detected_at else None,
                    "location": location
                })
            
            return Response(report_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error in DiseaseTrendReportView: {str(e)}")
            return Response(
                {"error": "An unexpected error occurred"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )