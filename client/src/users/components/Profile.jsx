"use client"

import { useState, useEffect } from "react"
import { userAPI } from "../../common/api"
import { auth } from "../../common/auth"

const Profile = () => {
  const [user, setUser] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({})
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [message, setMessage] = useState("")
  const [showChangePassword, setShowChangePassword] = useState(false)

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      window.location.href = "/login"
      return
    }
    fetchProfile()
  }, [])

 const fetchProfile = async () => {
  try {
    const response = await userAPI.getProfile()
    const userData = response.data
    
    // Fix profile photo URL
    if (userData.profile_photo && !userData.profile_photo.startsWith('http')) {
      userData.profile_photo = `http://localhost:8000${userData.profile_photo}`
    }
    
    setUser(userData)
    setFormData(userData)
  } catch (error) {
    // ... existing error handling
  } finally {
    setLoading(false)
  }
}

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }))
  }

  const handleEdit = () => {
    setIsEditing(true)
    setMessage("")
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFormData(user)
    setMessage("")
  }

  const handleSave = async () => {
    setUpdating(true)
    setMessage("")

    try {
      const updateData = { ...formData }

      if (updateData.profile_photo && !(updateData.profile_photo instanceof File)) {
        delete updateData.profile_photo
      }

      const response = await userAPI.updateProfile(updateData)
      setUser(response.data)
      setIsEditing(false)
      setMessage("Profile updated successfully!")
    } catch (error) {
      if (error.message.includes("401") || error.message.includes("Unauthorized")) {
        auth.logout()
        return
      }
      setMessage(`Update failed: ${error.message}`)
    } finally {
      setUpdating(false)
    }
  }

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      auth.logout()
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600 text-lg" id="profile-loading">
        Loading profile...
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-red-600" id="profile-error">
        <p className="mb-4 text-xl font-semibold">Failed to load profile</p>
        <button
          onClick={() => (window.location.href = "/login")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Go to Login
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6" id="profile-page">
      <div className="flex flex-col md:flex-row md:justify-between items-center mb-6">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">User Profile</h1>
        <div className="flex flex-wrap gap-2">
          {!isEditing ? (
            <>
              <button
                onClick={handleEdit}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow transition"
                id="edit-profile-btn"
              >
                Edit Profile
              </button>
              <button
                onClick={() => setShowChangePassword(!showChangePassword)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded shadow transition"
                id="change-password-toggle-btn"
              >
                Change Password
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow transition"
                id="logout-btn"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSave}
                disabled={updating}
                className={`px-4 py-2 rounded shadow text-white ${
                  updating ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                } transition`}
                id="save-profile-btn"
              >
                {updating ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded shadow transition"
                id="cancel-edit-btn"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {message && (
        <div
          className={`mb-6 p-3 rounded ${
            message.includes("successfully")
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {message}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/3 flex flex-col items-center">
          <div className="w-48 h-48 rounded-full overflow-hidden border border-gray-300 flex items-center justify-center mb-4">
            {(isEditing ? formData.profile_photo : user.profile_photo) ? (
              <img
                src={
                  isEditing && formData.profile_photo instanceof File
                    ? URL.createObjectURL(formData.profile_photo)
                    : user.profile_photo
                }
                alt="Profile"
                className="object-cover w-full h-full"
                id="profile-photo-display"
              />
            ) : (
              <div className="text-gray-400">No Photo</div>
            )}
          </div>

          {isEditing && (
            <div className="w-full">
              <label
                htmlFor="profile_photo"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Change Profile Photo
              </label>
              <input
                type="file"
                id="profile_photo"
                name="profile_photo"
                onChange={handleInputChange}
                className="block w-full text-sm text-gray-600 border rounded px-2 py-1"
                accept="image/*"
              />
            </div>
          )}
        </div>

        <div className="md:w-2/3 space-y-6">
          {/* First and Last Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="first_name" className="block mb-1 font-medium text-gray-700">
                First Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              ) : (
                <p className="text-gray-800">{user.first_name}</p>
              )}
            </div>

            <div>
              <label htmlFor="last_name" className="block mb-1 font-medium text-gray-700">
                Last Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              ) : (
                <p className="text-gray-800">{user.last_name}</p>
              )}
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Phone Number</label>
            <p className="text-gray-800">{user.phone}</p>
          </div>

          {/* Citizenship Number */}
          <div>
            <label htmlFor="citizenship_number" className="block mb-1 font-medium text-gray-700">
              Citizenship Number
            </label>
            {isEditing ? (
              <input
                type="text"
                id="citizenship_number"
                name="citizenship_number"
                value={formData.citizenship_number || ""}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            ) : (
              <p className="text-gray-800">{user.citizenship_number || "Not provided"}</p>
            )}
          </div>

          {/* Province and District */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="province" className="block mb-1 font-medium text-gray-700">
                Province
              </label>
              {isEditing ? (
                <input
                  type="text"
                  id="province"
                  name="province"
                  value={formData.province || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              ) : (
                <p className="text-gray-800">{user.province || "Not provided"}</p>
              )}
            </div>

            <div>
              <label htmlFor="district" className="block mb-1 font-medium text-gray-700">
                District
              </label>
              {isEditing ? (
                <input
                  type="text"
                  id="district"
                  name="district"
                  value={formData.district || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              ) : (
                <p className="text-gray-800">{user.district || "Not provided"}</p>
              )}
            </div>
          </div>

          {/* Municipality and Ward Number */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="municipality" className="block mb-1 font-medium text-gray-700">
                Municipality
              </label>
              {isEditing ? (
                <input
                  type="text"
                  id="municipality"
                  name="municipality"
                  value={formData.municipality || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              ) : (
                <p className="text-gray-800">{user.municipality || "Not provided"}</p>
              )}
            </div>

            <div>
              <label htmlFor="ward_number" className="block mb-1 font-medium text-gray-700">
                Ward Number
              </label>
              {isEditing ? (
                <input
                  type="number"
                  id="ward_number"
                  name="ward_number"
                  value={formData.ward_number || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  min="1"
                />
              ) : (
                <p className="text-gray-800">{user.ward_number || "Not provided"}</p>
              )}
            </div>
          </div>

          {/* Preferred Language */}
          <div>
            <label htmlFor="preferred_language" className="block mb-1 font-medium text-gray-700">
              Preferred Language
            </label>
            {isEditing ? (
              <select
                id="preferred_language"
                name="preferred_language"
                value={formData.preferred_language || "np"}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="np">Nepali</option>
                <option value="en">English</option>
              </select>
            ) : (
              <p className="text-gray-800">
                {user.preferred_language === "np" ? "Nepali" : "English"}
              </p>
            )}
          </div>
        </div>
      </div>

      {showChangePassword && <ChangePasswordSection onClose={() => setShowChangePassword(false)} />}
    </div>
  )
}

// Change Password Component
const ChangePasswordSection = ({ onClose }) => {
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

  const handleChangePassword = async (e) => {
    e.preventDefault()

    if (!formData.otp || !formData.new_password) {
      setMessage("OTP and new password are required")
      return
    }

    if (formData.new_password !== formData.confirm_password) {
      setMessage("Passwords do not match")
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
      setMessage("Password changed successfully!")
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (error) {
      setMessage(`Failed to change password: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50"
      id="change-password-section"
    >
      <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg relative">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Change Password</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none font-bold"
            id="close-change-password"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {message && (
          <div
            className={`mb-4 rounded p-3 ${
              message.includes("successfully")
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestOTP} className="space-y-4">
            <div>
              <label
                htmlFor="change-phone"
                className="block mb-1 font-medium text-gray-700"
              >
                Enter your phone number
              </label>
              <input
                type="tel"
                id="change-phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="+977-9800000000"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
              disabled={loading}
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label
                htmlFor="change-otp"
                className="block mb-1 font-medium text-gray-700"
              >
                Enter OTP
              </label>
              <input
                type="text"
                id="change-otp"
                name="otp"
                value={formData.otp}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            <div>
              <label
                htmlFor="change-new-password"
                className="block mb-1 font-medium text-gray-700"
              >
                New Password
              </label>
              <input
                type="password"
                id="change-new-password"
                name="new_password"
                value={formData.new_password}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                minLength={6}
                required
              />
            </div>
            <div>
              <label
                htmlFor="change-confirm-password"
                className="block mb-1 font-medium text-gray-700"
              >
                Confirm New Password
              </label>
              <input
                type="password"
                id="change-confirm-password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded"
              disabled={loading}
            >
              {loading ? "Changing Password..." : "Change Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default Profile
