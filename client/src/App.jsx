import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import LandingPage from "./components/LandingPage"
import Register from "./users/components/Register"
import Login from "./users/components/Login"
import FarmerDashboard from "./users/components/FarmerDashboard"
import ForgotPassword from "./users/components/ForgotPassword"
import MarketplacePublic from "./marketplace/components/MarketplacePublic"
import { auth } from "./common/auth"
import ReportGenerator from "./components/report"

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  if (!auth.isAuthenticated()) {
    return <Navigate to="/login" replace />
  }
  return children
}

// Public Route Component (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  if (auth.isAuthenticated()) {
    return <Navigate to="/farmer-dashboard" replace />
  }
  return children
}

function App() {
  return (
    <Router>
      <div className="app" id="smart-kheti-app">
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Public Marketplace */}
          <Route path="/marketplace" element={<MarketplacePublic />} />
          <Route path="/reports" element={<ReportGenerator />} />

          {/* Public Routes */}
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            }
          />

          {/* Protected Routes - Only Farmers */}
          <Route
            path="/farmer-dashboard"
            element={
              <ProtectedRoute>
                <FarmerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
