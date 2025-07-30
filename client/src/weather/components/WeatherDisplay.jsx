"use client"

import { useState } from "react"

const EnhancedWeatherDisplay = ({ data, loading, onSaveLocation, showSaveOption, onResetToUserLocation }) => {
  const [showSaveForm, setShowSaveForm] = useState(false)
  const [saveFormData, setSaveFormData] = useState({
    name: "",
    province: "",
    district: "",
    municipality: "",
    ward_number: "",
  })

  const getWeatherIcon = (weatherCode) => {
    const weatherIcons = {
      0: "☀️",
      1: "🌤️",
      2: "⛅",
      3: "☁️",
      45: "🌫️",
      48: "🌫️",
      51: "🌦️",
      53: "🌦️",
      55: "🌧️",
      61: "🌧️",
      63: "🌧️",
      65: "⛈️",
      71: "🌨️",
      73: "❄️",
      75: "❄️",
      77: "🌨️",
      80: "🌦️",
      81: "⛈️",
      82: "⛈️",
      85: "🌨️",
      86: "❄️",
      95: "⛈️",
      96: "⛈️",
      99: "⛈️",
    }
    return weatherIcons[weatherCode] || "🌤️"
  }

  const getWeatherDescription = (weatherCode) => {
    const descriptions = {
      0: "Clear sky",
      1: "Mainly clear",
      2: "Partly cloudy",
      3: "Overcast",
      45: "Fog",
      48: "Depositing rime fog",
      51: "Light drizzle",
      53: "Moderate drizzle",
      55: "Dense drizzle",
      61: "Slight rain",
      63: "Moderate rain",
      65: "Heavy rain",
      71: "Slight snow fall",
      73: "Moderate snow fall",
      75: "Heavy snow fall",
      77: "Snow grains",
      80: "Slight rain showers",
      81: "Moderate rain showers",
      82: "Violent rain showers",
      85: "Slight snow showers",
      86: "Heavy snow showers",
      95: "Thunderstorm",
      96: "Thunderstorm with slight hail",
      99: "Thunderstorm with heavy hail",
    }
    return descriptions[weatherCode] || "Unknown"
  }

  const getFarmingAdvice = (weatherCode, temp, rain) => {
    if (weatherCode >= 61 && weatherCode <= 65) {
      return "🌧️ Excellent for rice cultivation! Avoid harvesting dry crops. Perfect time for indoor farm maintenance and planning."
    } else if (weatherCode >= 95) {
      return "⛈️ Storm warning! Secure all farm equipment, check livestock shelter, and inspect drainage systems after the storm passes."
    } else if (temp > 30) {
      return "🌡️ Hot weather alert! Increase irrigation frequency, provide shade for livestock, and schedule work for early morning or evening."
    } else if (temp < 10) {
      return "❄️ Cold weather protection needed! Cover sensitive crops, reduce watering, and check greenhouse heating systems."
    } else if (weatherCode === 0 || weatherCode === 1) {
      return "☀️ Perfect farming conditions! Ideal for harvesting, field preparation, planting, and all outdoor agricultural activities."
    } else {
      return "🌤️ Good farming weather! Suitable for most agricultural activities. Keep monitoring weather changes for planning."
    }
  }

  const handleSaveFormSubmit = (e) => {
    e.preventDefault()
    if (saveFormData.name.trim()) {
      onSaveLocation(saveFormData)
      setShowSaveForm(false)
      setSaveFormData({ name: "", province: "", district: "", municipality: "", ward_number: "" })
    }
  }

  const todayWeather = data.forecast?.daily
  const today = todayWeather ? 0 : null

  return (
    <div className="space-y-6">
      {/* Current Location Info */}
      <div className="bg-white rounded-2xl shadow-xl border border-green-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">📍</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Current Location</h2>
                <p className="text-blue-100 text-lg">{data.location}</p>
                {data.user_address && <p className="text-blue-200 text-sm">Profile: {data.user_address}</p>}
              </div>
            </div>
            <div className="text-right">
              <p className="text-blue-100 text-sm">
                {data.latitude?.toFixed(4)}, {data.longitude?.toFixed(4)}
              </p>
              <p className="text-blue-200 text-xs">
                Source: {data.source === "user_profile" ? "Your Profile" : "Map Selection"}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-wrap gap-3">
            {showSaveOption && (
              <button
                onClick={() => setShowSaveForm(true)}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <span className="text-lg">💾</span>
                <span>Save Location</span>
              </button>
            )}
            {onResetToUserLocation && (
              <button
                onClick={onResetToUserLocation}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <span className="text-lg">🏠</span>
                <span>Back to My Location</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Today's Weather */}
      {todayWeather && (
        <div className="bg-white rounded-2xl shadow-xl border border-green-100 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-5">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">🌤️</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Today's Weather</h3>
                <p className="text-green-100">Current conditions and forecast</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Weather Icon & Description */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 text-center border border-blue-200">
                <div className="text-6xl mb-4">{getWeatherIcon(todayWeather.weather_code[today])}</div>
                <h4 className="text-lg font-bold text-blue-800 mb-2">
                  {getWeatherDescription(todayWeather.weather_code[today])}
                </h4>
                <p className="text-blue-600 text-sm">Current Conditions</p>
              </div>

              {/* Temperature */}
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-200">
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-2xl">🌡️</span>
                  <h4 className="text-lg font-bold text-orange-800">Temperature</h4>
                </div>
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-red-600">{todayWeather.temperature_2m_max[today]}°C</p>
                  <p className="text-lg font-semibold text-blue-600">{todayWeather.temperature_2m_min[today]}°C</p>
                  <p className="text-sm text-gray-600">High / Low</p>
                </div>
              </div>

              {/* Precipitation */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200">
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-2xl">🌧️</span>
                  <h4 className="text-lg font-bold text-blue-800">Precipitation</h4>
                </div>
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-blue-600">{todayWeather.rain_sum[today]} mm</p>
                  <p className="text-sm text-gray-600">
                    {todayWeather.rain_sum[today] > 0 ? "Rain expected" : "No rain expected"}
                  </p>
                </div>
              </div>

              {/* Wind Speed */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-2xl">💨</span>
                  <h4 className="text-lg font-bold text-green-800">Wind Speed</h4>
                </div>
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-green-600">{todayWeather.wind_speed_10m_max[today]} km/h</p>
                  <p className="text-sm text-gray-600">Max wind speed</p>
                </div>
              </div>
            </div>

            {/* Farming Advice */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xl">🌾</span>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-green-800 mb-3">Smart Farming Advice</h4>
                  <p className="text-green-700 leading-relaxed text-lg">
                    {getFarmingAdvice(
                      todayWeather.weather_code[today],
                      todayWeather.temperature_2m_max[today],
                      todayWeather.rain_sum[today],
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7-Day Forecast */}
      {todayWeather && (
        <div className="bg-white rounded-2xl shadow-xl border border-green-100 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-5">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">📅</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">7-Day Forecast</h3>
                <p className="text-purple-100">Plan your farming activities ahead</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
              {todayWeather.time.map((date, index) => (
                <div
                  key={index}
                  className={`rounded-2xl p-4 text-center transition-all duration-300 hover:transform hover:scale-105 ${
                    index === 0
                      ? "bg-gradient-to-br from-green-100 to-green-200 border-2 border-green-400 shadow-lg"
                      : "bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 hover:shadow-md"
                  }`}
                >
                  <p className={`text-sm font-bold mb-2 ${index === 0 ? "text-green-800" : "text-gray-600"}`}>
                    {index === 0 ? "Today" : new Date(date).toLocaleDateString("en-US", { weekday: "short" })}
                  </p>
                  <div className="text-4xl mb-3">{getWeatherIcon(todayWeather.weather_code[index])}</div>
                  <p className="text-xs text-gray-600 mb-2 leading-tight">
                    {getWeatherDescription(todayWeather.weather_code[index])}
                  </p>
                  <div className="space-y-1">
                    <p className="text-lg font-bold text-red-600">{todayWeather.temperature_2m_max[index]}°</p>
                    <p className="text-sm text-blue-600">{todayWeather.temperature_2m_min[index]}°</p>
                    {todayWeather.rain_sum[index] > 0 && (
                      <p className="text-xs text-blue-500 flex items-center justify-center space-x-1">
                        <span>🌧️</span>
                        <span>{todayWeather.rain_sum[index]}mm</span>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Save Location Form Modal */}
      {showSaveForm && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-lg">💾</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">Save Location</h3>
                </div>
                <button
                  onClick={() => setShowSaveForm(false)}
                  className="text-white hover:bg-white/20 rounded-full p-2 transition-colors duration-200"
                >
                  <span className="text-xl">×</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveFormSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Location Name *</label>
                <input
                  type="text"
                  value={saveFormData.name}
                  onChange={(e) => setSaveFormData({ ...saveFormData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  placeholder="e.g., My Rice Field, Farm Location"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Province</label>
                  <input
                    type="text"
                    value={saveFormData.province}
                    onChange={(e) => setSaveFormData({ ...saveFormData, province: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    placeholder="e.g., Bagmati"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">District</label>
                  <input
                    type="text"
                    value={saveFormData.district}
                    onChange={(e) => setSaveFormData({ ...saveFormData, district: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    placeholder="e.g., Kathmandu"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Municipality</label>
                  <input
                    type="text"
                    value={saveFormData.municipality}
                    onChange={(e) => setSaveFormData({ ...saveFormData, municipality: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    placeholder="e.g., Kathmandu Metropolitan"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Ward</label>
                  <input
                    type="number"
                    value={saveFormData.ward_number}
                    onChange={(e) => setSaveFormData({ ...saveFormData, ward_number: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    placeholder="1"
                    min="1"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowSaveForm(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-xl font-medium transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-medium transition-all duration-200"
                >
                  Save Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-white/90 flex justify-center items-center z-40">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-xl font-bold text-green-600 mb-2">Loading Weather Data</h3>
            <p className="text-gray-600">Getting the latest forecast...</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default EnhancedWeatherDisplay
