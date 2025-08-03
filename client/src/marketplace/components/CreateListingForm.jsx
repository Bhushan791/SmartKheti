"use client"
import { useState } from "react"

// Helper function to extract a user-friendly error message from various error formats
const getErrorMessage = (error) => {
  if (error.response && error.response.data) {
    const responseData = error.response.data
    if (typeof responseData === "string") {
      // If the response data is a raw string (e.g., HTML error page)
      return "An unexpected error occurred. Please try again later."
    } else if (responseData.message) {
      // If the response data has a 'message' property
      return responseData.message
    } else if (typeof responseData === "object") {
      // If the response data is a nested JSON object (e.g., validation errors)
      const messages = []
      for (const key in responseData) {
        if (Object.prototype.hasOwnProperty.call(responseData, key)) {
          const value = responseData[key]
          if (Array.isArray(value)) {
            messages.push(`${key}: ${value.join(", ")}`)
          } else if (typeof value === "object" && value !== null) {
            // Handle nested objects, e.g., {"images":{"0":["..."]}}
            for (const subKey in value) {
              if (Object.prototype.hasOwnProperty.call(value, subKey)) {
                const subValue = value[subKey]
                if (Array.isArray(subValue)) {
                  messages.push(`${key} ${subKey}: ${subValue.join(", ")}`)
                } else {
                  messages.push(`${key} ${subKey}: ${subValue}`)
                }
              }
            }
          } else {
            messages.push(`${key}: ${value}`)
          }
        }
      }
      return messages.length > 0 ? messages.join("; ") : "An unknown error occurred."
    }
  } else if (error.message) {
    // Generic error message from the Error object
    return error.message
  }
  return "An unexpected error occurred. Please try again."
}

