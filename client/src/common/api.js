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
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.detail || data.error || "API call failed")
    }

    return { data, status: response.status }
  } catch (error) {
    console.error("API Error:", error)
    throw error
  }
}

// Specific API functions for users
export const userAPI = {
  register: (userData) => {
    const formData = new FormData()
    Object.keys(userData).forEach((key) => {
      if (userData[key] !== null && userData[key] !== undefined) {
        formData.append(key, userData[key])
      }
    })

    return apiCall("/users/register/", {
      method: "POST",
      body: formData,
      headers: {}, // Remove Content-Type to let browser set it for FormData
    })
  },

  login: (credentials) =>
    apiCall("/users/login/", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  getProfile: () => apiCall("/users/profile/"),

  updateProfile: (userData) => {
    const formData = new FormData()
    Object.keys(userData).forEach((key) => {
      if (userData[key] !== null && userData[key] !== undefined) {
        formData.append(key, userData[key])
      }
    })

    return apiCall("/users/profile/", {
      method: "PUT",
      body: formData,
      headers: {}, // Remove Content-Type for FormData
    })
  },

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
