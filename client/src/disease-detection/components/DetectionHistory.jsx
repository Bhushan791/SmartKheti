"use client"

import { useState, useEffect } from "react"
import { diseaseDetectionAPI } from "../api"

const DetectionHistory = () => {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDetection, setSelectedDetection] = useState(null)
  const [message, setMessage] = useState("")
  const [filterStatus, setFilterStatus] = useState("all") // "all", "healthy", "diseased"

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      setLoading(true)
      const response = await diseaseDetectionAPI.getDetectionHistory()
      setHistory(response.data || [])
    } catch (error) {
      console.error("Failed to fetch detection history:", error)
      setMessage("Failed to load detection history")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getDiseaseStatus = (disease) => {
    if (disease.toLowerCase().includes("healthy")) {
      return { status: "Healthy", color: "#16a34a", bgColor: "#dcfce7", icon: "✅" }
    } else {
      return { status: "Disease Detected", color: "#dc2626", bgColor: "#fef2f2", icon: "⚠️" }
    }
  }

  const filteredHistory = history.filter((detection) => {
    if (filterStatus === "all") return true
    if (filterStatus === "healthy") return detection.detected_disease.toLowerCase().includes("healthy")
    if (filterStatus === "diseased") return !detection.detected_disease.toLowerCase().includes("healthy")
    return true
  })

  const healthyCount = history.filter((d) => d.detected_disease.toLowerCase().includes("healthy")).length
  const diseasedCount = history.length - healthyCount

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-green-700 font-medium">Loading detection history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mb-4">
            <span className="text-2xl text-white">📋</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Detection History</h1>
          <p className="text-lg text-gray-600">Track your crop disease detection results over time</p>
        </div>

        {/* Message */}
        {message && (
          <div className="mb-6 p-4 rounded-xl border bg-red-50 border-red-200 text-red-800">
            <div className="flex items-center">
              <span className="mr-2">⚠️</span>
              {message}
            </div>
          </div>
        )}

        {history.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-6">🔬</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No Detection History</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              You haven't performed any disease detections yet. Start by analyzing your first crop image to build your
              detection history!
            </p>
            <button className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105">
              <span className="mr-2">🔬</span>
              Start Detection
            </button>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Detections</p>
                    <p className="text-3xl font-bold text-gray-900">{history.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🔬</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Healthy Crops</p>
                    <p className="text-3xl font-bold text-green-600">{healthyCount}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">✅</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Diseases Found</p>
                    <p className="text-3xl font-bold text-red-600">{diseasedCount}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">⚠️</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
              <div className="flex flex-wrap gap-4 justify-center">
                <button
                  onClick={() => setFilterStatus("all")}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                    filterStatus === "all"
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <span className="mr-2">📊</span>
                  All ({history.length})
                </button>
                <button
                  onClick={() => setFilterStatus("healthy")}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                    filterStatus === "healthy"
                      ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <span className="mr-2">✅</span>
                  Healthy ({healthyCount})
                </button>
                <button
                  onClick={() => setFilterStatus("diseased")}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                    filterStatus === "diseased"
                      ? "bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <span className="mr-2">⚠️</span>
                  Diseased ({diseasedCount})
                </button>
              </div>
            </div>

            {/* Detection History Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredHistory.map((detection) => {
                const diseaseInfo = getDiseaseStatus(detection.detected_disease)

                return (
                  <div
                    key={detection.id}
                    onClick={() => setSelectedDetection(detection)}
                    className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
                  >
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={detection.image || "/placeholder.svg?height=200&width=300"}
                        alt="Detection"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3">
                        <div
                          className="px-3 py-1 rounded-full text-sm font-semibold flex items-center"
                          style={{ backgroundColor: diseaseInfo.bgColor, color: diseaseInfo.color }}
                        >
                          <span className="mr-1">{diseaseInfo.icon}</span>
                          {diseaseInfo.status}
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                        {detection.detected_disease}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4 flex items-center">
                        <span className="mr-2">📅</span>
                        {formatDate(detection.detected_at)}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-500">
                          <span className="mr-1">👁️</span>
                          Click to view details
                        </div>
                        <div className="text-green-600">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {filteredHistory.length === 0 && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Results Found</h3>
                <p className="text-gray-600">No detections match the selected filter.</p>
              </div>
            )}
          </>
        )}

        {/* Detection Detail Modal */}
        {selectedDetection && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedDetection(null)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4 flex justify-between items-center">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <span className="mr-2">🔬</span>
                  Detection Details
                </h3>
                <button
                  onClick={() => setSelectedDetection(null)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Image */}
                <div className="text-center">
                  <img
                    src={selectedDetection.image || "/placeholder.svg?height=300&width=400"}
                    alt="Detection"
                    className="max-w-full h-auto rounded-xl border-2 border-gray-200 shadow-lg mx-auto"
                  />
                </div>

                {/* Detection Info */}
                <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-bold text-gray-900">Detection Information</h4>
                    <div
                      className="px-4 py-2 rounded-full text-sm font-semibold flex items-center"
                      style={{
                        backgroundColor: getDiseaseStatus(selectedDetection.detected_disease).bgColor,
                        color: getDiseaseStatus(selectedDetection.detected_disease).color,
                      }}
                    >
                      <span className="mr-2">{getDiseaseStatus(selectedDetection.detected_disease).icon}</span>
                      {getDiseaseStatus(selectedDetection.detected_disease).status}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Detected Disease</p>
                      <p className="text-lg font-bold text-gray-900">{selectedDetection.detected_disease}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Detection Date</p>
                      <p className="text-lg font-bold text-gray-900">{formatDate(selectedDetection.detected_at)}</p>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800 text-sm flex items-start">
                      <span className="mr-2 mt-0.5">💡</span>
                      <span>
                        <strong>Note:</strong> This is a historical record. For current treatment recommendations,
                        perform a new detection or consult with agricultural experts for the most up-to-date advice.
                      </span>
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => setSelectedDetection(null)}
                    className="px-6 py-3 bg-gray-500 text-white font-semibold rounded-xl hover:bg-gray-600 transition-colors"
                  >
                    Close
                  </button>
                  <button className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105">
                    <span className="mr-2">🔬</span>
                    New Detection
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DetectionHistory
