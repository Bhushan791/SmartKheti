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

  // Check if user is authenticated - FIXED VERSION
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

  // Logout user
  logout: () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    window.location.href = "/login"
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
