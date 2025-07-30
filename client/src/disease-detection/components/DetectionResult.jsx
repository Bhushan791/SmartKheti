"use client"

const DetectionResult = ({ result, image, onNewDetection }) => {
  const isHealthy = result.detected_disease === "Healthy"

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <span className="mr-2">🔬</span>
          Detection Results
        </h2>
      </div>

      <div className="p-6 space-y-8">
        {/* Result Summary */}
        <div className="text-center">
          <div
            className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
              isHealthy ? "bg-green-100" : "bg-red-100"
            }`}
          >
            <span className="text-4xl">{isHealthy ? "✅" : "⚠️"}</span>
          </div>
          <h3 className={`text-2xl font-bold mb-2 ${isHealthy ? "text-green-700" : "text-red-700"}`}>
            {isHealthy ? "Healthy Crop Detected!" : "Disease Detected"}
          </h3>
          <p className="text-lg text-gray-600">AI analysis completed for your crop image</p>
        </div>

        {/* Image and Basic Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="text-center">
            <h4 className="text-lg font-bold text-gray-900 mb-4">Analyzed Image</h4>
            <img
              src={image || "/placeholder.svg?height=300&width=400"}
              alt="Analyzed crop"
              className="w-full max-w-sm mx-auto rounded-xl border-2 border-gray-200 shadow-lg"
            />
          </div>

          <div className="space-y-6">
            <div
              className={`p-6 rounded-xl border-2 ${
                isHealthy ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
              }`}
            >
              <div className="text-center mb-4">
                <div className="text-5xl mb-3">{isHealthy ? "✅" : "⚠️"}</div>
                <h3 className={`text-xl font-bold mb-2 ${isHealthy ? "text-green-800" : "text-red-800"}`}>
                  {isHealthy ? "Healthy Crop!" : "Disease Detected"}
                </h3>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Crop Type:</span>
                  <span className="font-bold text-gray-900">{result.crop}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Status:</span>
                  <span className={`font-bold ${isHealthy ? "text-green-700" : "text-red-700"}`}>
                    {result.detected_disease}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Analysis Date:</span>
                  <span className="font-bold text-gray-900">{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h4 className="font-bold text-blue-800 mb-2 flex items-center">
                <span className="mr-2">📊</span>
                Detection Summary
              </h4>
              <p className="text-blue-700 text-sm">
                Our AI model has analyzed your crop image and provided detailed results below. Follow the
                recommendations for optimal crop health management.
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Information */}
        {isHealthy ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center">
              <span className="mr-2">🌱</span>
              Healthy Crop Maintenance
            </h3>
            <div className="bg-white rounded-lg p-4 mb-4">
              <p className="text-gray-700 leading-relaxed">{result.message}</p>
            </div>
            {result.recheck_advice && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-bold text-yellow-800 mb-2 flex items-center">
                  <span className="mr-2">💡</span>
                  Maintenance Tips
                </h4>
                <p className="text-yellow-700 leading-relaxed">{result.recheck_advice}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Short Remedy */}
            {result.short_remedy && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <h3 className="text-xl font-bold text-red-800 mb-4 flex items-center">
                  <span className="mr-2">🚨</span>
                  Immediate Action Required
                </h3>
                <div className="bg-white rounded-lg p-4">
                  <p className="text-gray-700 font-semibold leading-relaxed">{result.short_remedy}</p>
                </div>
              </div>
            )}

            {/* Detailed Treatment */}
            {result.treatment && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h3 className="text-xl font-bold text-blue-800 mb-4 flex items-center">
                  <span className="mr-2">💊</span>
                  Detailed Treatment Plan
                </h3>
                <div className="bg-white rounded-lg p-4">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">{result.treatment}</p>
                </div>
              </div>
            )}

            {/* Recommended Products */}
            {result.products && result.products.length > 0 && (
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                <h3 className="text-xl font-bold text-purple-800 mb-4 flex items-center">
                  <span className="mr-2">🛒</span>
                  Recommended Products
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.products.map((product, index) => (
                    <div key={index} className="bg-white rounded-lg p-4 flex items-center space-x-4 shadow-sm">
                      <img
                        src={product.image || "/placeholder.svg?height=60&width=60"}
                        alt={product.name}
                        className="w-15 h-15 object-cover rounded-lg border border-gray-200"
                      />
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 mb-1">{product.name}</h4>
                        <p className="text-sm text-gray-600">Recommended for {result.detected_disease} treatment</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recheck Advice */}
            {result.recheck_advice && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                <h3 className="text-xl font-bold text-orange-800 mb-4 flex items-center">
                  <span className="mr-2">🔄</span>
                  Follow-up Instructions
                </h3>
                <div className="bg-white rounded-lg p-4">
                  <p className="text-gray-700 leading-relaxed">{result.recheck_advice}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Unknown Disease */}
        {result.message && !isHealthy && !result.treatment && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">ℹ️</span>
              Additional Information
            </h3>
            <div className="bg-white rounded-lg p-4 mb-4">
              <p className="text-gray-700 leading-relaxed">{result.message}</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-700 text-sm flex items-start">
                <span className="mr-2 mt-0.5">💡</span>
                <span>
                  <strong>Tip:</strong> Consider consulting with a local agricultural expert for detailed guidance and
                  personalized treatment recommendations.
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="text-center pt-6 border-t border-gray-200">
          <button
            onClick={onNewDetection}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl shadow-lg hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105"
          >
            <span className="mr-2">🔬</span>
            Analyze Another Image
          </button>
          <p className="text-gray-600 mt-4 text-sm">
            Keep monitoring your crops regularly for early disease detection and better yields
          </p>
        </div>
      </div>
    </div>
  )
}

export default DetectionResult
