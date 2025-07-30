"use client"

import { useState, useEffect } from "react"
import { apiCall } from "../../common/api" // Import your existing API utility

const DetectionAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDetectionHistory()
  }, [])

  const fetchDetectionHistory = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Use your existing apiCall function which handles token automatically
      const response = await apiCall("/disease_detection/detection-history/")
      
      console.log("API Response received:", response.data.length, "records")
      
      const analytics = processAnalyticsData(response.data)
      setAnalyticsData(analytics)
      
    } catch (error) {
      console.error("Error fetching detection history:", error)
      
      // Enhanced error handling
      let errorMessage = error.message
      
      if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        errorMessage = "Authentication error - please log in again"
      } else if (errorMessage.includes('403')) {
        errorMessage = "Permission denied - you don't have access to this data"
      } else if (errorMessage.includes('404')) {
        errorMessage = "API endpoint not found - check if the detection history endpoint exists"
      } else if (errorMessage.includes('500')) {
        errorMessage = "Server error - please try again later"
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const processAnalyticsData = (detections) => {
    console.log("Raw detection data:", detections)
    
    if (!detections || !Array.isArray(detections) || detections.length === 0) {
      return {
        totalDetections: 0,
        healthyCount: 0,
        diseasedCount: 0,
        healthyPercentage: 0,
        diseasedPercentage: 0,
        monthlyTrends: [],
        weeklyHealth: [],
        commonDiseases: [],
        healthTrend: "stable",
        insights: [],
      }
    }

    console.log("Processing", detections.length, "detection records")

    // Map the API data to the expected format
    const validDetections = detections.filter(detection => {
      return detection && detection.detected_at && detection.detected_disease
    }).map(detection => {
      // Determine if the crop is healthy
      const isHealthy = detection.detected_disease.toLowerCase().includes('healthy')
      
      // Clean up disease name for display
      let diseaseName = detection.detected_disease
        .replace(/([A-Z])/g, ' $1') // Add spaces before capital letters
        .replace(/_/g, ' ') // Replace underscores with spaces
        .trim() // Remove leading/trailing spaces
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      
      return {
        id: detection.id,
        created_at: detection.detected_at, // Map detected_at to created_at
        is_healthy: isHealthy,
        disease_name: diseaseName,
        detected_disease: detection.detected_disease // Keep original for reference
      }
    })

    console.log("Processed detections:", validDetections)
    console.log("Sample processed detection:", validDetections[0])

    if (validDetections.length === 0) {
      return {
        totalDetections: 0,
        healthyCount: 0,
        diseasedCount: 0,
        healthyPercentage: 0,
        diseasedPercentage: 0,
        monthlyTrends: [],
        weeklyHealth: [],
        commonDiseases: [],
        healthTrend: "stable",
        insights: [],
      }
    }

    const total = validDetections.length
    const healthy = validDetections.filter((d) => d.is_healthy || d.disease_name === "Healthy").length
    const diseased = total - healthy

    // Monthly trends - FIXED: Use current month and go backwards
    const monthlyData = {}
    const now = new Date()
    
    console.log("=== MONTHLY DEBUG START ===")
    console.log("Current date:", now.toISOString())
    console.log("Current month (0-based):", now.getMonth(), "Current year:", now.getFullYear())
    console.log("Current month name:", now.toLocaleDateString("en-US", { month: "long", year: "numeric" }))

    // Create containers for the last 6 months including current month
    // If current month is July (6), then i goes from 5 to 0
    // 5: July-5 = February, 4: July-4 = March, ..., 0: July-0 = July
    for (let i = 5; i >= 0; i--) {
      const targetMonth = now.getMonth() - i
      const targetYear = now.getFullYear()
      
      // Handle year rollover if month goes negative
      let adjustedYear = targetYear
      let adjustedMonth = targetMonth
      if (targetMonth < 0) {
        adjustedYear = targetYear - 1
        adjustedMonth = 12 + targetMonth
      }
      
      const date = new Date(adjustedYear, adjustedMonth, 1)
      const monthKey = `${adjustedYear}-${String(adjustedMonth + 1).padStart(2, '0')}` // Format: "2025-07"
      monthlyData[monthKey] = { healthy: 0, diseased: 0, total: 0 }
      console.log(`Month container ${6-i}: Month=${adjustedMonth}, Year=${adjustedYear}, Key=${monthKey}, Name=${date.toLocaleDateString("en-US", { month: "short", year: "numeric" })}`)
    }

    console.log("Created monthly containers:", Object.keys(monthlyData))
    console.log("Sample detection dates from API:")
    validDetections.slice(0, 3).forEach(d => {
      console.log(`- ${d.created_at}`)
    })

    console.log("Monthly data containers (fixed):", Object.keys(monthlyData))

    validDetections.forEach((detection, index) => {
      try {
        // Parse the date properly - handle the timezone offset
        const detectionDateStr = detection.created_at
        const detectionDate = new Date(detectionDateStr)
        
        // Get the month key in the same format
        const monthKey = detectionDate.toISOString().slice(0, 7) // Format: "2025-07"
        
        console.log(`Processing detection ${index + 1}:`)
        console.log(`- Original: ${detectionDateStr}`)
        console.log(`- Parsed: ${detectionDate.toISOString()}`)
        console.log(`- Month key: ${monthKey}`)
        console.log(`- Month exists in containers: ${monthlyData[monthKey] ? 'YES' : 'NO'}`)
        
        if (monthlyData[monthKey]) {
          monthlyData[monthKey].total++
          if (detection.is_healthy) {
            monthlyData[monthKey].healthy++
          } else {
            monthlyData[monthKey].diseased++
          }
          console.log(`- Updated month ${monthKey}:`, monthlyData[monthKey])
        } else {
          console.log(`- Detection outside 6-month window: ${monthKey}`)
          console.log(`- Available containers:`, Object.keys(monthlyData))
        }
      } catch (error) {
        console.warn("Error processing detection date:", detection, error)
      }
    })

    console.log("=== FINAL MONTHLY DATA ===")
    Object.entries(monthlyData).forEach(([key, data]) => {
      const date = new Date(key + "-01")
      console.log(`${key} (${date.toLocaleDateString("en-US", { month: "short", year: "numeric" })}):`, data)
    })
    console.log("=== MONTHLY DEBUG END ===")

    const monthlyTrends = Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b)) // Sort by date string to ensure proper order
      .map(([month, data]) => {
        const date = new Date(month + "-01")
        const monthName = date.toLocaleDateString("en-US", { month: "short", year: "numeric" })
        console.log(`Month mapping: ${month} -> ${monthName}`)
        return {
          month: monthName,
          healthy: data.healthy,
          diseased: data.diseased,
          total: data.total,
          healthPercentage: data.total > 0 ? Math.round((data.healthy / data.total) * 100) : 0,
        }
      })

    console.log("Monthly trends (fixed):", monthlyTrends)

    // Weekly health data - FIXED: Calculate proper week boundaries
    const weeklyData = []
    const currentDate = new Date()
    
    // Start from current week and go back 4 weeks
    for (let i = 3; i >= 0; i--) {
      // Calculate the start of each week (assuming weeks start on Sunday)
      const weekStartDate = new Date(currentDate)
      weekStartDate.setDate(currentDate.getDate() - (i * 7) - currentDate.getDay())
      weekStartDate.setHours(0, 0, 0, 0)
      
      const weekEndDate = new Date(weekStartDate)
      weekEndDate.setDate(weekStartDate.getDate() + 6)
      weekEndDate.setHours(23, 59, 59, 999)

      console.log(`Week ${4-i}: ${weekStartDate.toISOString()} to ${weekEndDate.toISOString()}`)

      const weekDetections = validDetections.filter((d) => {
        try {
          const detectionDate = new Date(d.created_at)
          const isInWeek = detectionDate >= weekStartDate && detectionDate <= weekEndDate
          if (isInWeek) {
            console.log(`Detection ${d.id} (${d.created_at}) is in week ${4-i}`)
          }
          return isInWeek
        } catch (error) {
          console.warn("Error parsing detection date:", d.created_at, error)
          return false
        }
      })

      const weekHealthy = weekDetections.filter((d) => d.is_healthy).length
      const weekTotal = weekDetections.length

      console.log(`Week ${4-i} results: ${weekTotal} total, ${weekHealthy} healthy`)

      weeklyData.push({
        week: `Week ${4 - i}`,
        percentage: weekTotal > 0 ? Math.round((weekHealthy / weekTotal) * 100) : 0,
        total: weekTotal,
        healthy: weekHealthy,
        diseased: weekTotal - weekHealthy
      })
    }

    console.log("Weekly data (fixed):", weeklyData)

    // Common diseases
    const diseaseCount = {}
    validDetections.forEach((detection) => {
      if (!detection.is_healthy && detection.disease_name) {
        // Group similar diseases together
        let groupedName = detection.disease_name
        
        // Group similar diseases
        if (groupedName.toLowerCase().includes('leaf spot') || groupedName.toLowerCase().includes('septoria')) {
          groupedName = 'Leaf Spot Diseases'
        } else if (groupedName.toLowerCase().includes('blight')) {
          groupedName = 'Blight Diseases'
        } else if (groupedName.toLowerCase().includes('bacterial') && groupedName.toLowerCase().includes('soft rot')) {
          groupedName = 'Bacterial Soft Rot'
        }
        
        diseaseCount[groupedName] = (diseaseCount[groupedName] || 0) + 1
      }
    })

    const commonDiseases = Object.entries(diseaseCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([disease, count]) => ({
        name: disease,
        count,
        percentage: diseased > 0 ? Math.round((count / diseased) * 100) : 0,
      }))

    // Health trend analysis
    const recentDetections = validDetections.slice(-10)
    const recentHealthy = recentDetections.filter((d) => d.is_healthy).length
    const recentHealthPercentage = recentDetections.length > 0 ? (recentHealthy / recentDetections.length) * 100 : 0
    const overallHealthPercentage = (healthy / total) * 100

    let healthTrend = "stable"
    if (recentHealthPercentage > overallHealthPercentage + 10) {
      healthTrend = "improving"
    } else if (recentHealthPercentage < overallHealthPercentage - 10) {
      healthTrend = "declining"
    }

    // Generate insights
    const insights = []
    if (healthTrend === "improving") {
      insights.push("🎉 Great news! Your crop health is improving over time.")
    } else if (healthTrend === "declining") {
      insights.push("⚠️ Attention needed: Recent detections show declining health trends.")
    }

    if (commonDiseases.length > 0) {
      insights.push(`🔍 Most common issue: ${commonDiseases[0].name} (${commonDiseases[0].count} cases)`)
    }

    if (total > 0) {
      insights.push(`📊 You've performed ${total} health checks this period.`)
    }

    // Add weekly insight if there's recent activity
    const recentWeekTotal = weeklyData[weeklyData.length - 1]?.total || 0
    if (recentWeekTotal > 0) {
      const recentWeekHealth = weeklyData[weeklyData.length - 1]?.percentage || 0
      insights.push(`📈 This week: ${recentWeekTotal} checks with ${recentWeekHealth}% healthy rate.`)
    }

    return {
      totalDetections: total,
      healthyCount: healthy,
      diseasedCount: diseased,
      healthyPercentage: Math.round((healthy / total) * 100) || 0,
      diseasedPercentage: Math.round((diseased / total) * 100) || 0,
      monthlyTrends,
      weeklyHealth: weeklyData,
      commonDiseases,
      healthTrend,
      insights,
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-bold text-red-600 mb-2">Error Loading Analytics</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={fetchDetectionHistory}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Retry
        </button>
        
        {/* Debug info */}
        <div className="mt-6 bg-gray-50 rounded-lg p-4 text-left text-sm">
          <p><strong>Debug Info:</strong></p>
          <p>• Token exists: {typeof window !== 'undefined' && localStorage.getItem("access_token") ? "Yes" : "No"}</p>
          <p>• API Base URL: http://localhost:8000/api</p>
          <p>• Endpoint: /disease_detection/detection-history/</p>
          <p>• User authenticated: {typeof window !== 'undefined' && localStorage.getItem("access_token") ? "Yes" : "No"}</p>
          <p>• Error details: {error}</p>
          
          <div className="mt-2 pt-2 border-t border-gray-200">
            <p className="font-semibold">Common solutions:</p>
            <ul className="text-xs mt-1 space-y-1">
              <li>• Check browser console for detailed error logs</li>
              <li>• Verify the API endpoint returns valid data structure</li>
              <li>• Make sure 'detected_at' field exists in detection records</li>
              <li>• Check if Django server is returning the expected data format</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  if (!analyticsData || analyticsData.totalDetections === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-2xl font-bold text-gray-700 mb-2">No Detection Data</h3>
        <p className="text-gray-500 mb-6">Start using disease detection to see your analytics here!</p>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-green-700 font-medium">
            💡 Tip: Use the Disease Detection feature to analyze your crops and track health trends over time.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl shadow-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
          <span className="text-3xl">📊</span>
          Crop Health Analytics
        </h2>
        <p className="text-green-100">Insights from your disease detection history</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Detections</p>
              <p className="text-3xl font-bold">{analyticsData.totalDetections}</p>
            </div>
            <div className="text-4xl opacity-80">🔍</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Healthy Crops</p>
              <p className="text-3xl font-bold">{analyticsData.healthyCount}</p>
              <p className="text-green-100 text-xs">{analyticsData.healthyPercentage}% of total</p>
            </div>
            <div className="text-4xl opacity-80">✅</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Issues Detected</p>
              <p className="text-3xl font-bold">{analyticsData.diseasedCount}</p>
              <p className="text-red-100 text-xs">{analyticsData.diseasedPercentage}% of total</p>
            </div>
            <div className="text-4xl opacity-80">⚠️</div>
          </div>
        </div>
      </div>

      {/* Health Trend Indicator */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">📈</span>
          Health Trend
        </h3>
        <div className="flex items-center gap-4">
          <div
            className={`px-4 py-2 rounded-full font-semibold ${
              analyticsData.healthTrend === "improving"
                ? "bg-green-100 text-green-800"
                : analyticsData.healthTrend === "declining"
                  ? "bg-red-100 text-red-800"
                  : "bg-gray-100 text-gray-800"
            }`}
          >
            {analyticsData.healthTrend === "improving"
              ? "📈 Improving"
              : analyticsData.healthTrend === "declining"
                ? "📉 Declining"
                : "➡️ Stable"}
          </div>
          <p className="text-gray-600">Based on recent detection patterns</p>
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span className="text-2xl">📅</span>
          Monthly Health Trends (Last 6 Months)
        </h3>
        <div className="space-y-4">
          {analyticsData.monthlyTrends.map((month, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="w-16 text-sm font-medium text-gray-600">{month.month}</div>
              <div className="flex-1 bg-gray-200 rounded-full h-4 relative overflow-hidden">
                <div
                  className="bg-gradient-to-r from-green-400 to-green-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${month.healthPercentage}%` }}
                ></div>
              </div>
              <div className="w-16 text-sm font-medium text-gray-800">{month.healthPercentage}%</div>
              <div className="w-20 text-xs text-gray-500">({month.total} checks)</div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Health & Common Diseases */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Health */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="text-2xl">📊</span>
            Weekly Health % (Last 4 Weeks)
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {analyticsData.weeklyHealth.map((week, index) => (
              <div key={index} className="text-center">
                <div className="relative w-20 h-20 mx-auto mb-2">
                  <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="2"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2"
                      strokeDasharray={`${week.percentage}, 100`}
                      className="transition-all duration-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-800">{week.percentage}%</span>
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-600">{week.week}</p>
                <p className="text-xs text-gray-400">({week.total} checks)</p>
              </div>
            ))}
          </div>
        </div>

        {/* Common Diseases */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="text-2xl">🦠</span>
            Common Issues
          </h3>
          {analyticsData.commonDiseases.length > 0 ? (
            <div className="space-y-4">
              {analyticsData.commonDiseases.map((disease, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{disease.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-red-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${disease.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{disease.count} cases</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🎉</div>
              <p className="text-gray-500">No diseases detected!</p>
              <p className="text-sm text-green-600 font-medium">Your crops are healthy!</p>
            </div>
          )}
        </div>
      </div>

      {/* Insights */}
      {analyticsData.insights.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl shadow-lg p-6 border border-purple-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">💡</span>
            Smart Insights
          </h3>
          <div className="space-y-3">
            {analyticsData.insights.map((insight, index) => (
              <div key={index} className="bg-white rounded-lg p-4 border border-purple-100">
                <p className="text-gray-700">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default DetectionAnalytics