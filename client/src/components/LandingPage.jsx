import videoSrc from '../assets/video.mp4'
"use client"

import { useState } from "react"
import { Link } from "react-router-dom"

const EnhancedLandingPage = () => {
  const [hoveredCard, setHoveredCard] = useState(null)

  const features = [
    {
      icon: "🔬",
      title: "AI Disease Detection",
      description: "Advanced AI-powered crop disease identification with personalized treatment recommendations",
      gradient: "from-emerald-500 to-green-600",
    },
    {
      icon: "🌤️",
      title: "Smart Weather System",
      description: "Personalized weather forecasts for your exact location with agricultural insights",
      gradient: "from-blue-500 to-cyan-600",
    },
    {
      icon: "🛒",
      title: "Farmer Marketplace",
      description: "Direct marketplace to buy and sell agricultural products with fair pricing",
      gradient: "from-amber-500 to-orange-600",
    },
    {
      icon: "📊",
      title: "Analytics & Reports",
      description: "Comprehensive reports and analytics to track your farming progress",
      gradient: "from-purple-500 to-indigo-600",
    },
    {
      icon: "📱",
      title: "Mobile Friendly",
      description: "Access all features on any device, anywhere in Nepal",
      gradient: "from-rose-500 to-pink-600",
    },
    {
      icon: "🌾",
      title: "Crop Management",
      description: "Complete crop lifecycle management with expert guidance",
      gradient: "from-green-500 to-emerald-600",
    },
  ]

  const newsItems = [
    "🌾 New organic farming techniques boost yield by 30% in Chitwan district",
    "💰 Government announces Rs 50 crore subsidy for modern farming equipment",
    "🌱 Smart irrigation systems reduce water usage by 40% in Terai region",
    "📈 Export of Nepali tea increases by 25% this quarter",
    "🚜 Digital farming revolution reaches remote villages of Nepal",
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-green-50 to-emerald-50">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-green-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-60 right-20 w-24 h-24 bg-amber-200 rounded-full opacity-30 animate-bounce"></div>
        <div className="absolute bottom-40 left-1/4 w-20 h-20 bg-emerald-200 rounded-full opacity-25 animate-pulse delay-1000"></div>
      </div>

      {/* Hero Section */}
{/* Hero Section */}
      {/* Hero Section */}
<section className="relative text-white overflow-hidden">
  {/* Video Background */}
  <video
    autoPlay
    muted
    playsInline
    className="absolute inset-0 w-full h-full object-cover"
    onError={(e) => console.log('Video failed to load:', e)}
  >
    <source src={videoSrc} type="video/mp4" />
    {/* <source src="./assets/video.mp4" type="video/mp4" />
    <source src="/assets/video.mp4" type="video/mp4" /> */}
  </video>
  
  {/* Dark overlay for better text readability */}
  <div className="absolute inset-0 bg-black opacity-50"></div>
  
  <div className="relative container mx-auto px-6 py-20 lg:py-28">
    <div className="text-center max-w-4xl mx-auto">
      <div className="mb-8">
        {/* Updated h1 with logo */}
        <h1 className="text-5xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent flex items-center justify-center gap-4 flex-wrap">
          <img 
            src="/sklogo.png" 
            alt="SmartKheti Logo" 
            className="w-16 h-16 lg:w-24 lg:h-24 object-contain drop-shadow-lg"
          />
          SmartKheti
        </h1>
        
        <p className="text-xl lg:text-2xl mb-4 text-green-100 font-medium">
          Empowering Nepali Farmers with Smart Agriculture Technology
        </p>
        
        <p className="text-lg text-green-200 max-w-3xl mx-auto leading-relaxed">
          Join thousands of farmers across Nepal who are revolutionizing their farming with AI-powered disease
          detection, smart weather forecasting, and direct marketplace access.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
        <a
          href="/marketplace"
          className="group bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center gap-2"
        >
          🛒 Explore Marketplace
          <svg
            className="w-5 h-5 group-hover:translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </a>
        
        <a
          href="/login"
          className="group bg-gradient-to-r from-blue-500 to-blue-600 
                     hover:from-blue-400 hover:to-blue-700 
                     border-2 border-blue-400 hover:border-blue-500 
                     text-white px-8 py-4 rounded-xl font-semibold text-lg 
                     transition-all duration-300 transform hover:scale-105 
                     hover:shadow-xl flex items-center gap-2"
        >
          🚜 Continue as Farmer
          <svg
            className="w-5 h-5 group-hover:translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </a>
      </div>

      <div className="text-green-200">
        <p className="text-base">
          New to SmartKheti?{" "}
          <a
            href="/register"
            className="text-amber-300 hover:text-amber-200 underline font-medium transition-colors"
          >
            Register as Farmer
          </a>
        </p>
      </div>
    </div>
  </div>
</section>
      {/* Scrolling News Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap">
          <span className="text-sm font-medium">
            {newsItems.map((news, index) => (
              <span key={index} className="mx-8">
                {news}
              </span>
            ))}
          </span>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6">Why Choose SmartKheti?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Our comprehensive platform provides everything you need for modern, efficient farming in Nepal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 ${
                  hoveredCard === index ? "scale-105" : ""
                }`}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div
                  className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 group-hover:text-green-700 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-green-800 to-emerald-800 text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">Ready to Transform Your Farming?</h2>
          <p className="text-xl text-green-100 mb-10 max-w-2xl mx-auto">
            Join the SmartKheti community today and experience the future of agriculture in Nepal.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/register"
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-10 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
            >
              Get Started Now
            </a>
              <Link to="/reports"
              className="border-2 border-amber-400 text-amber-300 hover:bg-amber-400 hover:text-green-800 px-10 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105"
              >
            

                
              📊 View Sample Reports
              </Link>
        
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-green-400 mb-4">SmartKheti</h3>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Empowering Nepali farmers with technology for sustainable agriculture
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {[
              { name: "Marketplace", href: "/marketplace" },
              { name: "Weather", href: "/weather" },
              { name: "Disease Detection", href: "/disease-detection" },
              { name: "Reports", href: "/reports" },
            ].map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-gray-300 hover:text-green-400 transition-colors text-center py-2 hover:underline"
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="border-t border-gray-700 pt-8 text-center">
            <p className="text-gray-400">© 2024 SmartKheti. Made with ❤️ for Nepali Farmers</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translate3d(100%, 0, 0); }
          100% { transform: translate3d(-100%, 0, 0); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  )
}

export default EnhancedLandingPage
