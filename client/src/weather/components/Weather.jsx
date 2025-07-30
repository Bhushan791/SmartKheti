"use client"

import { useState, useEffect } from "react"
import { weatherAPI } from "../api"
import WeatherDisplay from "./WeatherDisplay"
import SavedLocations from "./SavedLocations"
import MapSearch from "./MapSearch"

const Weather = () => {
  const [activeTab, setActiveTab] = useState("current") // "current", "saved", "map"
  const [weatherData, setWeatherData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")
  const [userLocation, setUserLocation] = useState(null)
  const [savedLocations, setSavedLocations] = useState([])

  useEffect(() => {
    initializeWeather()
    fetchSavedLocations()
  }, [])

  const initializeWeather = async () => {
    try {
      setLoading(true)
      const response = await weatherAPI.getForecast()
      setWeatherData(response.data)
      setUserLocation(response.data)
      setMessage("")
    } catch (error) {
      console.error("Failed to fetch weather:", error)
      if (error.message.includes("Missing address information")) {
        setMessage(
          "Please complete your profile address information to get personalized weather forecasts for your location.",
        )
      } else {
        setMessage(`Failed to load weather data: ${error.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchSavedLocations = async () => {
    try {
      const response = await weatherAPI.getSavedLocations()
      setSavedLocations(response.data || [])
    } catch (error) {
      console.error("Failed to fetch saved locations:", error)
    }
  }

  const handleLocationSelect = async (lat, lon, source = "map") => {
    try {
      setLoading(true)
      const response = await weatherAPI.getForecast(lat, lon)
      setWeatherData(response.data)
      setMessage(`Weather loaded for ${response.data.location}`)
      setTimeout(() => setMessage(""), 3000)
    } catch (error) {
      console.error("Failed to fetch weather for location:", error)
      setMessage(`Failed to load weather: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSavedLocationSelect = async (locationId) => {
    try {
      setLoading(true)
      const response = await weatherAPI.getWeatherFromSavedLocation(locationId)
      setWeatherData(response.data)
      setMessage(`Weather loaded for saved location`)
      setTimeout(() => setMessage(""), 3000)
    } catch (error) {
      console.error("Failed to fetch weather for saved location:", error)
      setMessage(`Failed to load weather: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveLocation = async (locationData) => {
    try {
      await weatherAPI.createSavedLocation(locationData)
      await fetchSavedLocations()
      setMessage("Location saved successfully!")
      setTimeout(() => setMessage(""), 3000)
    } catch (error) {
      console.error("Failed to save location:", error)
      setMessage(`Failed to save location: ${error.message}`)
    }
  }

  const resetToUserLocation = () => {
    if (userLocation) {
      setWeatherData(userLocation)
      setMessage("Switched back to your profile location")
      setTimeout(() => setMessage(""), 3000)
    }
  }

  const containerStyle = {
    padding: "0",
    backgroundColor: "#f8fafc",
    minHeight: "100vh",
  }

  const tabStyle = {
    padding: "15px 25px",
    backgroundColor: "transparent",
    border: "2px solid #1e40af",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "all 0.3s ease",
    margin: "0 8px",
    fontSize: "16px",
    color: "#1e40af",
  }

  const activeTabStyle = {
    ...tabStyle,
    backgroundColor: "#1e40af",
    color: "white",
  }

  const headerStyle = {
    background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
    color: "white",
    padding: "30px 20px",
    textAlign: "center",
    marginBottom: "20px",
  }

  if (loading && !weatherData) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "60px",
              height: "60px",
              border: "6px solid #f3f3f3",
              borderTop: "6px solid #1e40af",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 20px",
            }}
          ></div>
          <h3 style={{ color: "#1e40af", marginBottom: "10px" }}>🌤️ Loading Weather Data</h3>
          <p style={{ color: "#666" }}>Getting personalized weather forecast for your location...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h1 style={{ fontSize: "32px", marginBottom: "10px", fontWeight: "bold" }}>🌤️ Smart Weather System</h1>
        <p style={{ fontSize: "18px", opacity: "0.9" }}>Personalized weather forecasts for smart farming decisions</p>
      </div>

      {/* Navigation Tabs */}
      <div style={{ padding: "0 20px", textAlign: "center", marginBottom: "20px" }}>
        <button onClick={() => setActiveTab("current")} style={activeTab === "current" ? activeTabStyle : tabStyle}>
          🏠 My Location
        </button>
        <button onClick={() => setActiveTab("saved")} style={activeTab === "saved" ? activeTabStyle : tabStyle}>
          📍 Saved Locations ({savedLocations.length})
        </button>
        <button onClick={() => setActiveTab("map")} style={activeTab === "map" ? activeTabStyle : tabStyle}>
          🗺️ Map Search
        </button>
      </div>

      {/* Message */}
      {message && (
        <div
          style={{
            margin: "0 20px 20px 20px",
            padding: "15px",
            backgroundColor: message.includes("successfully") || message.includes("loaded") ? "#d4edda" : "#f8d7da",
            color: message.includes("successfully") || message.includes("loaded") ? "#155724" : "#721c24",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          {message}
        </div>
      )}

      {/* Content */}
      <div style={{ padding: "0 20px" }}>
        {activeTab === "current" && (
          <div>
            {weatherData ? (
              <WeatherDisplay
                data={weatherData}
                loading={loading}
                onSaveLocation={handleSaveLocation}
                showSaveOption={weatherData.source !== "user_profile"}
                onResetToUserLocation={
                  userLocation && weatherData.source !== "user_profile" ? resetToUserLocation : null
                }
              />
            ) : (
              <div
                style={{
                  backgroundColor: "white",
                  padding: "60px",
                  borderRadius: "12px",
                  textAlign: "center",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                }}
              >
                <div style={{ fontSize: "64px", marginBottom: "20px" }}>📍</div>
                <h3 style={{ fontSize: "24px", color: "#666", marginBottom: "15px" }}>Location Setup Required</h3>
                <p style={{ color: "#888", marginBottom: "20px" }}>
                  Please complete your profile address information to get weather forecasts.
                </p>
                <button
                  onClick={() => (window.location.href = "#profile")}
                  style={{
                    padding: "12px 24px",
                    backgroundColor: "#1e40af",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "16px",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  Complete Profile
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "saved" && (
          <SavedLocations
            locations={savedLocations}
            onLocationSelect={handleSavedLocationSelect}
            onRefresh={fetchSavedLocations}
          />
        )}

        {activeTab === "map" && (
          <MapSearch onLocationSelect={handleLocationSelect} onSaveLocation={handleSaveLocation} />
        )}
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  )
}

export default Weather
