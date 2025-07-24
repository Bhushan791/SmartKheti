"use client"

import { useState } from "react"
import { userAPI } from "../../common/api"

const Register = () => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    citizenship_number: "",
    province: "",
    district: "",
    municipality: "",
    ward_number: "",
    password: "",
    confirm_password: "",
    preferred_language: "np",
    profile_photo: null,
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.first_name.trim()) newErrors.first_name = "First name is required"
    if (!formData.last_name.trim()) newErrors.last_name = "Last name is required"
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required"
    if (!formData.password) newErrors.password = "Password is required"
    if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters"
    if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = "Passwords do not match"
    }

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
      const { confirm_password, ...submitData } = formData
      const response = await userAPI.register(submitData)

      setMessage("Account created successfully! Redirecting to login...")
      setTimeout(() => {
        window.location.href = "/login"
      }, 2000)
    } catch (error) {
      if (error.message.includes("errors")) {
        // Handle validation errors from backend
        setErrors(JSON.parse(error.message).errors || {})
      } else {
        setMessage(`Registration failed: ${error.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-container" id="register-page">
      <div className="register-form-wrapper">
        <h1 className="register-title">Create Account</h1>

        {message && (
          <div className={`message ${message.includes("successfully") ? "success" : "error"}`}>{message}</div>
        )}

        <form onSubmit={handleSubmit} className="register-form" id="register-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="first_name">First Name *</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                className={`form-input ${errors.first_name ? "error" : ""}`}
                required
              />
              {errors.first_name && <span className="error-text">{errors.first_name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="last_name">Last Name *</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                className={`form-input ${errors.last_name ? "error" : ""}`}
                required
              />
              {errors.last_name && <span className="error-text">{errors.last_name}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number *</label>
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
            <label htmlFor="citizenship_number">Citizenship Number</label>
            <input
              type="text"
              id="citizenship_number"
              name="citizenship_number"
              value={formData.citizenship_number}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="province">Province</label>
              <input
                type="text"
                id="province"
                name="province"
                value={formData.province}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="district">District</label>
              <input
                type="text"
                id="district"
                name="district"
                value={formData.district}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="municipality">Municipality</label>
              <input
                type="text"
                id="municipality"
                name="municipality"
                value={formData.municipality}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="ward_number">Ward Number</label>
              <input
                type="number"
                id="ward_number"
                name="ward_number"
                value={formData.ward_number}
                onChange={handleInputChange}
                className="form-input"
                min="1"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="preferred_language">Preferred Language</label>
            <select
              id="preferred_language"
              name="preferred_language"
              value={formData.preferred_language}
              onChange={handleInputChange}
              className="form-input"
            >
              <option value="np">Nepali</option>
              <option value="en">English</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="profile_photo">Profile Photo</label>
            <input
              type="file"
              id="profile_photo"
              name="profile_photo"
              onChange={handleInputChange}
              className="form-input file-input"
              accept="image/*"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`form-input ${errors.password ? "error" : ""}`}
                required
                minLength="6"
              />
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="confirm_password">Confirm Password *</label>
              <input
                type="password"
                id="confirm_password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleInputChange}
                className={`form-input ${errors.confirm_password ? "error" : ""}`}
                required
              />
              {errors.confirm_password && <span className="error-text">{errors.confirm_password}</span>}
            </div>
          </div>

          <button type="submit" className="submit-btn register-btn" disabled={loading} id="register-submit-btn">
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="form-footer">
          <p>
            Already have an account?{" "}
            <a href="/login" className="link" id="go-to-login">
              Login here
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
