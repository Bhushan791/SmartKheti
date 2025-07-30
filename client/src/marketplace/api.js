import { apiCall } from "../common/api"

// Marketplace API functions
export const marketplaceAPI = {
  // Get all crop listings (public)
  getAllListings: (searchquery = "") => {
    const params = searchquery ? `?searchquery=${encodeURIComponent(searchquery)}` : ""
    return apiCall(`/marketplace/list/${params}`)
  },

  // Get single listing
  getListing: (id) => apiCall(`/marketplace/listings/${id}/`),

  // Get all products (public)
  getAllProducts: (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return apiCall(`/marketplace/products/${queryString ? `?${queryString}` : ""}`)
  },

  // Get single product
  getProduct: (id) => apiCall(`/marketplace/products/${id}/`),

  // Search products
  searchProducts: (query, filters = {}) => {
    const params = { search: query, ...filters }
    const queryString = new URLSearchParams(params).toString()
    return apiCall(`/marketplace/products/?${queryString}`)
  },

  // Farmer-only endpoints (require authentication)
  getMyListings: () => apiCall("/marketplace/listings/my/"),
  getMyProducts: () => apiCall("/marketplace/my-products/"),

  createListing: (listingData) => {
    const formData = new FormData()

    // Add all fields except images first
    Object.keys(listingData).forEach((key) => {
      if (key !== "images" && listingData[key] !== null && listingData[key] !== undefined && listingData[key] !== "") {
        formData.append(key, listingData[key])
      }
    })

    // Add images separately
    if (listingData.images && Array.isArray(listingData.images)) {
      listingData.images.forEach((image) => {
        if (image instanceof File) {
          formData.append("images", image)
        }
      })
    }

    return apiCall("/marketplace/list/", {
      method: "POST",
      body: formData,
      headers: {}, // Remove Content-Type for FormData
    })
  },

  createProduct: (productData) => {
    const formData = new FormData()
    Object.keys(productData).forEach((key) => {
      if (productData[key] !== null && productData[key] !== undefined && productData[key] !== "") {
        if (key === "images" && Array.isArray(productData[key])) {
          productData[key].forEach((image, index) => {
            formData.append(`images`, image)
          })
        } else {
          formData.append(key, productData[key])
        }
      }
    })

    return apiCall("/marketplace/products/", {
      method: "POST",
      body: formData,
      headers: {}, // Remove Content-Type for FormData
    })
  },

  updateListing: (id, listingData) => {
    const formData = new FormData()

    // Add all fields except images first
    Object.keys(listingData).forEach((key) => {
      if (key !== "images" && listingData[key] !== null && listingData[key] !== undefined && listingData[key] !== "") {
        formData.append(key, listingData[key])
      }
    })

    // Add images separately if provided
    if (listingData.images && Array.isArray(listingData.images)) {
      listingData.images.forEach((image) => {
        if (image instanceof File) {
          formData.append("images", image)
        }
      })
    }

    return apiCall(`/marketplace/listings/${id}/`, {
      method: "PUT",
      body: formData,
      headers: {},
    })
  },

  updateProduct: (id, productData) => {
    const formData = new FormData()
    Object.keys(productData).forEach((key) => {
      if (productData[key] !== null && productData[key] !== undefined && productData[key] !== "") {
        if (key === "images" && Array.isArray(productData[key])) {
          productData[key].forEach((image, index) => {
            if (image instanceof File) {
              formData.append(`images`, image)
            }
          })
        } else {
          formData.append(key, productData[key])
        }
      }
    })

    return apiCall(`/marketplace/products/${id}/`, {
      method: "PUT",
      body: formData,
      headers: {},
    })
  },

  deleteListing: (id) =>
    apiCall(`/marketplace/listings/${id}/`, {
      method: "DELETE",
    }),

  deleteProduct: (id) =>
    apiCall(`/marketplace/products/${id}/`, {
      method: "DELETE",
    }),

  // Categories
  getCategories: () => apiCall("/marketplace/categories/"),
// 
}
