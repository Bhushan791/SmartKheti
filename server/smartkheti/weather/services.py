import requests
import logging
import time

logger = logging.getLogger(__name__)

def get_coordinates_from_address(province, district, municipality, ward_number):
    """
    Get latitude and longitude from address components using multiple strategies.
    Falls back to default coordinates (Kathmandu) on failure.
    """
    # Strategy 1: Try with ward number
    address_with_ward = f"Ward {ward_number}, {municipality}, {district}, {province} Province, Nepal"
    lat, lon = _try_geocode(address_with_ward)
    if lat and lon:
        return lat, lon
    
    # Strategy 2: Try without ward number but with municipality
    address_without_ward = f"{municipality}, {district}, {province} Province, Nepal"
    lat, lon = _try_geocode(address_without_ward)
    if lat and lon:
        return lat, lon
    
    # Strategy 3: Try with just district and province
    address_district = f"{district}, {province} Province, Nepal"
    lat, lon = _try_geocode(address_district)
    if lat and lon:
        return lat, lon
    
    # Strategy 4: Try with just province
    address_province = f"{province} Province, Nepal"
    lat, lon = _try_geocode(address_province)
    if lat and lon:
        return lat, lon
    
    logger.warning(f"Could not geocode any address variation for {district}, {province}")
    # Fallback default: Kathmandu
    return 27.7172, 85.3240


def _try_geocode(address):
    """
    Helper function to try geocoding a single address string.
    """
    # Clean and format the address
    cleaned_address = _clean_address(address)
    
    logger.info(f"Trying to geocode: {cleaned_address}")

    url = "https://nominatim.openstreetmap.org/search"
    params = {
        'q': cleaned_address,
        'format': 'json',
        'limit': 3,  # Get more results to pick the best one
        'countrycodes': 'np',  # Restrict to Nepal
        'addressdetails': 1,
    }
    
    headers = {
        "User-Agent": "SmartKhetiApp/1.0 (weather-service)"
    }
    
    try:
        # Add a small delay to respect rate limits
        time.sleep(0.1)
        
        response = requests.get(url, params=params, timeout=10, headers=headers)
        response.raise_for_status()
        data = response.json()
        
        if data:
            # Pick the best result (highest importance score if available)
            best_result = data[0]
            for result in data:
                if result.get('importance', 0) > best_result.get('importance', 0):
                    best_result = result
            
            lat = float(best_result['lat'])
            lon = float(best_result['lon'])
            
            logger.info(f"Successfully geocoded '{cleaned_address}' to {lat}, {lon}")
            return lat, lon
        else:
            logger.warning(f"No results found for address: {cleaned_address}")
            return None, None
            
    except requests.exceptions.RequestException as e:
        logger.error(f"Request error while geocoding {cleaned_address}: {e}")
        return None, None
    except (ValueError, KeyError) as e:
        logger.error(f"Data parsing error while geocoding {cleaned_address}: {e}")
        return None, None
    except Exception as e:
        logger.error(f"Unexpected error while geocoding {cleaned_address}: {e}")
        return None, None


def _clean_address(address):
    """
    Clean and standardize address format for better geocoding results.
    """
    # Standardize common terms
    replacements = {
        "sub-metropolitan": "Sub-Metropolitan City",
        "sub metropolitan": "Sub-Metropolitan City", 
        "metropolitan": "Metropolitan City",
        "municipality": "Municipality",
        "gaupalika": "Rural Municipality",
        "gaunpalika": "Rural Municipality",
        "sudurpaschim": "Sudurpashchim",
        "gandaki": "Gandaki",
        "bagmati": "Bagmati",
        "madhesh": "Madhesh",
        "lumbini": "Lumbini",
        "karnali": "Karnali",
        "province": "Province"
    }
    
    cleaned = address.strip()
    for old, new in replacements.items():
        cleaned = cleaned.replace(old.lower(), new)
        cleaned = cleaned.replace(old.title(), new)
        cleaned = cleaned.replace(old.upper(), new)
    
    return cleaned


def reverse_geocode_improved(lat, lon):
    """
    Improved reverse geocoding with better error handling and formatting.
    """
    url = 'https://nominatim.openstreetmap.org/reverse'
    params = {
        'lat': lat,
        'lon': lon,
        'format': 'json',
        'addressdetails': 1,
        'accept-language': 'en',
    }
    
    headers = {
        "User-Agent": "SmartKhetiApp/1.0 (weather-service)"
    }
    
    try:
        time.sleep(0.1)  # Rate limiting
        response = requests.get(url, params=params, timeout=10, headers=headers)
        response.raise_for_status()
        data = response.json()
        
        if 'address' in data:
            address = data['address']
            # Build a nice address string from components
            parts = []
            
            if address.get('village') or address.get('town') or address.get('city'):
                parts.append(address.get('village') or address.get('town') or address.get('city'))
            
            if address.get('county') or address.get('state_district'):
                parts.append(address.get('county') or address.get('state_district'))
                
            if address.get('state'):
                parts.append(address.get('state'))
                
            if address.get('country'):
                parts.append(address.get('country'))
            
            if parts:
                return ', '.join(parts)
        
        # Fallback to display_name
        return data.get('display_name', f'Location at {lat:.4f}, {lon:.4f}')
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Request error in reverse geocoding: {e}")
        return f'Location at {lat:.4f}, {lon:.4f}'
    except Exception as e:
        logger.error(f"Error in reverse geocoding: {e}")
        return f'Location at {lat:.4f}, {lon:.4f}'


def fetch_forecast(lat, lon):
    """
    Fetch weather forecast from Open-Meteo based on given latitude and longitude.
    """
    url = (
        f"https://api.open-meteo.com/v1/forecast?"
        f"latitude={lat}&longitude={lon}&"
        f"daily=rain_sum,wind_speed_10m_max,temperature_2m_max,temperature_2m_min,weather_code&"
        f"timezone=auto&"
        f"forecast_days=7"
    )
    
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        
        if response.status_code == 200:
            data = response.json()
            logger.info(f"Successfully fetched forecast for lat={lat}, lon={lon}")
            return data
        else:
            logger.warning(f"Weather API returned {response.status_code} for lat={lat}, lon={lon}")
            
    except requests.exceptions.RequestException as e:
        logger.error(f"Request error fetching forecast for lat={lat}, lon={lon}: {e}")
    except Exception as e:
        logger.error(f"Unexpected error fetching forecast for lat={lat}, lon={lon}: {e}")

    return {"error": "Could not fetch forecast"}