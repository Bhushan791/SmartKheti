"use client"

import { useState } from "react"

const EnhancedSavedLocations = ({ locations, onLocationSelect, onRefresh }) => {
  const [selectedLocation, setSelectedLocation] = useState(null)

  const handleLocationClick = (location) => {
    setSelectedLocation(location)
    onLocationSelect(location.id)
  }

  const formatAddress = (location) => {
    const parts = []
    if (location.ward_number) parts.push(`Ward ${location.ward_number}`)
    if (location.municipality) parts.push(location.municipality)
    if (location.district) parts.push(location.district)
    if (location.province) parts.push(location.province)
    return parts.join(", ")
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-green-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-5">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">📍</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Saved Locations</h2>
              <p className="text-green-100 text-sm">Quick access to your farming areas</p>
            </div>
          </div>
          <button
            onClick={onRefresh}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl transition-all duration-200 flex items-center space-x-2 backdrop-blur-sm"
          >
            <span className="text-lg">🔄</span>
            <span className="font-medium">Refresh</span>
          </button>
        </div>
      </div>

      <div className="p-6">
        {locations.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">📍</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">No Saved Locations</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">
              Save locations from the map search to quickly access weather forecasts for your important farming areas.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 max-w-md mx-auto">
              <p className="text-green-700 text-sm flex items-center justify-center">
                <span className="mr-2">💡</span>
                <strong>Tip:</strong> Use the Map Search tab to find and save locations
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
              <p className="text-green-700 text-sm flex items-center">
                <span className="mr-2">ℹ️</span>
                Click on any saved location to view its weather forecast
              </p>
            </div>

            <div className="grid gap-4">
              {locations.map((location) => (
                <div
                  key={location.id}
                  onClick={() => handleLocationClick(location)}
                  className={`group cursor-pointer rounded-xl border-2 transition-all duration-300 transform hover:scale-[1.02] ${
                    selectedLocation?.id === location.id
                      ? "border-green-500 bg-green-50 shadow-lg"
                      : "border-gray-200 bg-white hover:border-green-300 hover:shadow-md"
                  }`}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center ${
                              selectedLocation?.id === location.id
                                ? "bg-green-500 text-white"
                                : "bg-green-100 text-green-600 group-hover:bg-green-200"
                            }`}
                          >
                            <span className="text-xl">📍</span>
                          </div>
                          <div>
                            <h4
                              className={`text-xl font-bold ${
                                selectedLocation?.id === location.id
                                  ? "text-green-800"
                                  : "text-gray-800 group-hover:text-green-700"
                              }`}
                            >
                              {location.name}
                            </h4>
                            <p className="text-gray-600 text-sm">{formatAddress(location)}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <span>📅</span>
                            <span>Saved on {new Date(location.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="ml-4">
                        {selectedLocation?.id === location.id ? (
                          <div className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center space-x-2">
                            <span>✓</span>
                            <span>Selected</span>
                          </div>
                        ) : (
                          <div className="bg-gray-100 text-gray-600 px-4 py-2 rounded-full text-sm group-hover:bg-green-100 group-hover:text-green-600 transition-colors duration-200">
                            Click to view
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6 mt-8">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm">💡</span>
                </div>
                <div>
                  <h4 className="font-bold text-green-800 mb-2">Pro Farming Tip</h4>
                  <p className="text-green-700 text-sm leading-relaxed">
                    Save multiple locations for different crops or farming areas to quickly compare weather conditions
                    and plan your farming activities accordingly. This helps optimize irrigation, harvesting, and field
                    preparation timing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default EnhancedSavedLocations
