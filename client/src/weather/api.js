import { apiCall } from "../common/api"

// Weather API functions
export const weatherAPI = {
  // Get weather forecast (uses user profile location by default)
  getForecast: (lat = null, lon = null) => {
    const params = lat && lon ? `?lat=${lat}&lon=${lon}` : ""
    return apiCall(`/weather/forecast/${params}`)
  },

  // Get saved locations
  getSavedLocations: () => apiCall("/weather/saved-locations/"),

  // Create new saved location
  createSavedLocation: (locationData) =>
    apiCall("/weather/saved-locations/", {
      method: "POST",
      body: JSON.stringify(locationData),
    }),

  // Get weather for saved location
  getWeatherFromSavedLocation: (locationId) => apiCall(`/weather/weather/saved/?location_id=${locationId}`),

  // Test location endpoint (for debugging)
  testLocation: () => apiCall("/weather/test-location/"),
}
