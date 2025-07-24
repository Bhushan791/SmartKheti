"use client"

import { useState } from "react"
import { userAPI } from "../../common/api"

const ForgotPassword = () => {
  const [step, setStep] = useState(1) // 1: phone, 2: otp + password
  const [formData, setFormData] = useState({
    phone: "",
    otp: "",
    new_password: "",
    confirm_password: "",
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRequestOTP = async (e) => {
    e.preventDefault()

    if (!formData.phone.trim()) {
      setMessage("Phone number is required")
      return
    }

    setLoading(true)
    setMessage("")

    try {
      await userAPI.requestOTP(formData.phone)
      setMessage("OTP sent successfully! Check console for OTP.")
      setStep(2)
    } catch (error) {
      setMessage(`Failed to send OTP: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()

    if (!formData.otp || !formData.new_password) {
      setMessage("OTP and new password are required")
      return
    }

    if (formData.new_password !== formData.confirm_password) {
      setMessage("Passwords do not match")
      return
    }

    if (formData.new_password.length < 6) {
      setMessage("Password must be at least 6 characters")
      return
    }

    setLoading(true)
    setMessage("")

    try {
      await userAPI.verifyOTP({
        phone: formData.phone,
        otp: formData.otp,
        new_password: formData.new_password,
      })
      setMessage("Password reset successfully! Redirecting to login...")
      setTimeout(() => {
        window.location.href = "/login"
      }, 2000)
    } catch (error) {
      setMessage(`Password reset failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="forgot-password-container" id="forgot-password-page">
      <div className="forgot-password-form-wrapper">
        <h1 className="forgot-password-title">Reset Password</h1>

        {message && (
          <div className={`message ${message.includes("successfully") ? "success" : "error"}`}>{message}</div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestOTP} className="forgot-password-form" id="request-otp-form">
            <p className="form-description">Enter your phone number to receive an OTP for password reset.</p>

            <div className="form-group">
              <label htmlFor="forgot-phone">Phone Number</label>
              <input
                type="tel"
                id="forgot-phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="form-input"
                placeholder="+977-9800000000"
                required
              />
            </div>

            <button type="submit" className="submit-btn request-otp-btn" disabled={loading} id="request-otp-btn">
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="forgot-password-form" id="reset-password-form">
            <p className="form-description">Enter the OTP sent to your phone and your new password.</p>

            <div className="form-group">
              <label htmlFor="forgot-otp">OTP Code</label>
              <input
                type="text"
                id="forgot-otp"
                name="otp"
                value={formData.otp}
                onChange={handleInputChange}
                className="form-input"
                maxLength="6"
                placeholder="Enter 6-digit OTP"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="forgot-new-password">New Password</label>
              <input
                type="password"
                id="forgot-new-password"
                name="new_password"
                value={formData.new_password}
                onChange={handleInputChange}
                className="form-input"
                minLength="6"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="forgot-confirm-password">Confirm New Password</label>
              <input
                type="password"
                id="forgot-confirm-password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>

            <button type="submit" className="submit-btn reset-password-btn" disabled={loading} id="reset-password-btn">
              {loading ? "Resetting Password..." : "Reset Password"}
            </button>

            <button type="button" onClick={() => setStep(1)} className="back-btn" id="back-to-phone-btn">
              Back to Phone Entry
            </button>
          </form>
        )}

        <div className="form-footer">
          <p>
            Remember your password?{" "}
            <a href="/login" className="link" id="back-to-login">
              Login here
            </a>
          </p>
          <p>
            Don't have an account?{" "}
            <a href="/register" className="link" id="go-to-register-from-forgot">
              Register here
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
