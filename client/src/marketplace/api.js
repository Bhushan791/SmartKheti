const processImageUrls = (listing) => {
  // Process images array
  if (listing.images && Array.isArray(listing.images)) {
    listing.images = listing.images.map(img => {
      const imagePath = img.image || img;
      // With Cloudinary, URLs are full URLs, so just return as is
      // If you want to keep the structure consistent, just return img as is
      return img;
    });
  }

  // Process video URL similarly
  if (listing.video) {
    // Cloudinary video URL should already be full URL
    // So no need to prepend anything
  }

  return listing;
};
