"use client"

import { useState } from "react"

const EnhancedProductCard = ({ listing, isOwner = false, onEdit, onDelete, onClick }) => {
  const [imageError, setImageError] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const handleCardClick = (e) => {
    // Don't trigger card click if clicking on action buttons
    if (e.target.closest(".action-buttons")) return
    if (onClick) onClick(listing)
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat("ne-NP", {
      style: "currency",
      currency: "NPR",
      minimumFractionDigits: 0,
    }).format(price)
  }

// In ProductCard.jsx - Replace the getImageUrl function:

const getImageUrl = () => {
  if (listing.images && listing.images.length > 0) {
    const imagePath = listing.images[0].image || listing.images[0];
    // If already a full URL, return as is
    if (imagePath && imagePath.startsWith('http')) {
      return imagePath;
    }
    // Otherwise, prepend backend URL
    return imagePath ? `http://localhost:8000${imagePath}` : "/placeholder.svg?height=200&width=300";
  }
  return "/placeholder.svg?height=200&width=300";
};

  const getCategoryColor = (category) => {
    const colors = {
      Vegetable: "bg-green-100 text-green-800",
      Fruit: "bg-orange-100 text-orange-800",
      Grain: "bg-amber-100 text-amber-800",
      Spice: "bg-red-100 text-red-800",
      default: "bg-blue-100 text-blue-800",
    }
    return colors[category] || colors.default
  }

  return (
    <div
      className={`bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 h-full flex flex-col group ${
        isHovered ? "transform -translate-y-2 scale-105" : ""
      }`}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Section */}
      <div className="relative overflow-hidden">
        {!imageError ? (
          <img
            src={getImageUrl() || "/placeholder.svg"}
            alt={listing.crop_name}
            className="w-full h-48 sm:h-52 object-cover transition-transform duration-300 group-hover:scale-110"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-48 sm:h-52 bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">🌾</div>
              <div className="text-gray-600 font-medium">No Image</div>
            </div>
          </div>
        )}

        {/* Quantity Badge */}
        <div className="absolute top-3 right-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
          {listing.quantity} kg
        </div>

        {/* Category Badge */}
        {listing.category && (
          <div
            className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold shadow-lg ${getCategoryColor(
              listing.category,
            )}`}
          >
            {listing.category}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        {/* Price */}
        <div className="text-2xl font-bold text-green-700 mb-2">{formatPrice(listing.rate)}</div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-800 mb-3 line-clamp-2 group-hover:text-green-700 transition-colors duration-300">
          {listing.crop_name}
        </h3>

        {/* Location */}
        <div className="flex items-center text-gray-600 mb-3">
          <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-sm truncate">{listing.location || "Location not specified"}</span>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-1 line-clamp-3">
          {listing.description || "No description available."}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
          {/* Farmer Info */}
          <div className="flex items-center text-gray-500 text-sm">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span className="truncate">{listing.farmer || "Unknown Farmer"}</span>
          </div>

          {/* Owner Actions */}
          {isOwner && (
            <div className="action-buttons flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(listing)
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-300 transform hover:scale-105 flex items-center gap-1"
                title="Edit Listing"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(listing)
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-300 transform hover:scale-105 flex items-center gap-1"
                title="Delete Listing"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Hover Overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl`}
      ></div>
    </div>
  )
}

export default EnhancedProductCard
