"use client"

import { useState, useEffect } from "react"
import { userAPI } from "../../common/api"
import { marketplaceAPI } from "../../marketplace/api"
import { auth } from "../../common/auth"
import ProductCard from "../../marketplace/components/ProductCard"
import ProductModal from "../../marketplace/components/ProductModal"
import CreateListingForm from "../../marketplace/components/CreateListingForm"
import EditListingForm from "../../marketplace/components/EditListingForm"
import Profile from "./Profile"
import DiseaseDetection from "../../disease-detection/components/DiseaseDetection"
import Weather from "../../weather/components/Weather"
import DetectionAnalytics from "../../analytics_news/components/DetectionAnalytics"
import LatestNews from "../../analytics_news/components/LatestNews"

const EnhancedFarmerDashboard = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState("marketplace")
  const [marketplaceTab, setMarketplaceTab] = useState("all")
  const [allListings, setAllListings] = useState([])
  const [myListings, setMyListings] = useState([])
  const [selectedListing, setSelectedListing] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingListing, setEditingListing] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [message, setMessage] = useState("")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)

  useEffect(() => {
    const initDashboard = async () => {
      if (!auth.isAuthenticated()) {
        window.location.href = "/login"
        return
      }
      try {
        await fetchProfile()
        await fetchAllListings()
        await fetchMyListings()
      } catch (error) {
        console.error("Error initializing dashboard:", error)
        window.location.href = "/login"
      }
    }
    initDashboard()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await userAPI.getProfile()
      setUser(response.data)
    } catch (error) {
      console.error("Failed to fetch profile:", error)
      if (error.message.includes("401") || error.message.includes("Unauthorized")) {
        auth.logout()
        return
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchAllListings = async () => {
    try {
      const response = await marketplaceAPI.getAllListings(searchQuery)
      setAllListings(response.data || [])
    } catch (error) {
      console.error("Failed to fetch all listings:", error)
    }
  }

  const fetchMyListings = async () => {
    try {
      console.log("Fetching my listings...")
      const response = await marketplaceAPI.getMyListings()
      console.log("My listings response:", response)
      setMyListings(response.data || response || [])
    } catch (error) {
      console.error("Failed to fetch my listings:", error)
      if (error.message.includes("401") || error.message.includes("Unauthorized")) {
        auth.logout()
        return
      }
      setMyListings([])
    }
  }

  const handleSearch = async () => {
    await fetchAllListings()
  }

  const handleCreateListing = async (listingData) => {
    try {
      await marketplaceAPI.createListing(listingData)
      setMessage("Listing created successfully!")
      setShowCreateForm(false)
      await fetchMyListings()
      await fetchAllListings()
      setTimeout(() => setMessage(""), 3000)
    } catch (error) {
      setMessage(`Failed to create listing: ${error.message}`)
    }
  }

  const handleEditListing = async (id, listingData) => {
    try {
      await marketplaceAPI.updateListing(id, listingData)
      setMessage("Listing updated successfully!")
      setEditingListing(null)
      await fetchMyListings()
      await fetchAllListings()
      setTimeout(() => setMessage(""), 3000)
    } catch (error) {
      setMessage(`Failed to update listing: ${error.message}`)
    }
  }

  const handleDeleteListing = async (listing) => {
    if (window.confirm(`Are you sure you want to delete "${listing.crop_name}"?`)) {
      try {
        await marketplaceAPI.deleteListing(listing.id)
        setMessage("Listing deleted successfully!")
        await fetchMyListings()
        await fetchAllListings()
        setTimeout(() => setMessage(""), 3000)
      } catch (error) {
        setMessage(`Failed to delete listing: ${error.message}`)
      }
    }
  }

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      auth.logout()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const renderMarketplace = () => (
    <div className="space-y-6">
      {/* Marketplace Header */}
      <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-800 flex items-center gap-3">
            <span className="text-2xl sm:text-3xl">🛒</span>
            Marketplace
          </h2>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 sm:px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center gap-2 w-fit text-sm sm:text-base"
          >
            <span className="text-lg">➕</span>
            Create New Listing
          </button>
        </div>
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setMarketplaceTab("all")}
            className={`px-4 sm:px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 text-sm sm:text-base ${
              marketplaceTab === "all"
                ? "bg-green-600 text-white shadow-lg"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <span>🌾</span>
            All Listings ({allListings.length})
          </button>
          <button
            onClick={() => setMarketplaceTab("my")}
            className={`px-4 sm:px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 text-sm sm:text-base ${
              marketplaceTab === "my"
                ? "bg-green-600 text-white shadow-lg"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <span>📋</span>
            My Listings ({myListings.length})
          </button>
        </div>
        {/* Search Bar */}
        {marketplaceTab === "all" && (
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Search crops, location, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent hover:border-gray-300 transition-all duration-200 text-sm sm:text-base"
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
            <div className="flex gap-2">
              <button
                onClick={handleSearch}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 text-sm sm:text-base"
              >
                <span>🔍</span>
                Search
              </button>
              <button
                onClick={() => {
                  setSearchQuery("")
                  fetchAllListings()
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 sm:px-6 py-3 rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-xl border ${
            message.includes("successfully")
              ? "bg-green-50 text-green-800 border-green-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {message.includes("successfully") ? (
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <span className="font-medium text-sm sm:text-base">{message}</span>
          </div>
        </div>
      )}

      {/* Listings Grid */}
      {marketplaceTab === "all" ? (
        allListings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 text-center border border-gray-100">
            <div className="text-4xl sm:text-6xl mb-4">🌾</div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-700 mb-2">No listings found</h3>
            <p className="text-gray-500 text-sm sm:text-base">
              {searchQuery ? "Try adjusting your search terms" : "No crop listings available"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {allListings.map((listing) => (
              <ProductCard key={listing.id} listing={listing} onClick={setSelectedListing} />
            ))}
          </div>
        )
      ) : myListings.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 text-center border border-gray-100">
          <div className="text-4xl sm:text-6xl mb-4">📋</div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-700 mb-2">No listings yet</h3>
          <p className="text-gray-500 mb-6 text-sm sm:text-base">Create your first crop listing to start selling!</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 sm:px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center gap-2 mx-auto text-sm sm:text-base"
          >
            <span>➕</span>
            Create First Listing
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {myListings.map((listing) => (
            <ProductCard
              key={listing.id}
              listing={listing}
              isOwner={true}
              onClick={setSelectedListing}
              onEdit={setEditingListing}
              onDelete={handleDeleteListing}
            />
          ))}
        </div>
      )}
    </div>
  )

  const renderReports = () => (
    <div className="space-y-8">
      {/* Analytics Section */}
      <DetectionAnalytics />
      {/* News Section */}
      <LatestNews />
    </div>
  )

  const renderContent = () => {
    switch (activeSection) {
      case "marketplace":
        return renderMarketplace()
      case "profile":
        return <Profile />
      case "disease-detection":
        return <DiseaseDetection />
      case "weather":
        return <Weather />
      case "reports":
        return renderReports()
      default:
        return renderMarketplace()
    }
  }

  const sidebarItems = [
    { id: "marketplace", icon: "🛒", label: "Marketplace" },
    { id: "disease-detection", icon: "🔬", label: "Disease Detection" },
    { id: "weather", icon: "🌤️", label: "Weather" },
    { id: "reports", icon: "📊", label: "Analytics & News" },
    { id: "profile", icon: "👤", label: "Profile" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-amber-50 to-emerald-50 flex">
      {/* Fixed Sidebar - Shows/Hides completely */}
      <div
        className={`${
          sidebarCollapsed ? "w-0" : "w-64 sm:w-72"
        } fixed inset-y-0 left-0 z-50 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white transform transition-all duration-300 ease-in-out shadow-2xl border-r border-gray-700 overflow-hidden`}
      >
        {/* Enhanced Logo Section */}
        <div className="p-4 sm:p-6 border-b border-gray-700 bg-gradient-to-r from-green-800 to-emerald-800">
          <div className="flex justify-center items-center gap-3 mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
              <img src="/sklogo.png" alt="SmartKheti Logo" className="w-6 h-6 sm:w-8 sm:h-8 object-contain" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white whitespace-nowrap">SmartKheti</h1>
          </div>
          <p className="text-center text-green-100 text-xs sm:text-sm font-medium">Farmer Dashboard</p>
        </div>

        {/* Enhanced User Info */}
        <div className="p-4 sm:p-6 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-xl sm:text-2xl flex-shrink-0 shadow-lg border-2 border-green-400">
              👤
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white truncate text-sm sm:text-base">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-green-200 text-xs sm:text-sm truncate">{user?.phone}</p>
              <div className="mt-1">
                <span className="inline-block bg-green-600 text-green-100 px-2 py-1 rounded-full text-xs font-semibold">
                  Active Farmer
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Navigation */}
        <nav className="flex-1 p-3 sm:p-4 overflow-y-auto">
          <div className="space-y-2">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl transition-all duration-300 text-sm sm:text-base group relative overflow-hidden ${
                  activeSection === item.id
                    ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-xl transform scale-105 border border-green-400"
                    : "text-gray-300 hover:bg-gradient-to-r hover:from-gray-700 hover:to-gray-600 hover:text-white hover:shadow-lg hover:scale-102"
                }`}
              >
                {/* Active indicator */}
                {activeSection === item.id && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-300 rounded-r-full"></div>
                )}

                <span className="text-xl sm:text-2xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </span>
                <span className="font-semibold truncate whitespace-nowrap">{item.label}</span>

                {/* Hover effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            ))}
          </div>
        </nav>

        {/* Enhanced Logout */}
        <div className="p-3 sm:p-4 border-t border-gray-700 bg-gradient-to-r from-gray-800 to-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-xl text-sm sm:text-base group"
          >
            <span className="text-xl sm:text-2xl flex-shrink-0 group-hover:rotate-12 transition-transform duration-300">
              🚪
            </span>
            <span className="truncate whitespace-nowrap">Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Overlay - Only for mobile */}
      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 z-40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarCollapsed(true)}
        ></div>
      )}

      {/* Main Content Area - Expands to full width when sidebar is hidden */}
      <div
        className={`${
          sidebarCollapsed ? "ml-0" : "ml-64 sm:ml-72"
        } flex-1 transition-all duration-300 ease-in-out min-h-screen flex flex-col`}
      >
        {/* Enhanced Header */}
        <div className="bg-white shadow-xl p-4 lg:p-6 sticky top-0 z-30 border-b border-gray-200 backdrop-blur-sm bg-white/95">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-3 rounded-xl bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 hover:from-green-200 hover:to-emerald-200 transition-all duration-300 flex-shrink-0 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <svg
                  className={`w-6 h-6 transition-transform duration-300 ${sidebarCollapsed ? "rotate-0" : "rotate-180"}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center text-white text-lg shadow-lg">
                  {activeSection === "marketplace" && "🛒"}
                  {activeSection === "disease-detection" && "🔬"}
                  {activeSection === "weather" && "🌤️"}
                  {activeSection === "reports" && "📊"}
                  {activeSection === "profile" && "👤"}
                </div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 truncate">
                  {activeSection === "marketplace" && "Marketplace"}
                  {activeSection === "disease-detection" && "Disease Detection"}
                  {activeSection === "weather" && "Weather System"}
                  {activeSection === "reports" && "Analytics & News"}
                  {activeSection === "profile" && "Profile"}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              <span className="hidden sm:block text-gray-600 text-sm lg:text-base truncate font-medium">
                Welcome, {user?.first_name}!
              </span>
              <div className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-3 py-2 rounded-full text-xs sm:text-sm font-bold shadow-lg border border-green-200">
                🌾 Farmer
              </div>
            </div>
          </div>
        </div>

        {/* Content Area - Full width when sidebar hidden */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          <div className="max-w-full mx-auto w-full">{renderContent()}</div>
        </div>
      </div>

      {/* Modals */}
      {selectedListing && <ProductModal listing={selectedListing} onClose={() => setSelectedListing(null)} />}
      {showCreateForm && <CreateListingForm onSubmit={handleCreateListing} onClose={() => setShowCreateForm(false)} />}
      {editingListing && (
        <EditListingForm
          listing={editingListing}
          onSubmit={(data) => handleEditListing(editingListing.id, data)}
          onClose={() => setEditingListing(null)}
        />
      )}
    </div>
  )
}

export default EnhancedFarmerDashboard
