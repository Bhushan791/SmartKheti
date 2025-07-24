import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Register from "./users/components/Register"
import Login from "./users/components/Login"
import Profile from "./users/components/Profile"
import ForgotPassword from "./users/components/ForgotPassword"
import { auth } from "./common/auth"

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  return auth.isAuthenticated() ? children : <Navigate to="/login" replace />
}

// Public Route Component (redirect to profile if already logged in)
const PublicRoute = ({ children }) => {
  return !auth.isAuthenticated() ? children : <Navigate to="/profile" replace />
}

function App() {
  return (
    <Router>
      <div className="app" id="smart-kheti-app">
        <Routes>
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

          {/* Protected Routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Default redirect - FIXED */}
          <Route
            path="/"
            element={auth.isAuthenticated() ? <Navigate to="/profile" replace /> : <Navigate to="/login" replace />}
          />
          <Route
            path="*"
            element={auth.isAuthenticated() ? <Navigate to="/profile" replace /> : <Navigate to="/login" replace />}
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App
