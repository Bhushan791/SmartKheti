import requests

def fetch_forecast(lat, lon):
    url = (
        f"https://api.open-meteo.com/v1/forecast"
        f"?latitude={lat}&longitude={lon}"
        f"&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,"
        f"windspeed_10m_max,relative_humidity_2m_max,weathercode,cloudcover_mean"
        f"&timezone=Asia/Kathmandu&forecast_days=16"
    )

    response = requests.get(url)
    response.raise_for_status()
    return response.json()