const EnhancedCreateListingForm = ({ onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    crop_name: "",
    quantity: "",
    rate: "",
    location: "",
    description: "",
    category: "",
    contact_number: "",
    optional_contact: "",
    images: [],
    video: null,
  })
  const [errors, setErrors] = useState({}) // For client-side validation errors
  const [apiError, setApiError] = useState("") // For API-related errors
  const [loading, setLoading] = useState(false)
  const [imagePreviews, setImagePreviews] = useState([])
  const [videoPreview, setVideoPreview] = useState(null)

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target
    if (type === "file") {
      if (name === "images") {
        const selectedFiles = Array.from(files)
        setFormData((prev) => ({ ...prev, images: selectedFiles }))
        // Create previews
        const previews = selectedFiles.map((file) => URL.createObjectURL(file))
        setImagePreviews(previews)
      } else if (name === "video") {
        const file = files[0]
        setFormData((prev) => ({ ...prev, video: file }))
        if (file) {
          setVideoPreview(URL.createObjectURL(file))
        }
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.crop_name.trim()) newErrors.crop_name = "Crop name is required"
    if (!formData.quantity.trim()) newErrors.quantity = "Quantity is required"
    if (!formData.rate.trim()) newErrors.rate = "Rate is required"
    if (!formData.location.trim()) newErrors.location = "Location is required"
    if (!formData.contact_number.trim()) newErrors.contact_number = "Contact number is required"
    // Validate rate is a number
    if (formData.rate && isNaN(formData.rate)) {
      newErrors.rate = "Rate must be a valid number"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError("") // Clear any previous API errors
    if (!validateForm()) return

    setLoading(true)
    try {
      await onSubmit(formData)
      // If onSubmit is successful, you might want to close the modal or show a success message
      onClose() // Assuming successful submission closes the modal
    } catch (error) {
      console.error("Error creating listing:", error)
      setApiError(getErrorMessage(error)) // Set the API error message
    } finally {
      setLoading(false)
    }
  }

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index)
    const newPreviews = imagePreviews.filter((_, i) => i !== index)
    setFormData((prev) => ({ ...prev, images: newImages }))
    setImagePreviews(newPreviews)
  }

  const removeVideo = () => {
    setFormData((prev) => ({ ...prev, video: null }))
    setVideoPreview(null)
  }

  const categories = [
    { value: "", label: "Select Category", icon: "📂" },
    { value: "Grain", label: "Grain", icon: "🌾" },
    { value: "Vegetable", label: "Vegetable", icon: "🥬" },
    { value: "Fruit", label: "Fruit", icon: "🍎" },
    { value: "Spice", label: "Spice", icon: "🌶️" },
    { value: "Other", label: "Other", icon: "🌱" },
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">➕</span>
            <div>
              <h2 className="text-2xl font-bold">Create New Listing</h2>
              <p className="text-green-100">Add your crop to the marketplace</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center text-2xl font-bold transition-all duration-300 hover:scale-110"
          >
            ×
          </button>
        </div>
        {/* Form Content */}
        <div className="max-h-[calc(95vh-120px)] overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 lg:p-8 space-y-8">
            {/* API Error Message Display */}
            {apiError && (
              <div className="bg-red-50 text-red-800 border border-red-200 p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-medium">{apiError}</span>
                </div>
                <button onClick={() => setApiError("")} className="p-1 rounded-full hover:bg-red-100 text-red-800">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            )}

            {/* Basic Information Section */}
            <div className="bg-gray-50 p-6 rounded-2xl">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="text-2xl">🌾</span>
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Crop Name *</label>
                  <input
                    type="text"
                    name="crop_name"
                    value={formData.crop_name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                      errors.crop_name ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                    placeholder="e.g., Rice, Wheat, Tomato"
                    required
                  />
                  {errors.crop_name && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {errors.crop_name}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent hover:border-gray-300 transition-all duration-200"
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity *</label>
                  <input
                    type="text"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                      errors.quantity ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                    placeholder="e.g., 100 kg, 50 sacks"
                    required
                  />
                  {errors.quantity && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {errors.quantity}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Rate (NPR) *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-500 font-medium">₨</span>
                    </div>
                    <input
                      type="number"
                      name="rate"
                      value={formData.rate}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                        errors.rate ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-gray-300"
                      }`}
                      placeholder="5000"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                  {errors.rate && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {errors.rate}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Location *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  </div>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                      errors.location ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                    placeholder="e.g., Kathmandu, Pokhara, Chitwan"
                    required
                  />
                </div>
                {errors.location && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {errors.location}
                  </p>
                )}
              </div>
              <div className="mt-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent hover:border-gray-300 transition-all duration-200 resize-vertical"
                  placeholder="Describe your crop quality, farming methods, organic certification, etc."
                />
              </div>
            </div>
            {/* Contact Information Section */}
            <div className="bg-blue-50 p-6 rounded-2xl">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="text-2xl">📞</span>
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Primary Contact Number *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </div>
                    <input
                      type="tel"
                      name="contact_number"
                      value={formData.contact_number}
                      onChange={handleInputChange}
                      className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                        errors.contact_number ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-gray-300"
                      }`}
                      placeholder="+977-9800000000"
                      required
                    />
                  </div>
                  {errors.contact_number && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {errors.contact_number}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Optional Contact</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </div>
                    <input
                      type="tel"
                      name="optional_contact"
                      value={formData.optional_contact}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent hover:border-gray-300 transition-all duration-200"
                      placeholder="+977-9800000001"
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* Media Section */}
            <div className="bg-amber-50 p-6 rounded-2xl">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="text-2xl">📸</span>
                Media Files
              </h3>
              {/* Images */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Product Images</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-green-400 transition-colors duration-200">
                  <input
                    type="file"
                    name="images"
                    onChange={handleInputChange}
                    className="hidden"
                    accept="image/*"
                    multiple
                    id="images-upload"
                  />
                  <label htmlFor="images-upload" className="cursor-pointer">
                    <div className="text-4xl mb-2">📷</div>
                    <p className="text-gray-600 font-medium">Click to upload images</p>
                    <p className="text-sm text-gray-500 mt-1">JPG, PNG up to 10MB each</p>
                  </label>
                </div>
                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview || "/placeholder.svg"}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-xl border-2 border-gray-200 group-hover:border-green-400 transition-colors duration-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200 transform hover:scale-110"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* Video */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Product Video (Optional)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-green-400 transition-colors duration-200">
                  <input
                    type="file"
                    name="video"
                    onChange={handleInputChange}
                    className="hidden"
                    accept="video/*"
                    id="video-upload"
                  />
                  <label htmlFor="video-upload" className="cursor-pointer">
                    <div className="text-4xl mb-2">🎥</div>
                    <p className="text-gray-600 font-medium">Click to upload video</p>
                    <p className="text-sm text-gray-500 mt-1">MP4, MOV up to 50MB</p>
                  </label>
                </div>
                {/* Video Preview */}
                {videoPreview && (
                  <div className="mt-4 relative">
                    <video
                      src={videoPreview}
                      controls
                      className="w-full max-w-md mx-auto h-48 rounded-xl border-2 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={removeVideo}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-bold transition-all duration-200 transform hover:scale-105"
                    >
                      Remove Video
                    </button>
                  </div>
                )}
              </div>
            </div>
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 transform ${
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
                    Creating Listing...
                  </div>
                ) : (
                  "Create Listing"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
export default EnhancedCreateListingForm
