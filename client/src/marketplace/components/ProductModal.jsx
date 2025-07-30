"use client"

import { useState } from "react"

const ProductModal = ({ listing, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const modalStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.8)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    padding: "20px",
  }

  const contentStyle = {
    backgroundColor: "white",
    borderRadius: "12px",
    maxWidth: "800px",
    width: "100%",
    maxHeight: "90vh",
    overflow: "auto",
    position: "relative",
  }

  const closeButtonStyle = {
    position: "absolute",
    top: "15px",
    right: "15px",
    background: "none",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    zIndex: 1001,
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "rgba(0,0,0,0.5)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }

  const imageContainerStyle = {
    position: "relative",
    height: "400px",
    backgroundColor: "#f5f5f5",
  }

  const imageStyle = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  }

  const thumbnailsStyle = {
    display: "flex",
    gap: "10px",
    padding: "15px",
    overflowX: "auto",
  }

  const thumbnailStyle = {
    width: "60px",
    height: "60px",
    objectFit: "cover",
    borderRadius: "8px",
    cursor: "pointer",
    border: "2px solid transparent",
  }

  const activeThumbnailStyle = {
    ...thumbnailStyle,
    border: "2px solid #2d5a27",
  }

  const detailsStyle = {
    padding: "20px",
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat("ne-NP", {
      style: "currency",
      currency: "NPR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getImages = () => {
    if (listing.images && listing.images.length > 0) {
      return listing.images.map((img) => img.image || img)
    }
    return ["/placeholder.svg?height=400&width=600"]
  }

  const images = getImages()

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
        <button style={closeButtonStyle} onClick={onClose}>
          ×
        </button>

        {/* Image Gallery */}
        <div style={imageContainerStyle}>
          <img src={images[currentImageIndex] || "/placeholder.svg"} alt={listing.crop_name} style={imageStyle} />

          {/* Navigation arrows for multiple images */}
          {images.length > 1 && (
            <>
              <button
                style={{
                  position: "absolute",
                  left: "15px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  backgroundColor: "rgba(0,0,0,0.5)",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  width: "40px",
                  height: "40px",
                  cursor: "pointer",
                  fontSize: "18px",
                }}
                onClick={() => setCurrentImageIndex(currentImageIndex > 0 ? currentImageIndex - 1 : images.length - 1)}
              >
                ‹
              </button>
              <button
                style={{
                  position: "absolute",
                  right: "15px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  backgroundColor: "rgba(0,0,0,0.5)",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  width: "40px",
                  height: "40px",
                  cursor: "pointer",
                  fontSize: "18px",
                }}
                onClick={() => setCurrentImageIndex(currentImageIndex < images.length - 1 ? currentImageIndex + 1 : 0)}
              >
                ›
              </button>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div style={thumbnailsStyle}>
            {images.map((image, index) => (
              <img
                key={index}
                src={image || "/placeholder.svg"}
                alt={`${listing.crop_name} ${index + 1}`}
                style={index === currentImageIndex ? activeThumbnailStyle : thumbnailStyle}
                onClick={() => setCurrentImageIndex(index)}
              />
            ))}
          </div>
        )}

        {/* Listing Details */}
        <div style={detailsStyle}>
          <div
            style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "15px" }}
          >
            <h2 style={{ fontSize: "28px", color: "#333", margin: 0, flex: 1 }}>{listing.crop_name}</h2>
            <div
              style={{
                padding: "8px 12px",
                borderRadius: "20px",
                fontSize: "14px",
                fontWeight: "bold",
                backgroundColor: "#d4edda",
                color: "#155724",
              }}
            >
              {listing.quantity} available
            </div>
          </div>

          <div style={{ fontSize: "32px", fontWeight: "bold", color: "#2d5a27", marginBottom: "15px" }}>
            {formatPrice(listing.rate)}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "15px",
              marginBottom: "20px",
            }}
          >
            <div>
              <strong>📍 Location:</strong>
              <br />
              <span style={{ color: "#666" }}>{listing.location || "Not specified"}</span>
            </div>
            <div>
              <strong>👤 Farmer:</strong>
              <br />
              <span style={{ color: "#666" }}>{listing.farmer || "Unknown"}</span>
            </div>
            <div>
              <strong>📂 Category:</strong>
              <br />
              <span style={{ color: "#666" }}>{listing.category || "Uncategorized"}</span>
            </div>
            <div>
              <strong>📅 Posted:</strong>
              <br />
              <span style={{ color: "#666" }}>{formatDate(listing.date_posted)}</span>
            </div>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <strong style={{ fontSize: "18px", marginBottom: "10px", display: "block" }}>Description:</strong>
            <p style={{ color: "#666", lineHeight: "1.6", margin: 0 }}>
              {listing.description || "No description available."}
            </p>
          </div>

          {/* Video Section */}
          {listing.video && (
            <div style={{ marginBottom: "20px" }}>
              <strong style={{ fontSize: "18px", marginBottom: "10px", display: "block" }}>Video:</strong>
              <video
                controls
                style={{
                  width: "100%",
                  maxHeight: "300px",
                  borderRadius: "8px",
                }}
              >
                <source src={listing.video} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          )}

          {/* Contact Information */}
          <div
            style={{
              backgroundColor: "#f8f9fa",
              padding: "20px",
              borderRadius: "8px",
              marginTop: "20px",
            }}
          >
            <h3 style={{ marginBottom: "15px", color: "#2d5a27" }}>Contact Farmer</h3>
            <p style={{ color: "#666", marginBottom: "15px" }}>Interested in this crop? Contact the farmer directly:</p>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {listing.contact_number && (
                <a
                  href={`tel:${listing.contact_number}`}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#2d5a27",
                    color: "white",
                    textDecoration: "none",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontWeight: "bold",
                  }}
                >
                  📞 {listing.contact_number}
                </a>
              )}
              {listing.optional_contact && (
                <a
                  href={`tel:${listing.optional_contact}`}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#1e40af",
                    color: "white",
                    textDecoration: "none",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontWeight: "bold",
                  }}
                >
                  📞 {listing.optional_contact}
                </a>
              )}
              <button
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#25d366",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
                onClick={() => {
                  const message = `Hi! I'm interested in your ${listing.crop_name} listed on SmartKheti marketplace. Is it still available?`
                  const phone = listing.contact_number?.replace(/[^0-9]/g, "")
                  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
                  window.open(whatsappUrl, "_blank")
                }}
              >
                💬 WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductModal
