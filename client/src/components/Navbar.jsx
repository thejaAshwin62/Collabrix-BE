"use client";

import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Home,
  FileText,
  Users,
  Activity,
  User,
  Bot,
  Share2,
  LogOut,
  Bell,
  Search,
  Settings,
  ChevronDown,
  Trash2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { documentAPI } from "../utils/documentAPI";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notificationsCleared, setNotificationsCleared] = useState(false);
  const userDropdownRef = useRef(null);
  const notificationsRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  const navItems = [
    { path: "/dashboard", icon: Home, label: "Dashboard" },
    { path: "/join", icon: Search, label: "Join" },
    { path: "/shared", icon: Share2, label: "Shared" },
    { path: "/activity", icon: Activity, label: "Activity" },
    { path: "/ai", icon: Bot, label: "AI Assistant" },
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target)
      ) {
        setShowUserDropdown(false);
      }
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Load notifications when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
      // Set up periodic refresh for real-time updates
      const interval = setInterval(loadNotifications, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Load notifications from user activity
  const loadNotifications = async () => {
    if (!isAuthenticated) return;

    try {
      setLoadingNotifications(true);
      const response = await documentAPI.getUserActivity(10, 0); // Get latest 10 activities

      if (response.success && response.data) {
        const activities = response.data.activities || [];
        console.log("Raw activities data:", activities); // Debug log

        // Convert activities to notifications
        const notificationList = activities.map((activity) => {
          console.log("Processing activity:", activity); // Debug log
          return {
            id: activity.id,
            title: formatNotificationTitle(activity),
            message: activity.details || formatNotificationMessage(activity),
            timestamp:
              activity.timestamp ||
              activity.createdAt ||
              activity.updatedAt ||
              new Date().toISOString(),
            type: activity.type,
            targetId: activity.targetId,
            isRead: false, // TODO: Implement read status
          };
        });

        setNotifications(notificationList);
        setNotificationCount(notificationList.length);

        // Reset cleared state if new notifications arrive
        if (notificationList.length > 0 && notificationsCleared) {
          setNotificationsCleared(false);
        }
      }
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  // Format notification title based on activity type
  const formatNotificationTitle = (activity) => {
    switch (activity.type) {
      case "document_created":
        return `New document "${activity.target}" created`;
      case "document_edited":
        return `Document "${activity.target}" was updated`;
      case "collaboration_invited":
        return activity.action.includes("invited you")
          ? `Invited to collaborate on "${activity.target}"`
          : `New collaborator on "${activity.target}"`;
      case "access_request":
        return `Access requested for "${activity.target}"`;
      default:
        return `${activity.user} ${activity.action} ${activity.target}`;
    }
  };

  // Format notification message
  const formatNotificationMessage = (activity) => {
    switch (activity.type) {
      case "document_created":
        return `by ${activity.user}`;
      case "document_edited":
        return `by ${activity.user}`;
      case "collaboration_invited":
        return activity.action.includes("invited you")
          ? `by ${activity.user}`
          : `${activity.user} added a collaborator`;
      case "access_request":
        return `by ${activity.user}`;
      default:
        return activity.details || `by ${activity.user}`;
    }
  };

  // Format relative time
  const formatRelativeTime = (timestamp) => {
    try {
      if (!timestamp) return "Unknown time";

      const now = new Date();
      const time = new Date(timestamp);

      // Check if the date is valid
      if (isNaN(time.getTime())) {
        console.warn("Invalid timestamp received:", timestamp);
        return "Recently";
      }

      const diff = now - time;

      const minutes = Math.floor(diff / (1000 * 60));
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));

      if (minutes < 1) return "Just now";
      if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
      if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
      if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;

      return time.toLocaleDateString();
    } catch (error) {
      console.error("Error formatting timestamp:", error);
      return "Recently";
    }
  };

  // Clear notifications (without removing from Activity)
  const clearNotifications = () => {
    setNotifications([]);
    setNotificationCount(0);
    setNotificationsCleared(true);

    // Reset cleared state after 3 seconds
    setTimeout(() => {
      setNotificationsCleared(false);
    }, 3000);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
      setShowUserDropdown(false);
    } catch (error) {
      console.error("Logout error:", error);
      // Still navigate to login page even if logout fails
      navigate("/");
      setShowUserDropdown(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <>
      {/* Desktop Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center space-x-2">
              <span className="text-xl font-bold text-gradient">Collabrix</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link key={item.path} to={item.path}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                      location.pathname === item.path
                        ? "bg-neon-purple/20 text-neon-purple border border-neon-purple/30"
                        : "text-gray-300 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </motion.div>
                </Link>
              ))}
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative" ref={notificationsRef}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    if (!showNotifications) {
                      loadNotifications(); // Refresh when opening
                    }
                  }}
                  className="p-2 rounded-xl glass hover:bg-white/10 transition-all duration-300 relative"
                >
                  <Bell className="w-5 h-5 text-gray-300" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-neon-orange rounded-full flex items-center justify-center text-xs font-semibold text-white animate-pulse">
                      {notificationCount > 9 ? "9+" : notificationCount}
                    </span>
                  )}
                </motion.button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-96 bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-white/20 p-4 shadow-2xl shadow-black/50 ring-1 ring-neon-purple/10"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">
                          Notifications
                        </h3>
                        <div className="flex items-center space-x-2">
                          {notifications.length > 0 && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={clearNotifications}
                              className="flex items-center space-x-1 px-2 py-1.5 rounded-lg glass hover:bg-white/10 text-gray-400 hover:text-red-400 transition-all duration-300 group text-xs font-medium"
                              title="Clear notifications"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Clear</span>
                            </motion.button>
                          )}
                          {loadingNotifications && (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{
                                duration: 1,
                                repeat: Number.POSITIVE_INFINITY,
                                ease: "linear",
                              }}
                              className="w-4 h-4 border-2 border-neon-purple border-t-transparent rounded-full"
                            />
                          )}
                        </div>
                      </div>

                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((notification) => (
                            <motion.div
                              key={notification.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="p-3 rounded-xl bg-white/10 border border-white/10 hover:bg-white/15 transition-all duration-200 cursor-pointer"
                              onClick={() => {
                                if (notification.targetId) {
                                  navigate(`/editor/${notification.targetId}`);
                                  setShowNotifications(false);
                                }
                              }}
                            >
                              <p className="text-sm text-gray-300 font-medium">
                                {notification.title}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 mt-2">
                                {formatRelativeTime(notification.timestamp)}
                              </p>
                            </motion.div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <Bell className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                            <p className="text-gray-400 text-sm">
                              {loadingNotifications
                                ? "Loading..."
                                : notificationsCleared
                                ? "Notifications cleared"
                                : "No notifications yet"}
                            </p>
                            <p className="text-gray-500 text-xs mt-1">
                              {loadingNotifications
                                ? ""
                                : notificationsCleared
                                ? "Visit Activity page to see all your activity"
                                : "Activity will appear here when you collaborate with others"}
                            </p>
                          </div>
                        )}
                      </div>

                      {notifications.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-white/10">
                          <Link
                            to="/activity"
                            onClick={() => setShowNotifications(false)}
                            className="text-sm text-neon-purple hover:text-neon-teal transition-colors duration-200 font-medium"
                          >
                            View all activity →
                          </Link>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Menu */}
              <div className="relative" ref={userDropdownRef}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center space-x-2 p-2 rounded-xl glass hover:bg-white/10 transition-all duration-300"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-neon-purple to-neon-teal flex items-center justify-center">
                    <span className="text-sm font-semibold text-white">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                  <div className="hidden sm:flex items-center space-x-1">
                    <span className="text-sm font-medium text-white">
                      {user?.name || "User"}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                        showUserDropdown ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </motion.button>

                {/* User Dropdown */}
                <AnimatePresence>
                  {showUserDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-64 bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-white/20 p-2 shadow-2xl shadow-black/50 ring-1 ring-neon-purple/10"
                    >
                      {/* User Info */}
                      <div className="p-3 border-b border-white/10">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-neon-purple to-neon-teal flex items-center justify-center">
                            <span className="text-lg font-bold text-white">
                              {user?.name?.charAt(0).toUpperCase() || "U"}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-white">
                              {user?.name || "User"}
                            </p>
                            <p className="text-sm text-gray-400">
                              {user?.email || "user@example.com"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <Link
                          to="/profile"
                          onClick={() => setShowUserDropdown(false)}
                        >
                          <motion.div
                            whileHover={{ x: 4 }}
                            className="flex items-center space-x-3 p-3 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200"
                          >
                            <User className="w-5 h-5" />
                            <span className="font-medium">Profile</span>
                          </motion.div>
                        </Link>

                        <Link
                          to="/settings"
                          onClick={() => setShowUserDropdown(false)}
                        >
                          {/* <motion.div
                            whileHover={{ x: 4 }}
                            className="flex items-center space-x-3 p-3 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200"
                          >
                            <Settings className="w-5 h-5" />
                            <span className="font-medium">Settings</span>
                          </motion.div> */}
                        </Link>

                        <div className="border-t border-white/10 my-2"></div>

                        <motion.button
                          whileHover={{ x: 4 }}
                          onClick={handleLogout}
                          className="flex items-center space-x-3 p-3 rounded-xl text-gray-300 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 w-full"
                        >
                          <LogOut className="w-5 h-5" />
                          <span className="font-medium">Logout</span>
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Menu Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden p-2 rounded-xl glass hover:bg-white/10 transition-all duration-300"
              >
                {isOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            className="fixed inset-0 z-40 md:hidden"
          >
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            <motion.div className="fixed right-0 top-0 h-full w-80 bg-gray-900/95 backdrop-blur-xl border-l border-white/20 p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <span className="text-xl font-bold text-gradient">Menu</span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl hover:bg-white/10 text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                  >
                    <motion.div
                      whileHover={{ x: 10 }}
                      className={`flex items-center space-x-3 p-4 rounded-xl transition-all duration-300 ${
                        location.pathname === item.path
                          ? "bg-neon-purple/20 text-neon-purple border border-neon-purple/30"
                          : "text-gray-300 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </motion.div>
                  </Link>
                ))}

                <hr className="border-white/10 my-6" />

                <Link to="/profile" onClick={() => setIsOpen(false)}>
                  <motion.div
                    whileHover={{ x: 10 }}
                    className="flex items-center space-x-3 p-4 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300"
                  >
                    <User className="w-5 h-5" />
                    <span className="font-medium">Profile</span>
                  </motion.div>
                </Link>

                <motion.button
                  whileHover={{ x: 10 }}
                  onClick={handleLogout}
                  className="flex items-center space-x-3 p-4 rounded-xl text-gray-300 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 w-full"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
