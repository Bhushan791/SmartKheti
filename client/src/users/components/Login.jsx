"use client"

import { useState, useEffect } from "react"
import { userAPI } from "../../common/api"
import { auth } from "../../common/auth"

const Login = () => {
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    // Redirect if already logged in
    if (auth.isAuthenticated()) {
      window.location.href = "/profile"
    }
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.phone.trim()) newErrors.phone = "Phone number is required"
    if (!formData.password) newErrors.password = "Password is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    setErrors({})
    setMessage("")

    try {
      const response = await userAPI.login(formData)

      // Save tokens
      auth.saveTokens(response.data)

      setMessage("Login successful! Redirecting...")
      setTimeout(() => {
        window.location.href = "/profile"
      }, 1000)
    } catch (error) {
      setMessage(`Login failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container" id="login-page">
      <div className="login-form-wrapper">
        <h1 className="login-title">Login to SmartKheti</h1>

        {message && <div className={`message ${message.includes("successful") ? "success" : "error"}`}>{message}</div>}

        <form onSubmit={handleSubmit} className="login-form" id="login-form">
          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className={`form-input ${errors.phone ? "error" : ""}`}
              placeholder="+977-9800000000"
              required
            />
            {errors.phone && <span className="error-text">{errors.phone}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`form-input ${errors.password ? "error" : ""}`}
              required
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <button type="submit" className="submit-btn login-btn" disabled={loading} id="login-submit-btn">
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="form-footer">
          <p>
            <a href="/forgot-password" className="link">
              Forgot Password?
            </a>
          </p>
          <p>
            Don't have an account?{" "}
            <a href="/register" className="link" id="go-to-register">
              Register here
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
