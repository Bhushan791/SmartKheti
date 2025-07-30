import { apiCall } from "../common/api"

// Disease Detection API functions
export const diseaseDetectionAPI = {
  // Detect disease from uploaded image
  detectDisease: (imageFile) => {
    const formData = new FormData()
    formData.append("image", imageFile)

    return apiCall("/disease_detection/detect/", {
      method: "POST",
      body: formData,
      headers: {}, // Remove Content-Type for FormData
    })
  },

  // Get user's detection history
  getDetectionHistory: () => apiCall("/disease_detection/detection-history/"),

  // Admin endpoint (if needed)
  getAllDetections: () => apiCall("/disease_detection/admin/detections/"),
}
