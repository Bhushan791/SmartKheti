"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { apiCall } from "../common/api"

const Report = () => {
  const [detectionData, setDetectionData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
    useRange: false,
  })
  const [analytics, setAnalytics] = useState({
    totalDetections: 0,
    healthyCount: 0,
    diseasedCount: 0,
    healthPercentage: 0,
    diseasePercentage: 0,
    commonDiseases: [],
    cropTypes: [],
    monthlyTrends: [],
    locationStats: [],
    recentDetections: [],
    dailyTrends: [],
    diseasesByMonth: {},
    detectionHeatmap: [],
  })

  useEffect(() => {
    fetchDetectionData()
  }, [])

  const fetchDetectionData = async (retryCount = 0) => {
    setLoading(true)
    setError("")

    try {
      // Use the generic apiCall helper with endpoint only (no full URL)
      const { data, status } = await apiCall("/disease_detection/admin/detections/", {
        method: "GET",
      })

      console.log("API fetchDetectionData response data:", data)

      if (!Array.isArray(data)) {
        throw new Error("Invalid data format received from server")
      }

      setDetectionData(data)
      processAnalytics(data)
      setLoading(false)
    } catch (error) {
      console.error("Failed to fetch detection data:", error)
      console.log("Error name:", error.name)
      console.log("Error message:", error.message)

      if (retryCount < 2) {
        setTimeout(
          () => {
            fetchDetectionData(retryCount + 1)
          },
          2000 * (retryCount + 1),
        )
      } else {
        let errorMessage = "Failed to load detection data. "
        if (error.name === "TypeError" && error.message.includes("fetch")) {
          errorMessage += "Please check your internet connection and ensure the server is running."
        } else if (error.message.includes("timeout")) {
          errorMessage += "Request timed out. Please try again."
        } else {
          errorMessage += error.message
        }
        setError(errorMessage)
        setLoading(false)
      }
    }
  }

  // Alternative fetchDetectionData with timeout implementation
  const fetchDetectionDataWithTimeout = async (retryCount = 0) => {
    setLoading(true)
    setError("")

    try {
      const apiBaseUrl = import.meta.env.VITE_APP_API_BASE_URL || "http://127.0.0.1:8000/api"

      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Request timeout")), 10000))

      // Create the fetch promise
      const fetchPromise = fetch(`${apiBaseUrl}/disease_detection/admin/detections/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      // Race between fetch and timeout
      const response = await Promise.race([fetchPromise, timeoutPromise])

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch detection data`)
      }

      const data = await response.json()
      console.log("Fetched data:", data)

      if (!Array.isArray(data)) {
        throw new Error("Invalid data format received from server")
      }

      setDetectionData(data)
      processAnalytics(data)
      setLoading(false)
    } catch (error) {
      console.error("Failed to fetch detection data:", error)

      if (retryCount < 2) {
        // Retry up to 2 times
        setTimeout(
          () => {
            fetchDetectionDataWithTimeout(retryCount + 1)
          },
          2000 * (retryCount + 1),
        ) // Exponential backoff
      } else {
        let errorMessage = "Failed to load detection data. "
        if (error.name === "TypeError" && error.message.includes("fetch")) {
          errorMessage += "Please check your internet connection and ensure the server is running."
        } else if (error.message.includes("timeout")) {
          errorMessage += "Request timed out. Please try again."
        } else {
          errorMessage += error.message
        }
        setError(errorMessage)
        setLoading(false)
      }
    }
  }

  const processAnalytics = (data) => {
    if (!data || data.length === 0) {
      setAnalytics({
        totalDetections: 0,
        healthyCount: 0,
        diseasedCount: 0,
        healthPercentage: 0,
        diseasePercentage: 0,
        commonDiseases: [],
        cropTypes: [],
        monthlyTrends: [],
        userStats: [],
        locationStats: [],
        recentDetections: [],
        dailyTrends: [],
        diseasesByMonth: {},
        topDiseasesByUser: {},
        detectionHeatmap: [],
      })
      return
    }

    // Filter data by date range if specified
    let filteredData = data
    if (dateRange.useRange && dateRange.startDate && dateRange.endDate) {
      filteredData = data.filter((item) => {
        const detectionDate = new Date(item.detected_at)
        const start = new Date(dateRange.startDate)
        const end = new Date(dateRange.endDate)
        return detectionDate >= start && detectionDate <= end
      })
    }

    const totalDetections = filteredData.length

    // Check for healthy crops
    const healthyCount = filteredData.filter((item) => {
      const disease = item.detected_disease.toLowerCase()
      return (
        disease.includes("healthy") || disease.includes("normal") || disease.includes("good") || disease === "healthy"
      )
    }).length

    const diseasedCount = totalDetections - healthyCount

    // Extract crop types and diseases
    const diseaseCount = {}
    const cropCount = {}
    const monthlyData = {}
    const dailyData = {}
    const diseasesByMonth = {}
    const detectionHeatmap = []

    filteredData.forEach((item) => {
      // Clean disease name
      const disease = item.detected_disease.replace(/^\d+\s*/, "").trim()
      diseaseCount[disease] = (diseaseCount[disease] || 0) + 1

      // Extract crop type from disease name
      let cropType = "Unknown"
      if (disease.includes("_")) {
        cropType = disease.split("_")[0]
      } else if (disease.includes(" ")) {
        cropType = disease.split(" ")[0]
      } else {
        const lowerDisease = disease.toLowerCase()
        if (lowerDisease.includes("potato")) cropType = "Potato"
        else if (lowerDisease.includes("tomato")) cropType = "Tomato"
        else if (lowerDisease.includes("corn") || lowerDisease.includes("maize")) cropType = "Corn"
        else if (lowerDisease.includes("rice")) cropType = "Rice"
        else if (lowerDisease.includes("wheat")) cropType = "Wheat"
        else if (lowerDisease.includes("apple")) cropType = "Apple"
        else if (lowerDisease.includes("pepper")) cropType = "Pepper"
        else cropType = disease.split(/[_\s]/)[0] || "Unknown"
      }

      cropCount[cropType] = (cropCount[cropType] || 0) + 1

      // Monthly and daily trends
      const detectionDate = new Date(item.detected_at)
      const month = detectionDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      })
      const day = detectionDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })

      if (!monthlyData[month]) {
        monthlyData[month] = { total: 0, healthy: 0, diseased: 0 }
      }
      if (!dailyData[day]) {
        dailyData[day] = { total: 0, healthy: 0, diseased: 0 }
      }
      if (!diseasesByMonth[month]) {
        diseasesByMonth[month] = {}
      }

      monthlyData[month].total++
      dailyData[day].total++
      diseasesByMonth[month][disease] = (diseasesByMonth[month][disease] || 0) + 1

      const isHealthy =
        disease.toLowerCase().includes("healthy") ||
        disease.toLowerCase().includes("normal") ||
        disease.toLowerCase().includes("good")

      if (isHealthy) {
        monthlyData[month].healthy++
        dailyData[day].healthy++
      } else {
        monthlyData[month].diseased++
        dailyData[day].diseased++
      }

      // Create heatmap data (simplified)
      detectionHeatmap.push({
        date: detectionDate.toISOString().split("T")[0],
        count: 1,
        disease: disease,
      })
    })

    // Sort common diseases
    const commonDiseases = Object.entries(diseaseCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([disease, count]) => ({ disease, count }))

    // Sort crop types
    const cropTypes = Object.entries(cropCount)
      .sort(([, a], [, b]) => b - a)
      .map(([crop, count]) => ({ crop, count }))

    // Monthly trends
    const monthlyTrends = Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        ...data,
        healthPercentage: data.total > 0 ? ((data.healthy / data.total) * 100).toFixed(1) : "0",
      }))
      .sort((a, b) => new Date(a.month + " 1") - new Date(b.month + " 1"))

    // Daily trends (last 30 days)
    const dailyTrends = Object.entries(dailyData)
      .map(([day, data]) => ({
        day,
        ...data,
        healthPercentage: data.total > 0 ? ((data.healthy / data.total) * 100).toFixed(1) : "0",
      }))
      .sort((a, b) => new Date(a.day) - new Date(b.day))
      .slice(-30)

    // Recent detections
    const recentDetections = filteredData.sort((a, b) => new Date(b.detected_at) - new Date(a.detected_at)).slice(0, 20)

    setAnalytics({
      totalDetections,
      healthyCount,
      diseasedCount,
      healthPercentage: totalDetections > 0 ? ((healthyCount / totalDetections) * 100).toFixed(1) : "0",
      diseasePercentage: totalDetections > 0 ? ((diseasedCount / totalDetections) * 100).toFixed(1) : "0",
      commonDiseases,
      cropTypes,
      monthlyTrends,
      dailyTrends,
      locationStats: [], // Placeholder for location data
      recentDetections,
      diseasesByMonth,
      detectionHeatmap,
    })
  }

  const handleDateRangeChange = (field, value) => {
    setDateRange((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const applyDateFilter = () => {
    processAnalytics(detectionData)
  }

  const generatePDF = async () => {
    try {
      if (analytics.totalDetections === 0) {
        alert("No detection data available to generate report.")
        return
      }

      // Load jsPDF from CDN
      if (!window.jspdf) {
        const script = document.createElement("script")
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
        document.head.appendChild(script)

        await new Promise((resolve, reject) => {
          script.onload = resolve
          script.onerror = reject
        })
      }

      // Load jspdf-autotable from CDN
      if (!window.jspdf.autoTable) {
        const script = document.createElement("script")
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.23/jspdf.plugin.autotable.min.js"
        document.head.appendChild(script)

        await new Promise((resolve, reject) => {
          script.onload = resolve
          script.onerror = reject
        })
      }

      const { jsPDF } = window.jspdf
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.width
      const pageHeight = doc.internal.pageSize.height
      let currentY = 20

      // Header
      doc.setFillColor(34, 139, 34)
      doc.rect(0, 0, pageWidth, 50, "F")

      doc.setTextColor(255, 255, 255)
      doc.setFontSize(28)
      doc.setFont("helvetica", "bold")
      doc.text("🌾 SmartKheti Analytics Report", 20, 25)

      doc.setFontSize(12)
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 40)

      currentY = 70

      // Executive Summary
      doc.setFillColor(248, 250, 252)
      doc.roundedRect(15, currentY, pageWidth - 30, 40, 5, 5, "F")
      doc.setDrawColor(34, 139, 34)
      doc.setLineWidth(2)
      doc.roundedRect(15, currentY, pageWidth - 30, 40, 5, 5, "S")

      doc.setTextColor(34, 139, 34)
      doc.setFontSize(18)
      doc.setFont("helvetica", "bold")
      doc.text("Executive Summary", 25, currentY + 15)

      doc.setTextColor(0, 0, 0)
      doc.setFontSize(12)
      doc.setFont("helvetica", "normal")
      const summaryText = `Total detections: ${analytics.totalDetections}, Healthy: ${analytics.healthPercentage}%, Diseased: ${analytics.diseasePercentage}%`
      doc.text(summaryText, 25, currentY + 25)

      if (dateRange.useRange && dateRange.startDate && dateRange.endDate) {
        doc.text(`Period: ${dateRange.startDate} to ${dateRange.endDate}`, 25, currentY + 35)
      } else {
        doc.text("Period: All Time Data", 25, currentY + 35)
      }

      currentY += 60

      // Recent Detections Table
      if (analytics.recentDetections.length > 0) {
        if (currentY > pageHeight - 100) {
          doc.addPage()
          currentY = 20
        }

        doc.setFontSize(16)
        doc.setFont("helvetica", "bold")
        doc.setTextColor(108, 117, 125)
        doc.text("Recent Detections", 20, currentY)
        currentY += 15

        const tableColumn = ["Date & Time", "Disease Detected", "Status"]
        const tableRows = []

        analytics.recentDetections.slice(0, 10).forEach((detection) => {
          const statusText = detection.detected_disease.toLowerCase().includes("healthy")
            ? "Healthy"
            : "Disease Detected"
          tableRows.push([formatDate(detection.detected_at), detection.detected_disease.replace(/_/g, " "), statusText])
        })

        doc.autoTable({
          startY: currentY,
          head: [tableColumn],
          body: tableRows,
          theme: "grid",
          headStyles: { fillColor: [34, 139, 34], textColor: [255, 255, 255], fontStyle: "bold" },
          styles: { fontSize: 9, cellPadding: 3, overflow: "linebreak" },
          columnStyles: { 0: { cellWidth: 50 }, 1: { cellWidth: 70 }, 2: { cellWidth: 40 } },
          didDrawPage: (data) => {
            // Footer
            doc.setFontSize(10)
            doc.setTextColor(150)
            doc.text(`Page ${doc.internal.getNumberOfPages()}`, pageWidth / 2, pageHeight - 10, { align: "center" })
          },
        })
        currentY = doc.autoTable.previous.finalY + 20
      }

      // Save PDF
      const fileName =
        dateRange.useRange && dateRange.startDate && dateRange.endDate
          ? `SmartKheti_Analytics_${dateRange.startDate}_to_${dateRange.endDate}.pdf`
          : `SmartKheti_Analytics_${new Date().toISOString().split("T")[0]}.pdf`

      doc.save(fileName)
      alert("PDF report generated successfully!")
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert(`Error generating PDF: ${error.message}`)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getDiseaseStatusColor = (disease) => {
    const lowerDisease = disease.toLowerCase()
    if (lowerDisease.includes("healthy") || lowerDisease.includes("normal") || lowerDisease.includes("good")) {
      return "text-green-600 bg-green-100"
    }
    return "text-red-600 bg-red-100"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50">
      {/* Back Button */}
      <Link
        to="/"
        className="fixed top-6 left-6 z-10 flex items-center gap-2 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 hover:text-green-600 px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border border-gray-200"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Home
      </Link>

      {/* Header */}
      <div className="bg-gradient-to-r from-green-800 to-emerald-800 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <div className="flex justify-center items-center gap-3 mb-4">
              <img src="/sklogo.png" alt="Rice Crop" className="w-10 h-10 object-contain" />
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight text-center">
                SmartKheti Analytics Dashboard
              </h1>
            </div>
            <p className="text-xl text-green-100 max-w-3xl mx-auto">
              Comprehensive crop disease detection analytics and reporting system
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        {/* Date Range Filter */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <span className="text-3xl">📅</span>
            Report Configuration
          </h2>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dateRange.useRange}
                  onChange={(e) => handleDateRangeChange("useRange", e.target.checked)}
                  className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                />
                <span className="text-lg font-medium text-gray-700">Use Custom Date Range</span>
              </label>
            </div>
            {dateRange.useRange && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50 rounded-xl">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => handleDateRangeChange("startDate", e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => handleDateRangeChange("endDate", e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <button
                    onClick={applyDateFilter}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 hover:scale-105"
                  >
                    <span>🔄</span>
                    Apply Date Filter
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
            <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Loading detection data...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-2xl font-bold text-red-700 mb-2">Error Loading Data</h3>
            <p className="text-red-600 mb-6">{error}</p>
            <button
              onClick={fetchDetectionData}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
            >
              Try Again
            </button>
          </div>
        ) : analytics.totalDetections === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
            <div className="text-8xl mb-6 animate-bounce">📊</div>
            <h3 className="text-3xl font-bold text-gray-700 mb-4">No Detection Data Available</h3>
            <p className="text-gray-500 mb-8 text-lg max-w-2xl mx-auto">
              No crop disease detections have been performed yet. Start using the disease detection feature to generate
              analytics and reports.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Total Detections</p>
                    <p className="text-3xl font-bold">{analytics.totalDetections}</p>
                  </div>
                  <div className="text-4xl">🔬</div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Healthy Crops</p>
                    <p className="text-3xl font-bold">{analytics.healthyCount}</p>
                    <p className="text-blue-200 text-sm">{analytics.healthPercentage}%</p>
                  </div>
                  <div className="text-4xl">🌱</div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm font-medium">Diseased Crops</p>
                    <p className="text-3xl font-bold">{analytics.diseasedCount}</p>
                    <p className="text-red-200 text-sm">{analytics.diseasePercentage}%</p>
                  </div>
                  <div className="text-4xl">🦠</div>
                </div>
              </div>
            </div>

            {/* Common Diseases */}
            {analytics.commonDiseases.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <span className="text-3xl">🦠</span>
                  Most Common Diseases
                </h3>
                <div className="space-y-4">
                  {analytics.commonDiseases.slice(0, 8).map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <span className="font-medium text-gray-700">{item.disease.replace(/_/g, " ")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
                          {item.count} cases
                        </span>
                        <span className="text-gray-500 text-sm">
                          {((item.count / analytics.totalDetections) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Crop Types */}
            {analytics.cropTypes.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <span className="text-3xl">🌾</span>
                  Crop Distribution
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analytics.cropTypes.slice(0, 6).map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
                    >
                      <span className="font-medium text-gray-700">{item.crop}</span>
                      <div className="flex items-center gap-2">
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                          {item.count}
                        </span>
                        <span className="text-gray-500 text-sm">
                          {((item.count / analytics.totalDetections) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Detections */}
            {analytics.recentDetections.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <span className="text-3xl">📋</span>
                  Recent Detections
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Date & Time</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Disease Detected</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.recentDetections.slice(0, 15).map((detection, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm text-gray-600">{formatDate(detection.detected_at)}</td>
                          <td className="py-3 px-4 text-sm text-gray-800 font-medium">
                            {detection.detected_disease.replace(/_/g, " ")}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${getDiseaseStatusColor(detection.detected_disease)}`}
                            >
                              {detection.detected_disease.toLowerCase().includes("healthy")
                                ? "Healthy"
                                : "Disease Detected"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Daily Trends */}
            {analytics.dailyTrends.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <span className="text-3xl">📊</span>
                  Daily Detection Trends (Last 30 Days)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {analytics.dailyTrends.slice(-12).map((day, index) => (
                    <div key={index} className="bg-gray-50 rounded-xl p-4">
                      <div className="text-center mb-2">
                        <span className="font-semibold text-gray-800 text-sm">{day.day}</span>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-blue-600">{day.total}</div>
                        <div className="text-xs text-gray-600">Total Detections</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div className="text-center">
                          <div className="text-sm font-bold text-green-600">{day.healthy}</div>
                          <div className="text-xs text-gray-600">Healthy</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-bold text-red-600">{day.diseased}</div>
                          <div className="text-xs text-gray-600">Diseased</div>
                        </div>
                      </div>
                      <div className="mt-2 bg-gray-200 rounded-full h-1">
                        <div
                          className="bg-green-500 h-1 rounded-full transition-all duration-300"
                          style={{ width: `${day.healthPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Detection Activity Heatmap */}
            {analytics.detectionHeatmap.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <span className="text-3xl">🔥</span>
                  Detection Activity Overview
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-blue-800 mb-4">Peak Detection Days</h4>
                    <div className="space-y-3">
                      {Object.entries(
                        analytics.detectionHeatmap.reduce((acc, item) => {
                          acc[item.date] = (acc[item.date] || 0) + 1
                          return acc
                        }, {}),
                      )
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 5)
                        .map(([date, count], index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="text-sm text-gray-700">{new Date(date).toLocaleDateString()}</span>
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">
                              {count} detections
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Monthly Trends */}
            {analytics.monthlyTrends.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <span className="text-3xl">📈</span>
                  Monthly Trends
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analytics.monthlyTrends.slice(-6).map((month, index) => (
                    <div key={index} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-800">{month.month}</span>
                        <span className="text-sm text-gray-600">Total: {month.total}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{month.healthy}</div>
                          <div className="text-sm text-gray-600">Healthy ({month.healthPercentage}%)</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">{month.diseased}</div>
                          <div className="text-sm text-gray-600">
                            Diseased ({(100 - Number.parseFloat(month.healthPercentage)).toFixed(1)}%)
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${month.healthPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Generate Report Button */}
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-gray-100">
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Generate Detailed PDF Report</h3>
              <p className="text-gray-600 mb-6">Download a comprehensive PDF report with all analytics and insights</p>
              <button
                onClick={generatePDF}
                className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center justify-center gap-3 mx-auto"
              >
                <span className="text-2xl">📊</span>
                Generate PDF Report
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6 mt-12">
        <div className="container mx-auto px-6 text-center">
          <p>&copy; 2024 SmartKheti. All rights reserved.</p>
          <p className="text-sm text-gray-400">Powered by AI for healthier agriculture.</p>
        </div>
      </footer>
    </div>
  )
}

export default Report
