"use client"

import { useState, useRef } from "react"
import { diseaseDetectionAPI } from "../api"
import DetectionResult from "./DetectionResult"
import DetectionHistory from "./DetectionHistory"

const DiseaseDetection = () => {
  const [activeTab, setActiveTab] = useState("detect") // "detect" or "history"
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [detecting, setDetecting] = useState(false)
  const [detectionResult, setDetectionResult] = useState(null)
  const [message, setMessage] = useState("")
  const [showCamera, setShowCamera] = useState(false)

  const fileInputRef = useRef(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedImage(file)
      setImagePreview(URL.createObjectURL(file))
      setDetectionResult(null)
      setMessage("")
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "environment", // Use back camera on mobile
        },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setShowCamera(true)
        setMessage("")
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      setMessage("Unable to access camera. Please check permissions or use file upload.")
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const ctx = canvas.getContext("2d")
      ctx.drawImage(video, 0, 0)

      canvas.toBlob(
        (blob) => {
          const file = new File([blob], "captured-image.jpg", { type: "image/jpeg" })
          setSelectedImage(file)
          setImagePreview(URL.createObjectURL(file))
          setDetectionResult(null)
          stopCamera()
        },
        "image/jpeg",
        0.8,
      )
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setShowCamera(false)
  }

  const handleDetection = async () => {
    if (!selectedImage) {
      setMessage("Please select or capture an image first")
      return
    }

    setDetecting(true)
    setMessage("")

    try {
      const response = await diseaseDetectionAPI.detectDisease(selectedImage)
      setDetectionResult(response.data)
      setMessage("Disease detection completed successfully!")
    } catch (error) {
      console.error("Detection failed:", error)
      setMessage(`Detection failed: ${error.message}`)
    } finally {
      setDetecting(false)
    }
  }

  const resetDetection = () => {
    setSelectedImage(null)
    setImagePreview(null)
    setDetectionResult(null)
    setMessage("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 rounded-full mb-4">
            <span className="text-2xl">🔬</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">AI-Powered Disease Detection</h1>
          <p className="text-lg text-green-100">Advanced crop disease identification and treatment recommendations</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-center space-x-8">
            <button
              onClick={() => setActiveTab("detect")}
              className={`py-4 px-6 font-semibold border-b-2 transition-colors ${
                activeTab === "detect"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <span className="mr-2">🔬</span>
              Disease Detection
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`py-4 px-6 font-semibold border-b-2 transition-colors ${
                activeTab === "history"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <span className="mr-2">📋</span>
              Detection History
            </button>
          </div>
        </div>
      </div>

      {activeTab === "detect" ? (
        <div className="py-8 px-4">
          <div className="max-w-4xl mx-auto">
            {/* Message */}
            {message && (
              <div
                className={`mb-6 p-4 rounded-xl border ${
                  message.includes("successfully") || message.includes("completed")
                    ? "bg-green-50 border-green-200 text-green-800"
                    : "bg-red-50 border-red-200 text-red-800"
                }`}
              >
                <div className="flex items-center">
                  <span className="mr-2">
                    {message.includes("successfully") || message.includes("completed") ? "✅" : "⚠️"}
                  </span>
                  {message}
                </div>
              </div>
            )}

            {/* Detection Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-8">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <span className="mr-2">📸</span>
                  Upload or Capture Image
                </h2>
              </div>
              <div className="p-6">
                <p className="text-center text-gray-600 mb-6">
                  Upload an image or take a photo of your crop to detect diseases and get treatment recommendations
                </p>

                {/* Upload/Camera Section */}
                {!showCamera && !imagePreview && (
                  <div className="space-y-6">
                    {/* Upload Area */}
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-green-300 rounded-xl p-12 text-center cursor-pointer hover:border-green-400 hover:bg-green-50 transition-all"
                    >
                      <div className="text-6xl mb-4">📁</div>
                      <h3 className="text-xl font-bold text-green-700 mb-2">Upload Crop Image</h3>
                      <p className="text-gray-600 mb-4">Click here to select an image from your device</p>
                      <p className="text-sm text-gray-500">Supported formats: JPG, PNG, JPEG (Max 10MB)</p>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />

                    {/* Camera Option */}
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-4">
                        <div className="flex-1 h-px bg-gray-300"></div>
                        <span className="px-4 text-gray-500 font-medium">OR</span>
                        <div className="flex-1 h-px bg-gray-300"></div>
                      </div>
                      <button
                        onClick={startCamera}
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-all transform hover:scale-105"
                      >
                        <span className="mr-2">📷</span>
                        Take Photo with Camera
                      </button>
                    </div>
                  </div>
                )}

                {/* Camera View */}
                {showCamera && (
                  <div className="text-center space-y-6">
                    <div className="relative inline-block">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full max-w-lg h-auto rounded-xl border-4 border-green-500 shadow-lg"
                      />
                      <canvas ref={canvasRef} className="hidden" />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button
                        onClick={capturePhoto}
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:from-green-700 hover:to-emerald-700 transition-all"
                      >
                        <span className="mr-2">📸</span>
                        Capture Photo
                      </button>
                      <button
                        onClick={stopCamera}
                        className="inline-flex items-center px-6 py-3 bg-gray-500 text-white font-semibold rounded-xl shadow-lg hover:bg-gray-600 transition-all"
                      >
                        <span className="mr-2">❌</span>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Image Preview */}
                {imagePreview && !showCamera && (
                  <div className="text-center space-y-6">
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-4">Selected Image:</h4>
                      <div className="relative inline-block">
                        <img
                          src={imagePreview || "/placeholder.svg"}
                          alt="Selected crop"
                          className="max-w-full max-h-96 rounded-xl border-4 border-green-500 shadow-lg"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button
                        onClick={handleDetection}
                        disabled={detecting}
                        className={`inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl shadow-lg hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105 ${
                          detecting ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        {detecting ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <span className="mr-2">🔬</span>
                            Detect Disease
                          </>
                        )}
                      </button>
                      <button
                        onClick={resetDetection}
                        className="inline-flex items-center px-6 py-3 bg-red-500 text-white font-semibold rounded-xl shadow-lg hover:bg-red-600 transition-all"
                      >
                        <span className="mr-2">🗑️</span>
                        Remove Image
                      </button>
                    </div>
                  </div>
                )}

                {/* Loading Animation */}
                {detecting && (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-6"></div>
                    <h3 className="text-xl font-bold text-green-700 mb-2">🤖 AI Analysis in Progress</h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      Our advanced AI model is analyzing your crop image for disease detection. This may take a few
                      moments...
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Detection Result */}
            {detectionResult && (
              <DetectionResult result={detectionResult} image={imagePreview} onNewDetection={resetDetection} />
            )}
          </div>
        </div>
      ) : (
        <DetectionHistory />
      )}
    </div>
  )
}

export default DiseaseDetection
