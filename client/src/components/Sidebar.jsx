"use client";

import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Home,
  FileText,
  Users,
  Activity,
  Bot,
  Share2,
  Settings,
  Plus,
  Folder,
  Star,
  Search,
  Shield,
} from "lucide-react";
import { documentAPI } from "../utils/documentAPI";
import CreateDocumentModal from "./CreateDocumentModal";

const Sidebar = ({ refreshTrigger = 0 }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [recentDocs, setRecentDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: "/dashboard", icon: Home, label: "Dashboard" },
    { path: "/join", icon: Search, label: "Join Document" },
    { path: "/shared", icon: Share2, label: "Shared Docs" },
    { path: "/access-requests", icon: Shield, label: "Access Requests" },
    { path: "/activity", icon: Activity, label: "Activity" },
    { path: "/ai", icon: Bot, label: "AI Assistant" },
  ];

  // Fetch recent documents
  useEffect(() => {
    const fetchRecentDocuments = async () => {
      try {
        const result = await documentAPI.getDocuments();
        if (result.success) {
          // Sort by updatedAt (most recent first) and take only the first 5
          const sortedDocs = result.data
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            .slice(0, 5)
            .map((doc) => ({
              id: doc._id,
              title: doc.title,
              type: "document",
              starred: false, // We can add a starred field to the model later
              updatedAt: doc.updatedAt,
            }));
          setRecentDocs(sortedDocs);
        }
      } catch (error) {
        console.error("Failed to fetch recent documents:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentDocuments();
  }, [refreshTrigger]); // Re-fetch when refreshTrigger changes

  // Handle document creation
  const handleDocumentCreated = () => {
    setShowCreateModal(false);
    // Refresh the recent documents list
    const fetchRecentDocuments = async () => {
      try {
        const result = await documentAPI.getDocuments();
        if (result.success) {
          const sortedDocs = result.data
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            .slice(0, 5)
            .map((doc) => ({
              id: doc._id,
              title: doc.title,
              type: "document",
              starred: false,
              updatedAt: doc.updatedAt,
            }));
          setRecentDocs(sortedDocs);
        }
      } catch (error) {
        console.error("Failed to refresh recent documents:", error);
      }
    };
    fetchRecentDocuments();
  };

  return (
    <motion.aside
      initial={{ x: -300 }}
      animate={{ x: 0, width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed left-0 top-0 h-screen glass-strong border-r border-white/10 z-30"
    >
      <div className="flex flex-col h-full p-4 pt-20">
        {/* Toggle Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-22 w-6 h-6 glass rounded-full flex items-center justify-center border border-white/20 hover:bg-white/10 transition-all duration-300"
        >
          {isCollapsed ? (
            <ChevronRight className="w-3 h-3" />
          ) : (
            <ChevronLeft className="w-3 h-3" />
          )}
        </motion.button>

        {/* Create New Button */}
        <motion.button
          whileHover={{
            scale: 1.02,
            boxShadow: "0 0 30px rgba(139, 92, 246, 0.4)",
          }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCreateModal(true)}
          className={`
            relative overflow-hidden rounded-2xl p-4 mb-6 
            bg-gradient-to-r from-neon-purple via-neon-purple/90 to-neon-teal
            border border-neon-purple/30 backdrop-blur-sm
            text-white font-semibold transition-all duration-300
            hover:from-neon-purple/90 hover:to-neon-teal/90
            shadow-lg shadow-neon-purple/25 hover:shadow-xl hover:shadow-neon-purple/40
            flex items-center justify-center space-x-2
            group focus:outline-none focus:ring-2 focus:ring-neon-purple/50
            ${isCollapsed ? "w-12 h-12" : "w-full"}
          `}
        >
          {/* Animated background glow */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{
              repeat: Infinity,
              duration: 2.5,
              repeatDelay: 2,
              ease: "linear",
            }}
          />

          <motion.div
            className="flex items-center space-x-2 relative z-10"
            animate={isCollapsed ? {} : { x: [0, 2, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
          >
            <Plus className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="font-semibold text-sm tracking-wide whitespace-nowrap"
                >
                  New Document
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Ripple effect on hover */}
          <motion.div
            className="absolute inset-0 rounded-2xl"
            initial={{ scale: 0, opacity: 0.5 }}
            whileHover={{
              scale: 1.1,
              opacity: 0,
              transition: { duration: 0.6 },
            }}
            style={{
              background:
                "radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)",
            }}
          />
        </motion.button>

        {/* Navigation */}
        <nav className="space-y-2 mb-8">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path}>
              <motion.div
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-300 ${
                  location.pathname === item.path
                    ? "bg-neon-purple/20 text-neon-purple border border-neon-purple/30"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="font-medium truncate"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          ))}
        </nav>

        {/* Recent Documents */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex-1 overflow-hidden"
            >
              <h3 className="text-sm font-semibold text-gray-400 mb-3 px-3">
                Recent Documents
              </h3>
              <div className="space-y-1 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center p-4">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear",
                      }}
                      className="w-4 h-4 border-2 border-neon-purple border-t-transparent rounded-full"
                    />
                  </div>
                ) : recentDocs.length > 0 ? (
                  recentDocs.map((doc) => (
                    <Link key={doc.id} to={`/editor/${doc.id}`}>
                      <motion.div
                        whileHover={{ x: 5 }}
                        className="flex items-center space-x-3 p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-300 cursor-pointer"
                      >
                        {doc.type === "folder" ? (
                          <Folder className="w-4 h-4 flex-shrink-0 text-neon-teal" />
                        ) : (
                          <FileText className="w-4 h-4 flex-shrink-0 text-gray-400" />
                        )}
                        <span className="text-sm truncate flex-1">
                          {doc.title}
                        </span>
                        {doc.starred && (
                          <Star className="w-3 h-3 text-neon-orange fill-current flex-shrink-0" />
                        )}
                      </motion.div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center p-4">
                    <p className="text-xs text-gray-500">No recent documents</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Settings */}
        <Link to="/profile">
          <motion.div
            whileHover={{ x: 5 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center space-x-3 p-3 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300 mt-auto"
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="font-medium"
                >
                  Settings
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        </Link>
      </div>

      {/* Create Document Modal */}
      <CreateDocumentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onDocumentCreated={handleDocumentCreated}
      />
    </motion.aside>
  );
};

export default Sidebar;
