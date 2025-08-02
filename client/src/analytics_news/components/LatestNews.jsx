"use client"

import { useState, useEffect } from "react"

const LatestNews = () => {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(false) // Changed from true to false
  const [error, setError] = useState(null)
  const [featuredNews, setFeaturedNews] = useState(null)
  const [hasInitialized, setHasInitialized] = useState(false) // New state to track if news has been loaded

  // const API_KEY = "582f1543b02146c78969b480c237f94b"
//   const API_KEY = "582f1543b02146c78969b480c237f94b"

  // Comprehensive fallback image sources for Nepal/agriculture/farming
  const fallbackImages = [
    "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop&auto=format&q=80", // Agriculture field
    "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&h=300&fit=crop&auto=format&q=80", // Farming
    "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop&auto=format&q=80", // Crops
    "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=300&fit=crop&auto=format&q=80", // Vegetables
    "https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?w=400&h=300&fit=crop&auto=format&q=80", // Rice field
    "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop&auto=format&q=80", // Wheat
    "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400&h=300&fit=crop&auto=format&q=80", // Corn
    "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&h=300&fit=crop&auto=format&q=80", // Farm landscape
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&auto=format&q=80", // Mountains (Nepal)
    "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&h=300&fit=crop&auto=format&q=80", // Himalayan landscape
    "https://cdn.pixabay.com/photo/2016/08/10/16/18/wheat-1584537_1280.jpg", // Wheat field
    "https://cdn.pixabay.com/photo/2016/02/14/17/33/corn-1199835_1280.jpg", // Corn field
    "https://via.placeholder.com/400x300/4ade80/ffffff?text=Nepal+News", // Final fallback
  ]

  // Get a random fallback image
  const getRandomFallbackImage = () => {
    return fallbackImages[Math.floor(Math.random() * fallbackImages.length)]
  }

  // Enhanced image error handler with multiple fallback attempts
  const handleImageError = (e, index = 0) => {
    if (index < fallbackImages.length - 1) {
      e.target.src = fallbackImages[index + 1]
      e.target.onerror = () => handleImageError(e, index + 1)
    } else {
      // Final fallback - create a colored placeholder
      e.target.src = "data:image/svg+xml;base64," + btoa(`
        <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="300" fill="#dc2626"/>
          <text x="200" y="140" font-family="Arial, sans-serif" font-size="16" fill="white" text-anchor="middle">🇳🇵</text>
          <text x="200" y="170" font-family="Arial, sans-serif" font-size="14" fill="white" text-anchor="middle">Nepal News</text>
        </svg>
      `)
    }
  }

  // Removed the automatic useEffect that was loading news on mount
  // Now news will only load when user clicks the load button

  const fetchNews = async () => {
    try {
      setLoading(true)
      setError(null)
      setHasInitialized(true) // Mark as initialized when user first loads news

      // Enhanced search strategies specifically for Nepal news
      const searchQueries = [
        // Nepal-specific searches
        'Nepal',
        'Nepal+news',
        'Nepal+politics',
        'Nepal+economy',
        'Nepal+development',
        'Kathmandu',
        'Nepal+government',
        'Nepal+society',
        'Nepal+culture',
        'Nepal+business',
        'Nepal+technology',
        'Nepal+education',
        'Nepal+health',
        'Nepal+tourism',
        'Nepal+environment',
        // Nepali language terms
        'नेपाल',
        'काठमाडौं',
        'नेपाली+समाचार',
        'नेपाल+सरकार',
        // Agriculture specific to Nepal
        'Nepal+agriculture',
        'Nepal+farming',
        'कृषि+नेपाल',
        'Nepal+rice+farming',
        'Nepal+wheat+production',
        'Nepal+farmers',
        'किसान+नेपाल'
      ]

      let allArticles = []

      // Try NewsAPI with country parameter for Nepal (np)
      try {
        const countryUrl = `https://newsapi.org/v2/top-headlines?country=np&pageSize=20&apiKey=${API_KEY}`
        const countryResponse = await fetch(countryUrl)
        const countryData = await countryResponse.json()
        
        if (countryData.status === "ok" && countryData.articles) {
          allArticles = [...allArticles, ...countryData.articles]
        }
      } catch (err) {
        console.log("Failed to fetch Nepal country headlines:", err)
      }

      // Try each search query with everything endpoint
      for (const query of searchQueries) {
        const url = `https://newsapi.org/v2/everything?q=${query}&sortBy=publishedAt&pageSize=10&from=${new Date(Date.now() - 7*24*60*60*1000).toISOString()}&apiKey=${API_KEY}`
        
        try {
          const response = await fetch(url)
          const queryData = await response.json()
          
          if (queryData.status === "error") {
            console.warn(`API error for query ${query}:`, queryData.message)
            continue
          }
          
          if (queryData.articles && queryData.articles.length > 0) {
            allArticles = [...allArticles, ...queryData.articles]
          }
        } catch (err) {
          console.log(`Failed to fetch for query: ${query}`, err)
        }
      }

      if (allArticles.length === 0) {
        throw new Error("No Nepal news found. Please try again later.")
      }

      // Remove duplicates and filter for Nepal-related content
      const uniqueArticles = allArticles.filter((article, index, self) => 
        index === self.findIndex(a => a.title === article.title)
      )

      const filteredNews = uniqueArticles
        .filter((article) => {
          if (!article.title || !article.description) return false
          
          const title = article.title.toLowerCase()
          const description = article.description.toLowerCase()
          const content = (article.content || "").toLowerCase()
          
          // Remove removed content
          if (title.includes("[removed]") || description.includes("[removed]")) return false
          
          // Prioritize Nepal-related content
          const nepalKeywords = [
            'nepal', 'nepali', 'nepalese', 'kathmandu', 'pokhara', 'lalitpur', 'bhaktapur',
            'himalaya', 'everest', 'sagarmatha', 'koshi', 'gandaki', 'lumbini',
            'नेपाल', 'नेपाली', 'काठमाडौं', 'पोखरा', 'ललितपुर', 'भक्तपुर',
            'हिमालय', 'सगरमाथा', 'कोशी', 'गण्डकी', 'लुम्बिनी',
            // Government and politics
            'oli', 'prachanda', 'deuba', 'bhandari', 'parliament', 'constituent assembly',
            'communist party', 'congress', 'uml', 'maoist',
            // Agriculture terms
            'कृषि', 'खेती', 'किसान', 'धान', 'गहुँ', 'मकै', 'तरकारी', 'फल',
            'agriculture', 'farming', 'farmer', 'rice', 'wheat', 'maize', 'vegetable', 'fruit',
            // Economy and development
            'rupee', 'economy', 'development', 'infrastructure', 'trade', 'export', 'import',
            'remittance', 'tourism', 'hydropower', 'electricity'
          ]
          
          const hasNepalContent = nepalKeywords.some(keyword => 
            title.includes(keyword) || description.includes(keyword) || content.includes(keyword)
          )
          
          return hasNepalContent
        })
        .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
        .slice(0, 25)

      setNews(filteredNews)
      if (filteredNews.length > 0) {
        setFeaturedNews(filteredNews[0])
      }

      // Set up auto-refresh only after initial manual load
      if (!hasInitialized) {
        const interval = setInterval(fetchNews, 30 * 60 * 1000) // Refresh every 30 minutes
        return () => clearInterval(interval)
      }
    } catch (error) {
      console.error("Error fetching news:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const formatTimeAgo = (dateString) => {
    const now = new Date()
    const publishedDate = new Date(dateString)
    const diffInHours = Math.floor((now - publishedDate) / (1000 * 60 * 60))

    if (diffInHours < 1) return "अहिले भर्खर"
    if (diffInHours < 24) return `${diffInHours} घण्टा अगाडि`

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays} दिन अगाडि`

    return publishedDate.toLocaleDateString('ne-NP')
  }

  // Show initial state when news hasn't been loaded yet
  if (!hasInitialized && !loading) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
                <span className="text-3xl">🇳🇵</span>
                आजको नेपाली समाचार (Today's Nepal Nutshell)
              </h2>
              <p className="text-red-100">नेपालका ताजा समाचार र जानकारी</p>
            </div>
            <div className="flex items-center gap-2 bg-white bg-opacity-20 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <span className="text-sm font-medium">READY</span>
            </div>
          </div>
        </div>

        {/* Load News Button */}
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
          <div className="text-6xl mb-4">📰</div>
          <h3 className="text-2xl font-bold text-gray-700 mb-2">समाचार लोड गर्नुहोस्</h3>
          <p className="text-gray-500 mb-6">
            नेपालका ताजा समाचारहरू हेर्न तलको बटन थिच्नुहोस्
          </p>
          <button
            onClick={fetchNews}
            className="bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-700 hover:to-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center gap-2 mx-auto"
          >
            <span className="text-lg">📡</span>
            समाचार लोड गर्नुहोस्
          </button>
          <p className="text-xs text-gray-400 mt-4">
            समाचार लोड गरेपछि प्रत्येक ३० मिनेटमा स्वचालित रूपमा अपडेट हुनेछ
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded-xl"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="animate-pulse">
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 text-center">
        <div className="text-6xl mb-4">🇳🇵</div>
        <h3 className="text-xl font-bold text-red-600 mb-2">समाचार लोड गर्न समस्या</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={fetchNews}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
        >
          पुनः प्रयास गर्नुहोस्
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
              <span className="text-3xl">🇳🇵</span>
              आजको नेपाली समाचार (Today's Nepal Nutshell)
            </h2>
            <p className="text-red-100">नेपालका ताजा समाचार र जानकारी</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white bg-opacity-20 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">LIVE</span>
            </div>
            <button
              onClick={fetchNews}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center gap-2"
            >
              <span className="text-base">🔄</span>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Featured News - Today's Nepal Nutshell */}
      {featuredNews && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <div className="md:flex">
            <div className="md:w-1/2">
              <img
                src={featuredNews.urlToImage || getRandomFallbackImage()}
                alt={featuredNews.title}
                className="w-full h-64 md:h-full object-cover"
                onError={(e) => handleImageError(e, 0)}
                loading="lazy"
              />
            </div>
            <div className="md:w-1/2 p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold">
                  🇳🇵 आजको मुख्य समाचार (Today's Nepal Nutshell)
                </span>
                <span className="text-gray-500 text-sm">{formatTimeAgo(featuredNews.publishedAt)}</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2">{featuredNews.title}</h3>
              <p className="text-gray-600 mb-4 line-clamp-3">{featuredNews.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 font-medium">
                  {featuredNews.source?.name || "नेपाली समाचार"}
                </span>
                <a
                  href={featuredNews.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                >
                  पूरा पढ्नुहोस्
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Breaking News Ticker */}
      {news.length > 0 && (
        <div className="bg-red-600 text-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-red-700 px-6 py-2 flex items-center gap-2">
            <span className="font-bold text-sm">🚨 ब्रेकिंग न्यूज</span>
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          </div>
          <div className="relative overflow-hidden h-16">
            <div className="absolute inset-0 flex items-center">
              <div className="animate-scroll-left whitespace-nowrap flex items-center gap-8 px-6">
                {news.slice(1, 8).map((article, index) => (
                  <span key={index} className="text-sm font-medium">
                    📢 {article.title}
                  </span>
                ))}
                {/* Duplicate for seamless loop */}
                {news.slice(1, 8).map((article, index) => (
                  <span key={`dup-${index}`} className="text-sm font-medium">
                    📢 {article.title}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* News Grid */}
      {news.length > 1 && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="text-2xl">📊</span>
            अन्य नेपाली समाचारहरू
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.slice(1, 16).map((article, index) => (
              <div key={index} className="group cursor-pointer">
                <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <img
                    src={article.urlToImage || getRandomFallbackImage()}
                    alt={article.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => handleImageError(e, 0)}
                    loading="lazy"
                  />
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-gray-500">{formatTimeAgo(article.publishedAt)}</span>
                      <span className="text-xs text-red-600 font-semibold">{article.source?.name || "समाचार"}</span>
                    </div>
                    <h4 className="font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
                      {article.title}
                    </h4>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">{article.description}</p>
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 text-sm font-semibold transition-colors"
                    >
                      पूरा पढ्नुहोस्
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Load More Button */}
          {news.length > 15 && (
            <div className="text-center mt-6">
              <button
                onClick={() => {
                  // You can implement pagination here if needed
                  fetchNews()
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                थप समाचार लोड गर्नुहोस्
              </button>
            </div>
          )}
        </div>
      )}

      {/* No News State */}
      {news.length === 0 && !loading && hasInitialized && (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
          <div className="text-6xl mb-4">🇳🇵</div>
          <h3 className="text-2xl font-bold text-gray-700 mb-2">कुनै समाचार उपलब्ध छैन</h3>
          <p className="text-gray-500 mb-6">अहिले नेपाली समाचार लोड गर्न सकिएन। कृपया पछि प्रयास गर्नुहोस्।</p>
          <button
            onClick={fetchNews}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            पुनः प्रयास गर्नुहोस्
          </button>
        </div>
      )}

      <style jsx>{`
        @keyframes scroll-left {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        
        .animate-scroll-left {
          animation: scroll-left 60s linear infinite;
        }
        
        .animate-scroll-left:hover {
          animation-play-state: paused;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}

export default LatestNews