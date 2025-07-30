"use client"

import { useState, useEffect, useRef } from "react"

const EnhancedMapSearch = ({ onLocationSelect, onSaveLocation }) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [showSaveForm, setShowSaveForm] = useState(false)
  const [saveFormData, setSaveFormData] = useState({
    name: "",
    province: "",
    district: "",
    municipality: "",
    ward_number: "",
  })

  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)

  useEffect(() => {
    const loadLeaflet = async () => {
      if (typeof window !== "undefined" && !window.L) {
        const link = document.createElement("link")
        link.rel = "stylesheet"
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        document.head.appendChild(link)

        const script = document.createElement("script")
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        script.onload = initializeMap
        document.head.appendChild(script)
      } else if (window.L) {
        initializeMap()
      }
    }

    const initializeMap = () => {
      if (mapRef.current && !mapInstanceRef.current) {
        mapInstanceRef.current = window.L.map(mapRef.current).setView([28.3949, 84.124], 7)

        window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 18,
        }).addTo(mapInstanceRef.current)

        mapInstanceRef.current.on("click", handleMapClick)
      }
    }

    loadLeaflet()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  const handleMapClick = async (e) => {
    const { lat, lng } = e.latlng

    if (lat < 26.0 || lat > 31.0 || lng < 80.0 || lng > 89.0) {
      setMessage("Please select a location within Nepal")
      return
    }

    if (markerRef.current) {
      mapInstanceRef.current.removeLayer(markerRef.current)
    }

    markerRef.current = window.L.marker([lat, lng]).addTo(mapInstanceRef.current)

    try {
      const locationName = await reverseGeocode(lat, lng)
      setSelectedLocation({
        lat,
        lng,
        name: locationName,
      })
      setMessage(`Selected: ${locationName}`)
    } catch (error) {
      setSelectedLocation({
        lat,
        lng,
        name: `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      })
      setMessage("Location selected")
    }
  }

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
        {
          headers: {
            "User-Agent": "SmartKheti/1.0",
          },
        },
      )
      const data = await response.json()

      if (data.address) {
        const parts = []
        if (data.address.village || data.address.town || data.address.city) {
          parts.push(data.address.village || data.address.town || data.address.city)
        }
        if (data.address.county || data.address.state_district) {
          parts.push(data.address.county || data.address.state_district)
        }
        if (data.address.state) {
          parts.push(data.address.state)
        }
        return parts.join(", ") || data.display_name
      }
      return data.display_name || `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`
    } catch (error) {
      console.error("Reverse geocoding failed:", error)
      return `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setLoading(true)
    setSearchResults([])
    setMessage("")

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          searchQuery + ", Nepal",
        )}&format=json&limit=5&countrycodes=np&addressdetails=1`,
        {
          headers: {
            "User-Agent": "SmartKheti/1.0",
          },
        },
      )
      const data = await response.json()

      if (data.length > 0) {
        setSearchResults(data)
        setMessage(`Found ${data.length} location(s)`)
      } else {
        setMessage("No locations found. Try a different search term.")
      }
    } catch (error) {
      console.error("Search failed:", error)
      setMessage("Search failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSearchResultClick = (result) => {
    const lat = Number.parseFloat(result.lat)
    const lng = Number.parseFloat(result.lon)

    mapInstanceRef.current.setView([lat, lng], 12)

    if (markerRef.current) {
      mapInstanceRef.current.removeLayer(markerRef.current)
    }
    markerRef.current = window.L.marker([lat, lng]).addTo(mapInstanceRef.current)

    setSelectedLocation({
      lat,
      lng,
      name: result.display_name,
    })
    setMessage(`Selected: ${result.display_name}`)
  }

  const handleGetWeather = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation.lat, selectedLocation.lng)
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

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <div className="bg-white rounded-2xl shadow-xl border border-green-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">🗺️</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Map-Based Weather Search</h2>
              <p className="text-blue-100">Find weather forecasts for any location in Nepal</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for a location in Nepal (e.g., Pokhara, Chitwan, Kathmandu)"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg"
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className={`px-8 py-3 rounded-xl font-bold text-lg transition-all duration-200 flex items-center space-x-2 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
              }`}
            >
              <span className="text-xl">{loading ? "🔄" : "🔍"}</span>
              <span>{loading ? "Searching..." : "Search"}</span>
            </button>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`rounded-xl p-4 mb-6 ${
                message.includes("failed") || message.includes("error")
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : "bg-blue-50 text-blue-700 border border-blue-200"
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="text-lg">{message.includes("failed") || message.includes("error") ? "⚠️" : "ℹ️"}</span>
                <span className="font-medium">{message}</span>
              </div>
            </div>
          )}

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-bold text-blue-600 mb-4 flex items-center space-x-2">
                <span>🎯</span>
                <span>Search Results:</span>
              </h4>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    onClick={() => handleSearchResultClick(result)}
                    className="p-4 bg-gray-50 hover:bg-blue-50 rounded-xl cursor-pointer transition-all duration-200 border border-gray-200 hover:border-blue-300 hover:shadow-md"
                  >
                    <p className="text-blue-600 font-medium">{result.display_name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm">💡</span>
              </div>
              <div>
                <h4 className="font-bold text-blue-800 mb-2">How to Use</h4>
                <p className="text-blue-700 leading-relaxed">
                  <strong>Search:</strong> Type a location name above and click search to find specific places.
                  <br />
                  <strong>Click Map:</strong> Click directly on the map below to select any location.
                  <br />
                  <strong>Get Weather:</strong> After selecting a location, click "Get Weather" to view the forecast.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="bg-white rounded-2xl shadow-xl border border-green-100 overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">🗺️</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Interactive Map</h3>
              <p className="text-green-100">Click anywhere on the map to select a location</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Map Container */}
          <div
            ref={mapRef}
            className="h-96 lg:h-[500px] w-full rounded-2xl border-2 border-gray-200 shadow-inner mb-6"
          />

          {/* Selected Location Info */}
          {selectedLocation && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 mb-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xl">📍</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-green-800 mb-2">Selected Location</h4>
                  <p className="text-green-700 text-lg mb-2">{selectedLocation.name}</p>
                  <p className="text-green-600 text-sm">
                    Coordinates: {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {selectedLocation && (
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleGetWeather}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-3"
              >
                <span className="text-2xl">🌤️</span>
                <span>Get Weather Forecast</span>
              </button>
              <button
                onClick={() => setShowSaveForm(true)}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-3"
              >
                <span className="text-2xl">💾</span>
                <span>Save Location</span>
              </button>
            </div>
          )}
        </div>
      </div>

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
                  placeholder="e.g., My Farm, Rice Field Location"
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
    </div>
  )
}

export default EnhancedMapSearch
