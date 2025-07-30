const API_BASE_URL = "http://localhost:8000/api"

// Generic API call function with token handling
export const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem("access_token")

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  }

  // Add token to headers if available and not login/register
  if (token && !endpoint.includes("login") && !endpoint.includes("register")) {
    config.headers.Authorization = `Bearer ${token}`
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config)

    if (!response.ok) {
      const errorText = await response.text()
      let errorMessage = "API call failed"

      try {
        const errorData = JSON.parse(errorText)
        errorMessage = errorData.detail || errorData.error || JSON.stringify(errorData) || errorMessage
      } catch {
        errorMessage = errorText || errorMessage
      }

      throw new Error(errorMessage)
    }

    const data = await response.json()
    return { data, status: response.status }
  } catch (error) {
    console.error("API Error:", error)
    throw error
  }
}

// Specific API functions for users - FIXED TO MATCH DJANGO
export const userAPI = {
  // Registration - ONLY ONE TYPE (farmers)
  register: (userData) => {
    // Remove confirm_password before sending to API
    const { confirm_password, ...cleanData } = userData

    const formData = new FormData()
    Object.keys(cleanData).forEach((key) => {
      if (cleanData[key] !== null && cleanData[key] !== undefined && cleanData[key] !== "") {
        formData.append(key, cleanData[key])
      }
    })

    return apiCall("/users/register/", {
      method: "POST",
      body: formData,
      headers: {}, // Remove Content-Type to let browser set it for FormData
    })
  },

  // Authentication
  login: (credentials) =>
    apiCall("/users/login/", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  // Profile management
  getProfile: () => apiCall("/users/profile/"),

  updateProfile: (userData) => {
    const formData = new FormData()
    Object.keys(userData).forEach((key) => {
      const value = userData[key]
      if (value !== null && value !== undefined && value !== "") {
        // Only add new files, not existing file objects
        if (key === "profile_photo" && !(value instanceof File)) {
          return // Skip existing file objects
        }
        formData.append(key, value)
      }
    })

    return apiCall("/users/profile/", {
      method: "PUT",
      body: formData,
      headers: {}, // Remove Content-Type for FormData
    })
  },

  // Password reset
  requestOTP: (phone) =>
    apiCall("/users/request-otp/", {
      method: "POST",
      body: JSON.stringify({ phone }),
    }),

  verifyOTP: (otpData) =>
    apiCall("/users/verify-otp/", {
      method: "POST",
      body: JSON.stringify(otpData),
    }),
}
