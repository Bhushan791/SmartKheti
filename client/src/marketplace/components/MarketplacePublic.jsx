"use client"

import { useState, useEffect } from "react"
import { marketplaceAPI } from "../api"
import ProductCard from "./ProductCard"
import ProductModal from "./ProductModal"

const EnhancedMarketplacePublic = () => {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedListing, setSelectedListing] = useState(null)
  const [message, setMessage] = useState("")
  const [categories] = useState(["All", "Vegetable", "Fruit", "Grain", "Spice"])
  const [selectedCategory, setSelectedCategory] = useState("All")

  useEffect(() => {
    fetchListings()
  }, [])

  const fetchListings = async () => {
    try {
      setLoading(true)
      const response = await marketplaceAPI.getAllListings()
      setListings(response.data || [])
    } catch (error) {
      console.error("Failed to fetch listings:", error)
      setMessage("Failed to load listings")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    try {
      setLoading(true)
      const response = await marketplaceAPI.getAllListings(searchQuery)
      setListings(response.data || [])
    } catch (error) {
      console.error("Search failed:", error)
      setMessage("Search failed")
    } finally {
      setLoading(false)
    }
  }

  const filteredListings = listings.filter((listing) => {
    if (selectedCategory === "All") return true
    return listing.category === selectedCategory
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-amber-50 to-emerald-50">
      {/* Background Decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-green-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-amber-200 rounded-full opacity-30 animate-bounce"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-emerald-200 rounded-full opacity-25 animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <header className="bg-white shadow-lg sticky top-0 z-40 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <div className="flex items-center gap-4">
              <a href="/" className="flex items-center gap-3 text-green-800 hover:text-green-700 transition-colors">
                <span className="text-3xl">🌾</span>
                <div>
                  <h1 className="text-xl lg:text-2xl font-bold">SmartKheti</h1>
                  <p className="text-sm text-gray-600 hidden sm:block">Agricultural Marketplace</p>
                </div>
              </a>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="/register"
                className="hidden sm:block bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
              >
                📝 Register
              </a>
              <a
                href="/login"
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
              >
                <span className="text-lg">🚜</span>
                <span className="hidden sm:inline">Continue as</span> Farmer
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="bg-white rounded-3xl shadow-lg p-6 lg:p-12 mb-8 border border-gray-100 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl lg:text-5xl font-bold text-green-800 mb-4">🛒 SmartKheti Marketplace</h1>
            <p className="text-lg lg:text-xl text-gray-600 mb-6">
              Discover fresh agricultural products directly from Nepali farmers
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="flex items-center gap-2 text-green-700">
                <span className="text-2xl">✅</span>
                <span className="font-medium">Direct from Farmers</span>
              </div>
              <div className="flex items-center gap-2 text-green-700">
                <span className="text-2xl">🌱</span>
                <span className="font-medium">Fresh & Organic</span>
              </div>
              <div className="flex items-center gap-2 text-green-700">
                <span className="text-2xl">💰</span>
                <span className="font-medium">Fair Prices</span>
              </div>
            </div>
          </div>
        </section>

        {/* Search and Filter Section */}
        <section className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search crops, location, or description... (e.g., rice, tomato, Kathmandu)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent hover:border-gray-300 transition-all duration-200"
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSearch}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  Search
                </button>
                <button
                  onClick={() => {
                    setSearchQuery("")
                    fetchListings()
                  }}
                  className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Filter by Category</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                      selectedCategory === category
                        ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg transform scale-105"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105"
                    }`}
                  >
                    {category === "All" ? "🌾 All" : `${getCategoryIcon(category)} ${category}`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Message */}
        {message && (
          <div className="bg-red-50 text-red-800 border border-red-200 p-4 rounded-xl mb-8">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-medium">{message}</span>
            </div>
          </div>
        )}

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {selectedCategory === "All" ? "All Products" : `${selectedCategory} Products`}
            <span className="text-lg text-gray-500 ml-2">({filteredListings.length} found)</span>
          </h2>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-lg text-gray-600">Loading fresh products...</p>
            </div>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
            <div className="text-6xl mb-4">🌾</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No products found</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery || selectedCategory !== "All"
                ? "Try adjusting your search terms or filters"
                : "Be the first farmer to list your crops!"}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  setSearchQuery("")
                  setSelectedCategory("All")
                  fetchListings()
                }}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
              >
                Clear Filters
              </button>
              <a
                href="/register"
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
              >
                Become a Seller
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {filteredListings.map((listing) => (
              <ProductCard key={listing.id} listing={listing} onClick={setSelectedListing} />
            ))}
          </div>
        )}

        {/* Call to Action */}
        <section className="bg-gradient-to-r from-green-800 via-green-700 to-emerald-800 text-white rounded-3xl p-8 lg:p-12 text-center shadow-2xl">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Are you a farmer?</h2>
            <p className="text-lg lg:text-xl mb-8 text-green-100">
              Join SmartKheti marketplace and start selling your crops directly to customers across Nepal
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/register"
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center justify-center gap-2"
              >
                <span className="text-xl">📝</span>
                Register as Farmer
              </a>
              <a
                href="/login"
                className="border-2 border-white text-white hover:bg-white hover:text-green-800 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <span className="text-xl">🔑</span>
                Login
              </a>
            </div>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="bg-white bg-opacity-10 rounded-xl p-6">
                <div className="text-3xl mb-2">🌱</div>
                <h3 className="font-bold mb-2">Grow Your Business</h3>
                <p className="text-green-100 text-sm">Reach thousands of customers</p>
              </div>
              <div className="bg-white bg-opacity-10 rounded-xl p-6">
                <div className="text-3xl mb-2">💰</div>
                <h3 className="font-bold mb-2">Fair Pricing</h3>
                <p className="text-green-100 text-sm">Set your own competitive prices</p>
              </div>
              <div className="bg-white bg-opacity-10 rounded-xl p-6">
                <div className="text-3xl mb-2">📱</div>
                <h3 className="font-bold mb-2">Easy to Use</h3>
                <p className="text-green-100 text-sm">Simple listing and management</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Product Modal */}
      {selectedListing && <ProductModal listing={selectedListing} onClose={() => setSelectedListing(null)} />}
    </div>
  )
}

// Helper function for category icons
const getCategoryIcon = (category) => {
  const icons = {
    Vegetable: "🥬",
    Fruit: "🍎",
    Grain: "🌾",
    Spice: "🌶️",
  }
  return icons[category] || "🌱"
}

export default EnhancedMarketplacePublic
