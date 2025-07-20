from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .services import fetch_forecast, get_coordinates_from_address, reverse_geocode_improved
import logging

logger = logging.getLogger(__name__)


class ForecastView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            lat = request.query_params.get('lat')
            lon = request.query_params.get('lon')

            # If lat/lon are passed (map-based search)
            if lat and lon:
                try:
                    lat_float = float(lat)
                    lon_float = float(lon)
                    
                    # Validate coordinates are reasonable for Nepal
                    if not (26.0 <= lat_float <= 31.0 and 80.0 <= lon_float <= 89.0):
                        return Response({
                            "error": "Coordinates outside Nepal bounds"
                        }, status=status.HTTP_400_BAD_REQUEST)
                    
                    forecast = fetch_forecast(lat_float, lon_float)
                    location = reverse_geocode_improved(lat_float, lon_float)
                    
                    logger.info(f"Map-based forecast requested for {lat_float}, {lon_float}")
                    
                    return Response({
                        "location": location,
                        "latitude": lat_float,
                        "longitude": lon_float,
                        "forecast": forecast,
                        "source": "coordinates"
                    })
                    
                except ValueError:
                    return Response({
                        "error": "Invalid latitude or longitude format"
                    }, status=status.HTTP_400_BAD_REQUEST)

            # Use user profile location
            user = request.user
            
            # Check if user has required address fields
            required_fields = ['province', 'district', 'municipality']
            missing_fields = [field for field in required_fields if not getattr(user, field, None)]
            
            if missing_fields:
                return Response({
                    "error": f"Missing address information: {', '.join(missing_fields)}",
                    "required_fields": required_fields,
                    "current_values": {
                        "province": getattr(user, 'province', None),
                        "district": getattr(user, 'district', None),
                        "municipality": getattr(user, 'municipality', None),
                        "ward_number": getattr(user, 'ward_number', None),
                    }
                }, status=status.HTTP_400_BAD_REQUEST)

            # Get coordinates from user address
            logger.info(f"Fetching forecast for user {user.id} at {user.district}, {user.province}")
            
            lat, lon = get_coordinates_from_address(
                province=user.province,
                district=user.district,
                municipality=user.municipality,
                ward_number=getattr(user, 'ward_number', None)
            )
            
            # Fetch forecast and location info
            forecast = fetch_forecast(lat, lon)
            location = reverse_geocode_improved(lat, lon)
            
            # Build user address string for reference
            user_address_parts = []
            if hasattr(user, 'ward_number') and user.ward_number:
                user_address_parts.append(f"Ward {user.ward_number}")
            user_address_parts.extend([user.municipality, user.district, user.province])
            user_address = ", ".join(user_address_parts)

            return Response({
                "location": location,
                "user_address": user_address,
                "latitude": lat,
                "longitude": lon,
                "forecast": forecast,
                "source": "user_profile"
            })
            
        except Exception as e:
            logger.error(f"Unexpected error in ForecastView: {e}")
            return Response({
                "error": "Internal server error occurred while fetching forecast"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class LocationTestView(APIView):
    """
    Test endpoint to debug geocoding issues
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        if not all([user.province, user.district, user.municipality]):
            return Response({
                "error": "Missing required address fields",
                "user_data": {
                    "province": getattr(user, 'province', None),
                    "district": getattr(user, 'district', None),
                    "municipality": getattr(user, 'municipality', None),
                    "ward_number": getattr(user, 'ward_number', None),
                }
            })
        
        # Test different address formats
        test_results = {}
        
        # Test with ward
        if hasattr(user, 'ward_number') and user.ward_number:
            address_with_ward = f"Ward {user.ward_number}, {user.municipality}, {user.district}, {user.province} Province, Nepal"
            lat1, lon1 = get_coordinates_from_address(user.province, user.district, user.municipality, user.ward_number)
            test_results["with_ward"] = {
                "address": address_with_ward,
                "coordinates": [lat1, lon1],
                "reverse_geocoded": reverse_geocode_improved(lat1, lon1)
            }
        
        # Test without ward
        address_without_ward = f"{user.municipality}, {user.district}, {user.province} Province, Nepal"
        lat2, lon2 = get_coordinates_from_address(user.province, user.district, user.municipality, None)
        test_results["without_ward"] = {
            "address": address_without_ward,
            "coordinates": [lat2, lon2],
            "reverse_geocoded": reverse_geocode_improved(lat2, lon2)
        }
        
        return Response({
            "user_profile": {
                "province": user.province,
                "district": user.district,
                "municipality": user.municipality,
                "ward_number": getattr(user, 'ward_number', None),
            },
            "geocoding_tests": test_results
        })