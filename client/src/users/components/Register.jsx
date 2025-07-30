"use client"

import { useState } from "react"
import { userAPI } from "../../common/api"

const EnhancedRegister = () => {
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
    confirm_password: "",
    preferred_language: "np",
    profile_photo: null,
    first_name: "",
    last_name: "",
    citizenship_number: "",
    province: "",
    district: "",
    municipality: "",
    ward_number: "",
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }))

    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
    if (message) {
      setMessage("")
    }
  }

  const formatPhoneNumber = (phone) => {
    const cleaned = phone.replace(/\D/g, "")
    if (cleaned.startsWith("977")) {
      return `+${cleaned}`
    }
    if (cleaned.startsWith("9") && cleaned.length === 10) {
      return `+977${cleaned}`
    }
    return phone
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required"
    } else {
      const phone = formData.phone.trim()
      if (!phone.match(/^(\+977)?[0-9]{10}$/) && !phone.match(/^\+977[0-9]{10}$/)) {
        newErrors.phone = "Please enter a valid Nepal phone number"
      }
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    if (!formData.confirm_password) {
      newErrors.confirm_password = "Please confirm your password"
    } else if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = "Passwords do not match"
    }

    if (!formData.first_name.trim()) newErrors.first_name = "First name is required"
    if (!formData.last_name.trim()) newErrors.last_name = "Last name is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const getErrorMessage = (error) => {
    const errorMessage = error.message.toLowerCase()

    // Handle different types of registration errors professionally
    if (errorMessage.includes("phone") && errorMessage.includes("already exists")) {
      return "This phone number is already registered. Please use a different number or try logging in instead."
    }

    if (errorMessage.includes("user already exists") || errorMessage.includes("account already exists")) {
      return "An account with this information already exists. Please try logging in or use different details."
    }

    if (errorMessage.includes("invalid phone") || errorMessage.includes("phone format")) {
      return "Please enter a valid Nepal phone number (e.g., 9800000000 or +9779800000000)."
    }

    if (errorMessage.includes("password") && errorMessage.includes("weak")) {
      return "Please choose a stronger password with at least 6 characters."
    }

    if (errorMessage.includes("validation") || errorMessage.includes("required field")) {
      return "Please fill in all required fields with valid information."
    }

    if (errorMessage.includes("network") || errorMessage.includes("connection")) {
      return "Unable to connect to our servers. Please check your internet connection and try again."
    }

    if (
      errorMessage.includes("server error") ||
      errorMessage.includes("internal error") ||
      errorMessage.includes("500")
    ) {
      return "We're experiencing technical difficulties. Please try again in a few moments."
    }

    if (errorMessage.includes("timeout")) {
      return "The request timed out. Please check your connection and try again."
    }

    if (errorMessage.includes("file") && errorMessage.includes("size")) {
      return "The profile photo is too large. Please choose a smaller image file."
    }

    if (errorMessage.includes("file") && errorMessage.includes("type")) {
      return "Please upload a valid image file (JPG, PNG, or GIF)."
    }

    // Default professional message for unknown errors
    return "We're unable to create your account right now. Please check your information and try again."
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    setErrors({})
    setMessage("")

    try {
      const formattedPhone = formatPhoneNumber(formData.phone)
      const { confirm_password, ...userData } = formData
      userData.phone = formattedPhone

      console.log("Sending user data:", userData)
      const response = await userAPI.register(userData)

      console.log("Registration response:", response)
      setMessage("🎉 Welcome to SmartKheti! Your account has been created successfully. Redirecting to login...")
      setTimeout(() => {
        window.location.href = "/login"
      }, 2000)
    } catch (error) {
      console.error("Registration error:", error)

      try {
        const errorData = JSON.parse(error.message)
        if (errorData.errors) {
          // Handle field-specific errors from backend
          const backendErrors = {}
          Object.keys(errorData.errors).forEach((field) => {
            if (field === "phone" && errorData.errors[field].includes("already exists")) {
              backendErrors[field] = "This phone number is already registered. Please use a different number."
            } else {
              backendErrors[field] = errorData.errors[field]
            }
          })
          setErrors(backendErrors)
        } else {
          const professionalMessage = getErrorMessage(error)
          setMessage(professionalMessage)
        }
      } catch {
        const professionalMessage = getErrorMessage(error)
        setMessage(professionalMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-amber-50 to-emerald-50 py-8 px-4">
      {/* Background Decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-green-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-amber-200 rounded-full opacity-30 animate-bounce"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-emerald-200 rounded-full opacity-25 animate-pulse delay-1000"></div>
      </div>

      <div className="relative max-w-4xl mx-auto">
        {/* Main Registration Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
              🌾
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Farmer Account</h1>
            <p className="text-gray-600">Join the SmartKheti community</p>
          </div>

          {/* Message Display */}
          {message && (
            <div
              className={`p-4 rounded-xl mb-6 ${
                message.includes("🎉") || message.includes("successfully")
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              <div className="flex items-start gap-3">
                {message.includes("🎉") || message.includes("successfully") ? (
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                <span className="font-medium text-sm leading-relaxed">{message}</span>
              </div>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Phone Number */}
            <div className="bg-gray-50 p-6 rounded-2xl">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                Contact Information
              </h3>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                    errors.phone ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-gray-300"
                  }`}
                  placeholder="9800000000 or +9779800000000"
                  required
                />
                {errors.phone && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {errors.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Personal Information */}
            <div className="bg-gray-50 p-6 rounded-2xl">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">First Name *</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                      errors.first_name ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                    required
                  />
                  {errors.first_name && <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name *</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                      errors.last_name ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                    required
                  />
                  {errors.last_name && <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>}
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Citizenship Number</label>
                <input
                  type="text"
                  name="citizenship_number"
                  value={formData.citizenship_number}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent hover:border-gray-300 transition-all duration-200"
                  placeholder="Optional"
                />
              </div>
            </div>

            {/* Location Information */}
            <div className="bg-gray-50 p-6 rounded-2xl">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Location Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Province</label>
                  <input
                    type="text"
                    name="province"
                    value={formData.province}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent hover:border-gray-300 transition-all duration-200"
                    placeholder="e.g., Bagmati"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">District</label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent hover:border-gray-300 transition-all duration-200"
                    placeholder="e.g., Kathmandu"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Municipality</label>
                  <input
                    type="text"
                    name="municipality"
                    value={formData.municipality}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent hover:border-gray-300 transition-all duration-200"
                    placeholder="e.g., Kathmandu Metropolitan"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Ward Number</label>
                  <input
                    type="number"
                    name="ward_number"
                    value={formData.ward_number}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent hover:border-gray-300 transition-all duration-200"
                    placeholder="e.g., 1"
                    min="1"
                  />
                </div>
              </div>
            </div>

            {/* Profile & Preferences */}
            <div className="bg-gray-50 p-6 rounded-2xl">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Profile & Preferences
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Profile Photo</label>
                  <input
                    type="file"
                    name="profile_photo"
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent hover:border-gray-300 transition-all duration-200"
                    accept="image/*"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Language</label>
                  <select
                    name="preferred_language"
                    value={formData.preferred_language}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent hover:border-gray-300 transition-all duration-200"
                  >
                    <option value="np">Nepali</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Password Section */}
            <div className="bg-gray-50 p-6 rounded-2xl">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                Security
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 pr-12 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                        errors.password ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-gray-300"
                      }`}
                      required
                      minLength="6"
                      placeholder="Minimum 6 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                          />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password *</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirm_password"
                      value={formData.confirm_password}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 pr-12 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                        errors.confirm_password ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-gray-300"
                      }`}
                      required
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                          />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.confirm_password && <p className="mt-1 text-sm text-red-600">{errors.confirm_password}</p>}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 transform ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 hover:scale-105 hover:shadow-lg"
              } text-white focus:outline-none focus:ring-4 focus:ring-green-300`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating Account...
                </div>
              ) : (
                "Create Farmer Account"
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <a href="/login" className="text-green-600 hover:text-green-700 font-semibold transition-colors">
                Login here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EnhancedRegister
