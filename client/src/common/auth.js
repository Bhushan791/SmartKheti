import { userAPI } from "./api"

// Authentication utilities
export const auth = {
  // Save tokens to localStorage
  saveTokens: (tokens) => {
    localStorage.setItem("access_token", tokens.access)
    if (tokens.refresh) {
      localStorage.setItem("refresh_token", tokens.refresh)
    }
  },

  // Get access token
  getToken: () => localStorage.getItem("access_token"),

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem("access_token")
    if (!token) return false

    try {
      // Check if token is expired (basic check)
      const payload = JSON.parse(atob(token.split(".")[1]))
      const currentTime = Date.now() / 1000

      if (payload.exp < currentTime) {
        // Token expired, remove it
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
        return false
      }

      return true
    } catch (error) {
      // Invalid token format, remove it
      localStorage.removeItem("access_token")
      localStorage.removeItem("refresh_token")
      return false
    }
  },

  // Get user info from API - SIMPLIFIED (everyone is a farmer)
  getUserInfo: async () => {
    try {
      const response = await userAPI.getProfile()
      return response.data
    } catch (error) {
      console.error("Error getting user info:", error)
      return null
    }
  },

  // Get user phone from token
  getUserPhone: () => {
    const token = localStorage.getItem("access_token")
    if (!token) return null

    try {
      const payload = JSON.parse(atob(token.split(".")[1]))
      return payload.phone || payload.username || null
    } catch (error) {
      console.error("Error getting user phone:", error)
      return null
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    window.location.href = "/"
  },

  // Redirect to login if not authenticated
  requireAuth: () => {
    if (!auth.isAuthenticated()) {
      window.location.href = "/login"
      return false
    }
    return true
  },
}
// Add this method to your existing auth object in auth.js

// Get user type - since everyone is a farmer, always return "farmer"
getUserType: async () => {
  try {
    // Since your system only has farmers, return "farmer"
    // If you need to check from API, uncomment below:
    // const response = await userAPI.getProfile()
    // return response.data.user_type || "farmer"
    
    return "farmer"
  } catch (error) {
    console.error("Error getting user type:", error)
    throw error
  }
}