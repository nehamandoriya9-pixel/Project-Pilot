import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTheme } from '../contexts/ThemeContext';
import {
  IoPerson,
  IoMail,
  IoCall,
  IoLocation,
  IoCalendar,
  IoCamera,
  IoSave,
  IoLockClosed,
  IoCreate,
  IoTrash,
  IoCloudUpload,
  IoCheckmark,
  IoClose,
  IoWarning,
  IoDownload
} from "react-icons/io5";
import { profileAPI } from "../services/api";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const { isDarkMode } = useTheme();

  // Form states
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    location: "",
    website: "",
    company: "",
    position: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  // Animation variants matching ProjectDetails
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.02,
      y: -2,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError("");
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        const response = await profileAPI.getProfile();

        // Handle both response formats: response.data.data OR response.data
        const userData =
          response.data.data || response.data.user || response.data;

        if (!userData) {
          throw new Error("No user data received from server");
        }

        setUser(userData);
        setProfileData({
          name: userData.name || "",
          email: userData.email || "",
          phone: userData.phone || "",
          bio: userData.bio || "",
          location: userData.location || "",
          website: userData.website || "",
          company: userData.company || "",
          position: userData.position || "",
        });

        if (userData.avatar) {
          setAvatarPreview(`https://project-pilot-4ju2.onrender.com${userData.avatar}`);
        } else {
          // Use the user's initial as fallback
          const initial = userData.name
            ? userData.name.charAt(0).toUpperCase()
            : "U";
          setAvatarPreview(
            `https://ui-avatars.com/api/?name=${initial}&background=random`
          );
        }
      } catch (err) {
        console.error("❌ Error fetching user data:", err);
        setError(
          "Failed to load profile data: " +
            (err.response?.data?.error || err.message)
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await profileAPI.updateProfile(profileData);

      // Handle both response formats
      const updatedUser = response.data.data || response.data;
      setUser(updatedUser);
      setSuccess(response.data.message || "Profile updated successfully!");
      setIsEditing(false);

      // Update localStorage
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (err) {
      console.error("❌ Error updating profile:", err);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Failed to update profile - please check your connection");
      }
    } finally {
      setSaving(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords do not match");
      setSaving(false);
      return;
    }

    try {
      const response = await profileAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setSuccess(response.data.message || "Password updated successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      console.error("❌ Error changing password:", err);
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to change password"
      );
    } finally {
      setSaving(false);
    }
  };

  // Handle avatar upload
  const handleAvatarUpload = async () => {
    if (!avatarFile) return;

    try {
      setSaving(true);
      setError("");

      const response = await profileAPI.uploadAvatar(avatarFile);

      // Handle both response formats
      const updatedUser = response.data.data || response.data;
      setUser(updatedUser);

      // Use the uploaded file for preview immediately
      setAvatarPreview(URL.createObjectURL(avatarFile));
      setSuccess(response.data.message || "Avatar updated successfully!");
      setAvatarFile(null);

      // Update localStorage
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (err) {
      console.error("❌ Error uploading avatar:", err);
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to upload avatar"
      );
    } finally {
      setSaving(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        setError("File size must be less than 5MB");
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost."
      )
    ) {
      return;
    }

    try {
      await profileAPI.deleteAccount();

      // Clear local storage and redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      navigate("/login");
    } catch (err) {
      console.error("❌ Error deleting account:", err);
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to delete account"
      );
    }
  };

  // Get user initial for avatar fallback
  const getUserInitial = () => {
    return user?.name ? user.name.charAt(0).toUpperCase() : "U";
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? "bg-gray-900" : "bg-[#FFF6E0]"}`}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className={`rounded-full h-12 w-12 border-b-2 ${isDarkMode ? "border-blue-500" : "border-amber-600"}`}
        />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`min-h-screen p-6 ${isDarkMode ? "bg-gray-900" : "bg-[#FFF6E0]"}`}
    >
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex items-center justify-between"
        >
          <div>
            <motion.h1 
              variants={itemVariants}
              className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
            >
              Profile Settings
            </motion.h1>
            <motion.p 
              variants={itemVariants}
              className={`mt-2 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
            >
              Manage your account settings and preferences
            </motion.p>
          </div>
        </motion.div>

        {/* Success/Error Messages */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`rounded-xl p-4 shadow-lg ${
                isDarkMode 
                  ? "bg-green-900/20 border border-green-800 text-green-200" 
                  : "bg-green-50 border border-green-200 text-green-800"
              }`}
            >
              <div className="flex items-center">
                <IoCheckmark className="w-5 h-5 mr-2" />
                <span>{success}</span>
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`rounded-xl p-4 shadow-lg ${
                isDarkMode 
                  ? "bg-red-900/20 border border-red-800 text-red-200" 
                  : "bg-red-50 border border-red-200 text-red-800"
              }`}
            >
              <div className="flex items-center">
                <IoClose className="w-5 h-5 mr-2" />
                <span>{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-1"
          >
            <div className={`rounded-2xl shadow-xl border backdrop-blur-sm p-6 ${
              isDarkMode ? "bg-gray-800/80 border-gray-700" : "bg-white/80 border-amber-200"
            }`}>
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-2xl font-bold mb-4 mx-auto shadow-lg"
                  >
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar"
                        className="w-24 h-24 rounded-2xl object-cover"
                      />
                    ) : (
                      <IoPerson className="w-8 h-8" />
                    )}
                  </motion.div>
                  <motion.label
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    htmlFor="avatar-upload"
                    className={`absolute bottom-0 right-0 p-2 rounded-xl cursor-pointer shadow-lg ${
                      isDarkMode 
                        ? "bg-blue-600 text-white hover:bg-blue-700" 
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    } transition-all duration-200`}
                  >
                    <IoCamera className="text-sm" />
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </motion.label>
                </div>
                <h2 className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  {user?.name}
                </h2>
                <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>{user?.email}</p>
              </div>

              <nav className="space-y-3">
                {[
                  { id: "profile", label: "Profile Information", icon: IoPerson },
                  { id: "password", label: "Change Password", icon: IoLockClosed },
                  { id: "danger", label: "Danger Zone", icon: IoWarning },
                ].map((tab) => (
                  <motion.button
                    key={tab.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 border-2 backdrop-blur-sm ${
                      activeTab === tab.id
                        ? (isDarkMode 
                            ? "bg-blue-900/30 border-blue-700 text-white" 
                            : "bg-blue-50 border-blue-500 text-gray-900")
                        : (isDarkMode 
                            ? "border-gray-600 text-gray-300 hover:bg-gray-700/50" 
                            : "border-gray-200 text-gray-700 hover:bg-gray-50")
                    }`}
                  >
                    <tab.icon className={`w-5 h-5 ${
                      activeTab === tab.id 
                        ? (isDarkMode ? "text-blue-400" : "text-blue-600")
                        : (isDarkMode ? "text-gray-400" : "text-gray-500")
                    }`} />
                    <span className="font-medium">{tab.label}</span>
                  </motion.button>
                ))}
              </nav>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Profile Information Tab */}
                {activeTab === "profile" && (
                  <motion.div
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    className={`rounded-2xl shadow-xl border backdrop-blur-sm p-8 ${
                      isDarkMode ? "bg-gray-800/80 border-gray-700" : "bg-white/80 border-amber-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-8">
                      <h3 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                        Profile Information
                      </h3>
                      {!isEditing ? (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setIsEditing(true)}
                          className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg flex items-center ${
                            isDarkMode 
                              ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800" 
                              : "bg-gradient-to-br from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700"
                          }`}
                        >
                          <IoCreate className="w-5 h-5 mr-2" />
                          Edit Profile
                        </motion.button>
                      ) : (
                        <div className="flex space-x-3">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsEditing(false)}
                            className={`px-6 py-3 border-2 rounded-xl font-semibold transition-all duration-200 ${
                              isDarkMode 
                                ? "border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500" 
                                : "border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                            }`}
                          >
                            <IoClose className="w-5 h-5 mr-2 inline" />
                            Cancel
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleProfileUpdate}
                            disabled={saving}
                            className={`px-6 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg flex items-center ${
                              isDarkMode 
                                ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800" 
                                : "bg-gradient-to-br from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700"
                            }`}
                          >
                            {saving ? (
                              <>
                                <motion.svg
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                  className="w-5 h-5 mr-3"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </motion.svg>
                                Saving...
                              </>
                            ) : (
                              <>
                                <IoSave className="w-5 h-5 mr-2" />
                                Save Changes
                              </>
                            )}
                          </motion.button>
                        </div>
                      )}
                    </div>

                    <form onSubmit={handleProfileUpdate} className="space-y-8">
                      <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                          { label: "Full Name *", name: "name", icon: IoPerson, required: true },
                          { label: "Email Address *", name: "email", icon: IoMail, type: "email", required: true },
                          { label: "Phone Number", name: "phone", icon: IoCall, type: "tel" },
                          { label: "Location", name: "location", icon: IoLocation },
                          { label: "Company", name: "company", icon: IoPerson },
                          { label: "Position", name: "position", icon: IoCalendar },
                        ].map((field, index) => (
                          <motion.div
                            key={field.name}
                            variants={itemVariants}
                            className="space-y-3"
                          >
                            <label className={`block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                              {field.label}
                            </label>
                            <div className="relative">
                              <field.icon className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                                isDarkMode ? "text-gray-400" : "text-gray-500"
                              }`} />
                              <motion.input
                                whileFocus={{ scale: 1.01 }}
                                type={field.type || "text"}
                                value={profileData[field.name]}
                                onChange={(e) =>
                                  setProfileData({
                                    ...profileData,
                                    [field.name]: e.target.value,
                                  })
                                }
                                disabled={!isEditing}
                                required={field.required}
                                className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:ring-2 transition-all duration-200 ${
                                  isDarkMode 
                                    ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20 disabled:bg-gray-600/50" 
                                    : "border-gray-200 bg-white text-gray-900 placeholder-gray-500 focus:border-amber-500 focus:ring-amber-500/20 disabled:bg-gray-50"
                                } disabled:cursor-not-allowed`}
                              />
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>

                      <motion.div variants={itemVariants} className="space-y-3">
                        <label className={`block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                          Bio
                        </label>
                        <motion.textarea
                          whileFocus={{ scale: 1.01 }}
                          value={profileData.bio}
                          onChange={(e) =>
                            setProfileData({ ...profileData, bio: e.target.value })
                          }
                          disabled={!isEditing}
                          rows={4}
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 transition-all duration-200 resize-none ${
                            isDarkMode 
                              ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20 disabled:bg-gray-600/50" 
                              : "border-gray-200 bg-white text-gray-900 placeholder-gray-500 focus:border-amber-500 focus:ring-amber-500/20 disabled:bg-gray-50"
                          } disabled:cursor-not-allowed`}
                          placeholder="Tell us a little about yourself..."
                        />
                      </motion.div>

                      <motion.div variants={itemVariants} className="space-y-3">
                        <label className={`block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                          Website
                        </label>
                        <div className="relative">
                          <IoLocation className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                            isDarkMode ? "text-gray-400" : "text-gray-500"
                          }`} />
                          <motion.input
                            whileFocus={{ scale: 1.01 }}
                            type="url"
                            value={profileData.website}
                            onChange={(e) =>
                              setProfileData({
                                ...profileData,
                                website: e.target.value,
                              })
                            }
                            disabled={!isEditing}
                            className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:ring-2 transition-all duration-200 ${
                              isDarkMode 
                                ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20 disabled:bg-gray-600/50" 
                                : "border-gray-200 bg-white text-gray-900 placeholder-gray-500 focus:border-amber-500 focus:ring-amber-500/20 disabled:bg-gray-50"
                            } disabled:cursor-not-allowed`}
                            placeholder="https://example.com"
                          />
                        </div>
                      </motion.div>
                    </form>

                    {/* Avatar Upload Section */}
                    <AnimatePresence>
                      {avatarFile && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className={`mt-8 p-6 rounded-xl border-2 backdrop-blur-sm ${
                            isDarkMode ? "bg-blue-900/20 border-blue-700" : "bg-blue-50 border-blue-200"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <motion.img
                                whileHover={{ scale: 1.1 }}
                                src={avatarPreview}
                                alt="Preview"
                                className="w-16 h-16 rounded-2xl object-cover shadow-lg"
                              />
                              <div>
                                <p className={`font-semibold ${isDarkMode ? "text-blue-300" : "text-blue-900"}`}>
                                  New avatar selected
                                </p>
                                <p className={`text-sm ${isDarkMode ? "text-blue-400" : "text-blue-700"}`}>
                                  Click upload to save changes
                                </p>
                              </div>
                            </div>
                            <div className="flex space-x-3">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  setAvatarFile(null);
                                  setAvatarPreview(user?.avatar || "");
                                }}
                                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                  isDarkMode 
                                    ? "text-gray-300 hover:text-gray-100" 
                                    : "text-gray-600 hover:text-gray-800"
                                }`}
                              >
                                <IoClose className="w-4 h-4 mr-1 inline" />
                                Cancel
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleAvatarUpload}
                                disabled={saving}
                                className={`px-6 py-2 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg flex items-center ${
                                  isDarkMode 
                                    ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800" 
                                    : "bg-gradient-to-br from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700"
                                }`}
                              >
                                {saving ? (
                                  <>
                                    <motion.svg
                                      animate={{ rotate: 360 }}
                                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                      className="w-5 h-5 mr-3"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                    >
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </motion.svg>
                                    Uploading...
                                  </>
                                ) : (
                                  <>
                                    <IoCloudUpload className="w-5 h-5 mr-2" />
                                    Upload Avatar
                                  </>
                                )}
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}

                {/* Change Password Tab */}
                {activeTab === "password" && (
                  <motion.div
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    className={`rounded-2xl shadow-xl border backdrop-blur-sm p-8 ${
                      isDarkMode ? "bg-gray-800/80 border-gray-700" : "bg-white/80 border-amber-200"
                    }`}
                  >
                    <h3 className={`text-2xl font-bold mb-8 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                      Change Password
                    </h3>

                    <form onSubmit={handlePasswordChange} className="space-y-8 max-w-md">
                      {[
                        { label: "Current Password *", name: "currentPassword", icon: IoLockClosed },
                        { label: "New Password *", name: "newPassword", icon: IoLockClosed },
                        { label: "Confirm New Password *", name: "confirmPassword", icon: IoLockClosed },
                      ].map((field, index) => (
                        <motion.div
                          key={field.name}
                          variants={itemVariants}
                          className="space-y-3"
                        >
                          <label className={`block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                            {field.label}
                          </label>
                          <div className="relative">
                            <field.icon className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                              isDarkMode ? "text-gray-400" : "text-gray-500"
                            }`} />
                            <motion.input
                              whileFocus={{ scale: 1.01 }}
                              type="password"
                              value={passwordData[field.name]}
                              onChange={(e) =>
                                setPasswordData({
                                  ...passwordData,
                                  [field.name]: e.target.value,
                                })
                              }
                              required
                              minLength={6}
                              className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:ring-2 transition-all duration-200 ${
                                isDarkMode 
                                  ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20" 
                                  : "border-gray-200 bg-white text-gray-900 placeholder-gray-500 focus:border-amber-500 focus:ring-amber-500/20"
                              }`}
                            />
                          </div>
                        </motion.div>
                      ))}

                      <motion.button
                        variants={itemVariants}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        disabled={saving}
                        className={`px-8 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg flex items-center ${
                          isDarkMode 
                            ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800" 
                            : "bg-gradient-to-br from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700"
                        }`}
                      >
                        {saving ? (
                          <>
                            <motion.svg
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-5 h-5 mr-3"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </motion.svg>
                            Updating...
                          </>
                        ) : (
                          <>
                            <IoLockClosed className="w-5 h-5 mr-2" />
                            Update Password
                          </>
                        )}
                      </motion.button>
                    </form>
                  </motion.div>
                )}

                {/* Danger Zone Tab */}
                {activeTab === "danger" && (
                  <motion.div
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    className={`rounded-2xl shadow-xl border backdrop-blur-sm p-8 ${
                      isDarkMode ? "bg-gray-800/80 border-gray-700" : "bg-white/80 border-amber-200"
                    }`}
                  >
                    <h3 className={`text-2xl font-bold mb-8 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                      Danger Zone
                    </h3>

                    <motion.div variants={containerVariants} className="space-y-6">
                      <motion.div
                        variants={itemVariants}
                        whileHover="hover"
                        className={`p-6 rounded-xl border-2 backdrop-blur-sm ${
                          isDarkMode ? "bg-red-900/20 border-red-700" : "bg-red-50 border-red-200"
                        }`}
                      >
                        <h4 className={`font-semibold mb-3 flex items-center ${isDarkMode ? "text-red-300" : "text-red-800"}`}>
                          <IoWarning className="w-5 h-5 mr-2" />
                          Delete Account
                        </h4>
                        <p className={`text-sm mb-4 ${isDarkMode ? "text-red-400" : "text-red-700"}`}>
                          Once you delete your account, there is no going back. Please be certain.
                        </p>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleDeleteAccount}
                          className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg flex items-center ${
                            isDarkMode 
                              ? "bg-gradient-to-br from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800" 
                              : "bg-gradient-to-br from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700"
                          }`}
                        >
                          <IoTrash className="w-5 h-5 mr-2" />
                          Delete My Account
                        </motion.button>
                      </motion.div>

                      <motion.div
                        variants={itemVariants}
                        whileHover="hover"
                        className={`p-6 rounded-xl border-2 backdrop-blur-sm ${
                          isDarkMode ? "bg-yellow-900/20 border-yellow-700" : "bg-yellow-50 border-yellow-200"
                        }`}
                      >
                        <h4 className={`font-semibold mb-3 flex items-center ${isDarkMode ? "text-yellow-300" : "text-yellow-800"}`}>
                          <IoDownload className="w-5 h-5 mr-2" />
                          Export Data
                        </h4>
                        <p className={`text-sm mb-4 ${isDarkMode ? "text-yellow-400" : "text-yellow-700"}`}>
                          Download all your personal data in JSON format.
                        </p>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            const dataStr = JSON.stringify(user, null, 2);
                            const dataBlob = new Blob([dataStr], {
                              type: "application/json",
                            });
                            const url = URL.createObjectURL(dataBlob);
                            const link = document.createElement("a");
                            link.href = url;
                            link.download = `user-data-${Date.now()}.json`;
                            link.click();
                          }}
                          className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg flex items-center ${
                            isDarkMode 
                              ? "bg-gradient-to-br from-yellow-600 to-yellow-700 text-white hover:from-yellow-700 hover:to-yellow-800" 
                              : "bg-gradient-to-br from-yellow-500 to-yellow-600 text-white hover:from-yellow-600 hover:to-yellow-700"
                          }`}
                        >
                          <IoCloudUpload className="w-5 h-5 mr-2" />
                          Export My Data
                        </motion.button>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;