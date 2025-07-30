import { useState, useEffect } from "react"

const ReportGenerator = () => {
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
  })

  useEffect(() => {
    fetchDetectionData()
  }, [])

  const fetchDetectionData = async () => {
    setLoading(true)
    setError("")
    
    // Using mock data for demo since API might not be available
    setTimeout(() => {
      const mockData = [
        {
          id: 1,
          detected_disease: "Tomato Late Blight",
          detected_at: "2024-01-15T10:30:00Z",
          confidence: 0.92
        },
        {
          id: 2,
          detected_disease: "Potato Healthy",
          detected_at: "2024-01-16T14:20:00Z",
          confidence: 0.88
        },
        {
          id: 3,
          detected_disease: "Corn Common Rust",
          detected_at: "2024-01-17T09:15:00Z",
          confidence: 0.85
        },
        {
          id: 4,
          detected_disease: "Rice Healthy",
          detected_at: "2024-01-18T11:45:00Z",
          confidence: 0.90
        },
        {
          id: 5,
          detected_disease: "Wheat Leaf Rust",
          detected_at: "2024-01-19T16:30:00Z",
          confidence: 0.87
        },
        {
          id: 6,
          detected_disease: "Tomato Healthy",
          detected_at: "2024-01-20T08:15:00Z",
          confidence: 0.94
        },
        {
          id: 7,
          detected_disease: "Potato Late Blight",
          detected_at: "2024-01-21T13:22:00Z",
          confidence: 0.89
        },
        {
          id: 8,
          detected_disease: "Corn Healthy",
          detected_at: "2024-01-22T15:45:00Z",
          confidence: 0.91
        }
      ]
      setDetectionData(mockData)
      processAnalytics(mockData)
      setLoading(false)
    }, 1000)
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
    const healthyCount = filteredData.filter((item) => item.detected_disease.toLowerCase().includes("healthy")).length
    const diseasedCount = totalDetections - healthyCount

    // Extract crop types and diseases
    const diseaseCount = {}
    const cropCount = {}
    const monthlyData = {}

    filteredData.forEach((item) => {
      // Clean disease name
      const disease = item.detected_disease.replace(/^\d+\s*/, "").trim()
      diseaseCount[disease] = (diseaseCount[disease] || 0) + 1

      // Extract crop type
      const cropType = disease.split(" ")[0]
      cropCount[cropType] = (cropCount[cropType] || 0) + 1

      // Monthly trends
      const month = new Date(item.detected_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      })
      if (!monthlyData[month]) {
        monthlyData[month] = { total: 0, healthy: 0, diseased: 0 }
      }
      monthlyData[month].total++
      if (disease.toLowerCase().includes("healthy")) {
        monthlyData[month].healthy++
      } else {
        monthlyData[month].diseased++
      }
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
        healthPercentage: ((data.healthy / data.total) * 100).toFixed(1),
      }))
      .sort((a, b) => new Date(a.month) - new Date(b.month))

    setAnalytics({
      totalDetections,
      healthyCount,
      diseasedCount,
      healthPercentage: totalDetections > 0 ? ((healthyCount / totalDetections) * 100).toFixed(1) : 0,
      diseasePercentage: totalDetections > 0 ? ((diseasedCount / totalDetections) * 100).toFixed(1) : 0,
      commonDiseases,
      cropTypes,
      monthlyTrends,
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
      console.log("Starting PDF generation...")
      
      if (analytics.totalDetections === 0) {
        alert("No data available to generate report")
        return
      }

      // Dynamically import jsPDF
      const { default: jsPDF } = await import('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js')
      await import('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js')

      const doc = new jsPDF.jsPDF()
      const pageWidth = doc.internal.pageSize.width
      const pageHeight = doc.internal.pageSize.height

      // Header
      doc.setFillColor(34, 139, 34)
      doc.rect(0, 0, pageWidth, 40, "F")

      doc.setTextColor(255, 255, 255)
      doc.setFontSize(24)
      doc.setFont("helvetica", "bold")
      doc.text("SmartKheti", 20, 25)

      doc.setFontSize(14)
      doc.setFont("helvetica", "normal")
      doc.text("Crop Disease Detection Analytics Report", 20, 35)

      // Report Info
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(12)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 55)

      if (dateRange.useRange && dateRange.startDate && dateRange.endDate) {
        doc.text(`Date Range: ${dateRange.startDate} to ${dateRange.endDate}`, 20, 65)
      } else {
        doc.text("Date Range: All Time", 20, 65)
      }

      // Summary Statistics
      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.text("Summary Statistics", 20, 85)

      const summaryData = [
        ["Total Detections", analytics.totalDetections.toString()],
        ["Healthy Crops", `${analytics.healthyCount} (${analytics.healthPercentage}%)`],
        ["Diseased Crops", `${analytics.diseasedCount} (${analytics.diseasePercentage}%)`],
      ]

      doc.autoTable({
        startY: 95,
        head: [["Metric", "Value"]],
        body: summaryData,
        theme: "grid",
        headStyles: { fillColor: [34, 139, 34], textColor: [255, 255, 255] },
        styles: { fontSize: 11 },
      })

      // Common Diseases
      let currentY = doc.lastAutoTable.finalY + 20

      if (currentY > pageHeight - 60) {
        doc.addPage()
        currentY = 20
      }

      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.text("Most Common Diseases", 20, currentY)

      if (analytics.commonDiseases.length > 0) {
        const diseaseData = analytics.commonDiseases
          .slice(0, 8)
          .map((item) => [
            item.disease.replace(/_/g, " "),
            item.count.toString(),
            `${((item.count / analytics.totalDetections) * 100).toFixed(1)}%`,
          ])

        doc.autoTable({
          startY: currentY + 10,
          head: [["Disease", "Count", "Percentage"]],
          body: diseaseData,
          theme: "grid",
          headStyles: { fillColor: [220, 53, 69], textColor: [255, 255, 255] },
          styles: { fontSize: 10 },
        })
      }

      // Crop Types
      currentY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : currentY + 40

      if (currentY > pageHeight - 60) {
        doc.addPage()
        currentY = 20
      }

      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.text("Crop Distribution", 20, currentY)

      if (analytics.cropTypes.length > 0) {
        const cropData = analytics.cropTypes
          .slice(0, 8)
          .map((item) => [
            item.crop,
            item.count.toString(),
            `${((item.count / analytics.totalDetections) * 100).toFixed(1)}%`,
          ])

        doc.autoTable({
          startY: currentY + 10,
          head: [["Crop Type", "Detections", "Percentage"]],
          body: cropData,
          theme: "grid",
          headStyles: { fillColor: [40, 167, 69], textColor: [255, 255, 255] },
          styles: { fontSize: 10 },
        })
      }

      // Monthly Trends
      if (analytics.monthlyTrends.length > 0) {
        currentY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : currentY + 40

        if (currentY > pageHeight - 60) {
          doc.addPage()
          currentY = 20
        }

        doc.setFontSize(16)
        doc.setFont("helvetica", "bold")
        doc.text("Monthly Trends", 20, currentY)

        const trendData = analytics.monthlyTrends.map((item) => [
          item.month,
          item.total.toString(),
          item.healthy.toString(),
          item.diseased.toString(),
          `${item.healthPercentage}%`,
        ])

        doc.autoTable({
          startY: currentY + 10,
          head: [["Month", "Total", "Healthy", "Diseased", "Health %"]],
          body: trendData,
          theme: "grid",
          headStyles: { fillColor: [23, 162, 184], textColor: [255, 255, 255] },
          styles: { fontSize: 9 },
        })
      }

      // Footer
      const totalPages = doc.internal.getNumberOfPages()
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)
        doc.setFontSize(10)
        doc.setTextColor(128, 128, 128)
        doc.text(`SmartKheti Analytics Report - Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, {
          align: "center",
        })
      }

      // Save the PDF
      const fileName = dateRange.useRange && dateRange.startDate && dateRange.endDate
        ? `SmartKheti_Report_${dateRange.startDate}_to_${dateRange.endDate}.pdf`
        : `SmartKheti_Report_AllTime_${new Date().toISOString().split("T")[0]}.pdf`

      console.log("Saving PDF...")
      doc.save(fileName)
      console.log("PDF saved successfully!")

    } catch (error) {
      console.error("Error generating PDF:", error)
      alert(`Error generating PDF: ${error.message}. Please try again.`)
    }
  }

  const goBackHome = () => {
    alert("In your actual app, this would navigate back to home using React Router")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-800 to-emerald-800 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <h1 className="text-4xl lg:text-5xl font-bold mb-4">📊 SmartKheti Analytics</h1>
              <p className="text-xl text-green-100 max-w-3xl mx-auto">
                Generate comprehensive reports from crop disease detection data across Nepal
              </p>
            </div>
            <button 
              onClick={goBackHome}
              className="bg-white text-green-800 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        {/* Date Range Selection */}
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
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2"
                  >
                    <span>🔄</span>
                    Apply Date Filter
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Analytics Preview */}
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
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Total Detections</p>
                    <p className="text-3xl font-bold">{analytics.totalDetections}</p>
                  </div>
                  <div className="text-4xl">🔬</div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Healthy Crops</p>
                    <p className="text-3xl font-bold">{analytics.healthyCount}</p>
                    <p className="text-blue-200 text-sm">{analytics.healthPercentage}%</p>
                  </div>
                  <div className="text-4xl">🌱</div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-2xl p-6 shadow-lg">
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
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <span className="text-3xl">🦠</span>
                Most Common Diseases
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analytics.commonDiseases.slice(0, 8).map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <span className="font-medium text-gray-700">{item.disease.replace(/_/g, " ")}</span>
                    <div className="flex items-center gap-2">
                      <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
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

            {/* Generate Report Button */}
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-gray-100">
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Generate PDF Report</h3>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                Download a comprehensive PDF report with detailed analytics, charts, and insights from the crop disease
                detection data.
              </p>
              <button
                onClick={generatePDF}
                disabled={analytics.totalDetections === 0}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-12 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:cursor-not-allowed disabled:transform-none flex items-center gap-3 mx-auto"
              >
                <span className="text-2xl">📊</span>
                Generate PDF Report
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </button>
              {analytics.totalDetections === 0 && (
                <p className="text-red-500 text-sm mt-4">No data available to generate report</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ReportGenerator


