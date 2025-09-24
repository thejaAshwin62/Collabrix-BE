"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Settings,
  Bell,
  Shield,
  Palette,
  Monitor,
  Moon,
  Sun,
  Globe,
  Save,
  Camera,
  Edit3,
  Award,
  FileText,
  Users,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import Layout from "../components/Layout";
import FormInput from "../components/FormInput";
import AnimatedButton from "../components/AnimatedButton";
import { useAuth } from "../context/AuthContext";
import { documentAPI } from "../utils/documentAPI";
import { useTheme } from "../context/ThemeContext";

const Profile = () => {
  const { user } = useAuth();
  const { theme, accentColor, toggleTheme, changeAccentColor } = useTheme();
  const [activeTab, setActiveTab] = useState("profile"); // 'profile', 'preferences', 'security', 'notifications'
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    website: "",
    company: "",
    role: "",
    joinDate: "",
  });

  const [preferences, setPreferences] = useState({
    language: "en",
    timezone: "America/Los_Angeles",
    dateFormat: "MM/DD/YYYY",
    autoSave: true,
    collaboratorCursors: true,
    soundNotifications: false,
    emailDigest: "weekly",
  });

  const [stats, setStats] = useState([
    {
      label: "Documents Created",
      value: 0,
      icon: FileText,
      color: "text-neon-purple",
      change: "",
    },
    {
      label: "Collaborations",
      value: 0,
      icon: Users,
      color: "text-neon-teal",
      change: "",
    },
    {
      label: "Hours Active",
      value: "0h",
      icon: Clock,
      color: "text-neon-orange",
      change: "",
    },
    {
      label: "Achievement Score",
      value: 0,
      icon: Award,
      color: "text-neon-pink",
      change: "",
    },
  ]);

  // Load user profile and stats on component mount
  useEffect(() => {
    loadUserProfile();
    loadUserStats();
  }, []);

  const loadUserProfile = async () => {
    try {
      const response = await documentAPI.getUserProfile();
      if (response.success) {
        const profile = response.data;
        setProfileData({
          name: profile.name || user?.name || "",
          email: profile.email || user?.email || "",
          phone: profile.phone || "",
          location: profile.location || "",
          bio: profile.bio || "",
          website: profile.website || "",
          company: profile.company || "",
          role: profile.role || "",
          joinDate: profile.createdAt
            ? new Date(profile.createdAt).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })
            : "",
        });

        // Update preferences if they exist in the profile
        if (profile.preferences) {
          setPreferences((prev) => ({
            ...prev,
            ...profile.preferences,
          }));
        }
      }
    } catch (error) {
      toast.error("Failed to load profile data");
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserStats = async () => {
    try {
      console.log("Loading user stats...");
      const response = await documentAPI.getUserStats();
      console.log("Stats response:", response);

      if (response.success) {
        const statsData = response.data;
        setStats([
          {
            label: "Documents Created",
            value: statsData.totalDocuments || 0,
            icon: FileText,
            color: "text-neon-purple",
            change: statsData.documentsThisMonth
              ? `+${statsData.documentsThisMonth} this month`
              : statsData.documentsThisMonth === 0
              ? "0 this month"
              : "",
          },
          {
            label: "Collaborations",
            value: statsData.totalCollaborations || 0,
            icon: Users,
            color: "text-neon-teal",
            change: statsData.collaborationsThisMonth
              ? `+${statsData.collaborationsThisMonth} this month`
              : statsData.collaborationsThisMonth === 0
              ? "0 this month"
              : "",
          },
          {
            label: "Hours Active",
            value: `${statsData.hoursActiveThisWeek || 0}h`,
            icon: Clock,
            color: "text-neon-orange",
            change: "this week",
          },
          {
            label: "Achievement Score",
            value: statsData.achievementScore || 0,
            icon: Award,
            color: "text-neon-pink",
            change: statsData.scoreThisMonth
              ? `+${statsData.scoreThisMonth} this month`
              : statsData.scoreThisMonth === 0
              ? "0 this month"
              : "",
          },
        ]);
      } else {
        console.error("Failed to load stats:", response.error);
        toast.error("Failed to load statistics");
      }
    } catch (error) {
      console.error("Failed to load user stats:", error);
      toast.error("Failed to load statistics");
    }
  };

  const accentColors = [
    { name: "Purple", value: "purple", color: "#a855f7" },
    { name: "Teal", value: "teal", color: "#14b8a6" },
    { name: "Orange", value: "orange", color: "#f97316" },
    { name: "Pink", value: "pink", color: "#ec4899" },
    { name: "Cyan", value: "cyan", color: "#06b6d4" },
  ];

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "preferences", label: "Preferences", icon: Settings },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePreferenceChange = async (key, value) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));

    // Auto-save preferences
    try {
      const updateData = {
        preferences: { ...preferences, [key]: value },
      };

      const response = await documentAPI.updateUserProfile(updateData);
      if (response.success) {
        toast.success("Preference updated!");
      } else {
        // Revert the change if save failed
        setPreferences((prev) => ({ ...prev, [key]: !value }));
        toast.error("Failed to save preference");
      }
    } catch (error) {
      // Revert the change if save failed
      setPreferences((prev) => ({ ...prev, [key]: !value }));
      toast.error("Failed to save preference");
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updateData = {
        ...profileData,
        preferences: preferences,
      };

      const response = await documentAPI.updateUserProfile(updateData);
      if (response.success) {
        toast.success("Profile updated successfully!");
        setIsEditing(false);
        // Reload profile to get updated data
        await loadUserProfile();
      } else {
        toast.error(response.error || "Failed to update profile");
      }
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const renderProfileTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Profile Header */}
      <div className="glass rounded-2xl p-6 border border-white/10">
        <div className="flex items-center space-x-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-r from-neon-purple to-neon-teal flex items-center justify-center text-2xl font-bold text-white">
              {profileData.name.charAt(0)}
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute -bottom-2 -right-2 w-8 h-8 bg-neon-purple rounded-full flex items-center justify-center text-white hover:bg-neon-teal transition-colors"
            >
              <Camera className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Basic Info */}
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h2 className="text-2xl font-bold text-white">
                {profileData.name}
              </h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsEditing(!isEditing)}
                className="p-2 rounded-lg glass hover:bg-white/10 text-gray-400 hover:text-white transition-all duration-300"
              >
                <Edit3 className="w-4 h-4" />
              </motion.button>
            </div>
            <p className="text-gray-400 mb-1">
              {profileData.role} at {profileData.company}
            </p>
            <p className="text-sm text-gray-500 flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>Joined {profileData.joinDate}</span>
            </p>
          </div>

          {/* Action Button */}
          <div>
            {isEditing && (
              <AnimatedButton
                variant="primary"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </AnimatedButton>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="glass rounded-2xl p-6 border border-white/10"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-white/10 ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
              <p className="text-xs text-green-400">{stat.change}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Profile Form */}
      <div className="glass rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl font-semibold text-white mb-6">
          Personal Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            label="Full Name"
            name="name"
            value={profileData.name}
            onChange={handleInputChange}
            icon={User}
            disabled={!isEditing}
          />
          <FormInput
            label="Email Address"
            name="email"
            type="email"
            value={profileData.email}
            onChange={handleInputChange}
            icon={Mail}
            disabled={!isEditing}
          />
          <FormInput
            label="Phone Number"
            name="phone"
            value={profileData.phone}
            onChange={handleInputChange}
            icon={Phone}
            disabled={!isEditing}
          />
          <FormInput
            label="Location"
            name="location"
            value={profileData.location}
            onChange={handleInputChange}
            icon={MapPin}
            disabled={!isEditing}
          />
          <FormInput
            label="Website"
            name="website"
            value={profileData.website}
            onChange={handleInputChange}
            icon={Globe}
            disabled={!isEditing}
            className="md:col-span-2"
          />
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Bio
          </label>
          <textarea
            name="bio"
            value={profileData.bio}
            onChange={handleInputChange}
            disabled={!isEditing}
            className={`
              w-full h-24 resize-none rounded-2xl border transition-all duration-300 outline-none p-4
              ${
                !isEditing
                  ? "bg-white/5 border-white/10 text-gray-400 cursor-not-allowed"
                  : "bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30 focus:bg-white/10 focus:border-neon-purple/50 focus:shadow-lg focus:shadow-neon-purple/20"
              }
              backdrop-blur-md
            `}
            placeholder="Tell us about yourself..."
          />
        </div>
      </div>
    </motion.div>
  );

  const renderPreferencesTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Theme Settings */}
      <div className="glass rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
          <Palette className="w-6 h-6 text-neon-purple" />
          <span>Appearance</span>
        </h3>

        <div className="space-y-6">
          {/* Theme Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Theme</p>
              <p className="text-sm text-gray-400">
                Choose your preferred theme
              </p>
            </div>
            <div className="flex items-center space-x-2 glass rounded-xl p-1">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleTheme}
                className={`p-3 rounded-lg transition-all duration-300 ${
                  theme === "dark"
                    ? "bg-neon-purple text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Moon className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleTheme}
                className={`p-3 rounded-lg transition-all duration-300 ${
                  theme === "light"
                    ? "bg-neon-orange text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Sun className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          {/* Accent Color */}
          <div>
            <p className="text-white font-medium mb-3">Accent Color</p>
            <div className="flex items-center space-x-3">
              {accentColors.map((color) => (
                <motion.button
                  key={color.value}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => changeAccentColor(color.value)}
                  className={`w-10 h-10 rounded-xl border-2 transition-all duration-300 ${
                    accentColor === color.value
                      ? "border-white scale-110"
                      : "border-transparent"
                  }`}
                  style={{ backgroundColor: color.color }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Editor Preferences */}
      <div className="glass rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
          <Monitor className="w-6 h-6 text-neon-teal" />
          <span>Editor Preferences</span>
        </h3>

        <div className="space-y-4">
          {[
            {
              key: "autoSave",
              label: "Auto-save documents",
              description: "Automatically save changes as you type",
            },
            {
              key: "collaboratorCursors",
              label: "Show collaborator cursors",
              description: "Display real-time cursors of other users",
            },
            {
              key: "soundNotifications",
              label: "Sound notifications",
              description: "Play sounds for notifications and alerts",
            },
          ].map((pref) => (
            <div key={pref.key} className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">{pref.label}</p>
                <p className="text-sm text-gray-400">{pref.description}</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  handlePreferenceChange(pref.key, !preferences[pref.key])
                }
                className={`w-12 h-6 rounded-full transition-all duration-300 ${
                  preferences[pref.key] ? "bg-neon-purple" : "bg-gray-600"
                }`}
              >
                <motion.div
                  animate={{ x: preferences[pref.key] ? 24 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-6 h-6 bg-white rounded-full shadow-lg"
                />
              </motion.button>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  return (
    <Layout>
      <div className="h-screen overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Loading State */}
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Header Skeleton */}
              <div className="space-y-4">
                <div className="h-8 bg-white/10 rounded-lg w-64 animate-pulse"></div>
                <div className="h-4 bg-white/5 rounded w-96 animate-pulse"></div>
              </div>

              {/* Profile Card Skeleton */}
              <div className="glass rounded-2xl p-6 border border-white/10">
                <div className="flex items-center space-x-6">
                  <div className="w-24 h-24 bg-white/10 rounded-2xl animate-pulse"></div>
                  <div className="space-y-3 flex-1">
                    <div className="h-6 bg-white/10 rounded w-48 animate-pulse"></div>
                    <div className="h-4 bg-white/5 rounded w-64 animate-pulse"></div>
                    <div className="h-4 bg-white/5 rounded w-32 animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* Stats Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="glass rounded-2xl p-6 border border-white/10"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-white/10 rounded-xl animate-pulse"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-6 bg-white/10 rounded w-16 animate-pulse"></div>
                      <div className="h-4 bg-white/5 rounded w-24 animate-pulse"></div>
                      <div className="h-3 bg-white/5 rounded w-20 animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <>
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0"
              >
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    Profile Settings
                  </h1>
                  <p className="text-gray-400">
                    Manage your account settings and preferences.
                  </p>
                </div>
              </motion.div>

              {/* Tabs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex space-x-1 glass rounded-xl p-1 w-fit"
              >
                {tabs.map((tab) => (
                  <motion.button
                    key={tab.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                      activeTab === tab.id
                        ? "bg-neon-purple text-white"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </motion.button>
                ))}
              </motion.div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                {activeTab === "profile" && renderProfileTab()}
                {activeTab === "preferences" && renderPreferencesTab()}
                {activeTab === "security" && (
                  <motion.div
                    key="security"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-2xl p-6 border border-white/10"
                  >
                    <h3 className="text-xl font-semibold text-white mb-6">
                      Security Settings
                    </h3>
                    <p className="text-gray-400">
                      Security features coming soon...
                    </p>
                  </motion.div>
                )}
                {activeTab === "notifications" && (
                  <motion.div
                    key="notifications"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-2xl p-6 border border-white/10"
                  >
                    <h3 className="text-xl font-semibold text-white mb-6">
                      Notification Settings
                    </h3>
                    <p className="text-gray-400">
                      Notification preferences coming soon...
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
