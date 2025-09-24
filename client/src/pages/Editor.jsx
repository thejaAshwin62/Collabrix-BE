"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Share2,
  Eye,
  EyeOff,
  Maximize,
  Minimize,
  ArrowLeft,
  Wifi,
  WifiOff,
  Clock,
  Zap,
  Bot,
} from "lucide-react";
import Layout from "../components/Layout";
import AnimatedButton from "../components/AnimatedButton";
import ShareModal from "../components/ShareModal";
import CollaborativeEditor from "../components/CollaborativeEditor";
import { useAuth } from "../context/AuthContext";
import { documentAPI } from "../utils/documentAPI";

const Editor = () => {
  const { docId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const editorRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPresence, setShowPresence] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [lastSaved, setLastSaved] = useState(new Date());
  const [wordCount, setWordCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [useCollaborativeEditor, setUseCollaborativeEditor] = useState(true);
  const [loading, setLoading] = useState(true);

  // Document state
  const [document, setDocument] = useState({
    id: docId || "new",
    title: "Untitled Document",
    content: "",
    lastModified: new Date(),
    owner: null,
    permissions: [],
    collaborators: [], // Will be populated from owner + permissions
  });

  // Real-time presence tracking
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [userPresence, setUserPresence] = useState(new Map());

  // Enhanced user object for collaborative editor
  const collaborativeUser = {
    ...user,
    color: user?.color || "#8B5CF6",
    name: user?.name || "Anonymous",
  };

  // Generate avatar for users without profile pictures
  const generateAvatar = (name, userId) => {
    const colors = ["#a855f7", "#14b8a6", "#f97316", "#ec4899", "#06b6d4"];
    const colorIndex = userId
      ? parseInt(userId.slice(-1), 16) % colors.length
      : 0;
    return {
      color: colors[colorIndex],
      initials: name ? name.charAt(0).toUpperCase() : "U",
    };
  };

  // Convert backend data to collaborator format
  const formatCollaborators = (docData) => {
    const collaborators = [];

    // Add owner as first collaborator
    if (docData.owner) {
      const avatar = generateAvatar(docData.owner.name, docData.owner._id);
      const isOnline = onlineUsers.has(docData.owner._id);
      const presence = userPresence.get(docData.owner._id);

      collaborators.push({
        id: docData.owner._id,
        name: docData.owner.name || docData.owner.username || "Owner",
        email: docData.owner.email,
        avatar: docData.owner.avatar || avatar.initials,
        color: avatar.color,
        role: "owner",
        isActive: isOnline,
        isOnline: isOnline,
        cursor: presence?.cursor || null,
        selection: presence?.selection || null,
        isTyping: presence?.isTyping || false,
        lastSeen: presence?.lastSeen || null,
      });
    }

    // Add users with permissions
    if (docData.permissions && docData.permissions.length > 0) {
      docData.permissions.forEach((permission) => {
        if (permission.user) {
          const avatar = generateAvatar(
            permission.user.name,
            permission.user._id
          );
          const isOnline = onlineUsers.has(permission.user._id);
          const presence = userPresence.get(permission.user._id);

          collaborators.push({
            id: permission.user._id,
            name: permission.user.name || permission.user.username || "User",
            email: permission.user.email,
            avatar: permission.user.avatar || avatar.initials,
            color: avatar.color,
            role: permission.permission, // 'view' or 'edit'
            isActive: isOnline,
            isOnline: isOnline,
            cursor: presence?.cursor || null,
            selection: presence?.selection || null,
            isTyping: presence?.isTyping || false,
            lastSeen: presence?.lastSeen || null,
          });
        }
      });
    }

    return collaborators;
  };

  // Get auth token
  const token = localStorage.getItem("authToken");

  // Load document data
  useEffect(() => {
    const loadDocument = async () => {
      if (docId && docId !== "new") {
        try {
          console.log("Loading document with ID:", docId);
          const result = await documentAPI.getDocumentById(docId);
          if (result.success) {
            console.log("Document loaded successfully:", result.data);
            const collaborators = formatCollaborators(result.data);

            setDocument((prev) => ({
              ...prev,
              id: result.data._id || result.data.id || docId,
              title: result.data.title,
              content: result.data.content,
              lastModified: new Date(result.data.updatedAt),
              owner: result.data.owner,
              permissions: result.data.permissions || [],
              collaborators: collaborators,
            }));
          } else {
            console.error("Failed to load document:", result.error);
          }
        } catch (error) {
          console.error("Failed to load document:", error);
        }
      } else if (docId === "new") {
        console.log("Creating new document");
        setDocument((prev) => ({
          ...prev,
          id: "new",
          title: "Untitled Document",
          content: "",
        }));
      } else {
        console.log("No docId provided");
      }
      setLoading(false);
    };

    loadDocument();
  }, [docId, onlineUsers, userPresence]); // Re-run when presence data changes

  // Real-time presence tracking via WebSocket
  useEffect(() => {
    if (!docId || docId === "new" || !token) return;

    let ws;
    let heartbeatInterval;
    let reconnectTimeout;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    const reconnectDelay = 3000; // 3 seconds

    const connectWebSocket = () => {
      try {
        const wsUrl = `ws://localhost:5000/${docId}?token=${encodeURIComponent(
          token
        )}`;
        console.log("Connecting to WebSocket:", wsUrl);

        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          console.log("WebSocket connected for document:", docId);
          setIsOnline(true);
          reconnectAttempts = 0; // Reset reconnection attempts on successful connection

          // Send presence information
          const presenceData = {
            type: "presence",
            userId: user?.id,
            userName: user?.name || "Anonymous",
            userEmail: user?.email,
            timestamp: Date.now(),
          };

          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(presenceData));
          }

          // Set up heartbeat to maintain connection
          heartbeatInterval = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: "ping", timestamp: Date.now() }));
            }
          }, 30000);
        };

        ws.onmessage = (event) => {
          try {
            // Handle both text and binary messages from Yjs
            if (typeof event.data === "string") {
              const data = JSON.parse(event.data);

              if (data.type === "presence") {
                // Update online users list
                setOnlineUsers((prev) => {
                  const newSet = new Set(prev);
                  if (data.userId && data.userId !== user?.id) {
                    newSet.add(data.userId);
                  }
                  return newSet;
                });

                // Update user presence data
                setUserPresence((prev) => {
                  const newMap = new Map(prev);
                  if (data.userId) {
                    newMap.set(data.userId, {
                      userName: data.userName,
                      userEmail: data.userEmail,
                      isTyping: data.isTyping || false,
                      cursor: data.cursor || null,
                      selection: data.selection || null,
                      lastSeen: data.timestamp || Date.now(),
                    });
                  }
                  return newMap;
                });
              } else if (data.type === "user-disconnected") {
                // Remove user from online list
                setOnlineUsers((prev) => {
                  const newSet = new Set(prev);
                  newSet.delete(data.userId);
                  return newSet;
                });
              }
            }
            // Let Yjs handle binary messages for document sync
          } catch (error) {
            console.warn("Failed to parse WebSocket message:", error);
          }
        };

        ws.onclose = (event) => {
          console.log("WebSocket disconnected:", event.code, event.reason);
          setIsOnline(false);

          // Clear online users when connection is lost
          setOnlineUsers(new Set());
          setUserPresence(new Map());

          if (heartbeatInterval) {
            clearInterval(heartbeatInterval);
          }

          // Attempt to reconnect after delay if not a clean close and haven't exceeded max attempts
          if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            console.log(
              `Attempting to reconnect... (${reconnectAttempts}/${maxReconnectAttempts})`
            );
            reconnectTimeout = setTimeout(() => {
              connectWebSocket();
            }, reconnectDelay * reconnectAttempts); // Exponential backoff
          } else if (reconnectAttempts >= maxReconnectAttempts) {
            console.warn(
              "Max reconnection attempts reached. WebSocket connection failed."
            );
            setIsOnline(false);
          }
        };

        ws.onerror = (error) => {
          console.error("WebSocket error:", error);
          setIsOnline(false);
        };
      } catch (error) {
        console.error("Failed to connect to WebSocket:", error);
        setIsOnline(false);

        // Also attempt reconnection on connection creation failure
        if (reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++;
          console.log(
            `Connection creation failed, retrying... (${reconnectAttempts}/${maxReconnectAttempts})`
          );
          reconnectTimeout = setTimeout(() => {
            connectWebSocket();
          }, reconnectDelay * reconnectAttempts);
        }
      }
    };

    connectWebSocket();

    // Cleanup function
    return () => {
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (ws) {
        ws.close(1000, "Component unmounting");
      }
    };
  }, [docId, token, user?.id, user?.name, user?.email]);

  // Auto-save simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setLastSaved(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleContentChange = (e) => {
    const content = e.target.value;
    setDocument((prev) => ({ ...prev, content }));
    setWordCount(content.split(/\s+/).filter((word) => word.length > 0).length);
    setIsTyping(true);

    // Stop typing indicator after 1 second
    setTimeout(() => setIsTyping(false), 1000);
  };

  const handleTitleChange = (e) => {
    setDocument((prev) => ({ ...prev, title: e.target.value }));
  };

  const handleBackFromCollaborativeEditor = () => {
    setUseCollaborativeEditor(false);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <Layout showSidebar={!isFullscreen}>
      <div
        className={`${
          isFullscreen ? "fixed inset-0 z-50 bg-dark-300" : ""
        } flex h-[calc(100vh-4rem)]`}
      >
        {/* Main Editor */}
        <div className="flex-1 flex flex-col">
          {/* Editor Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-strong border-b border-white/10 p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Back Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/dashboard")}
                  className="p-2 rounded-xl glass hover:bg-white/10 transition-all duration-300"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-400" />
                </motion.button>

                {/* Document Title */}
                <input
                  type="text"
                  value={document.title}
                  onChange={handleTitleChange}
                  className="text-xl font-semibold bg-transparent text-white border-none outline-none focus:text-neon-purple transition-colors"
                  placeholder="Untitled Document"
                />

                {/* Status Indicators */}
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    {isOnline ? (
                      <Wifi className="w-4 h-4 text-green-400" />
                    ) : (
                      <WifiOff className="w-4 h-4 text-red-400" />
                    )}
                    <span className="text-xs text-gray-400">
                      {isOnline ? "Online" : "Offline"}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-400">
                      Saved {formatTime(lastSaved)}
                    </span>
                  </div>

                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center space-x-1"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "linear",
                        }}
                        className="w-3 h-3 border border-neon-purple border-t-transparent rounded-full"
                      />
                      <span className="text-xs text-neon-purple">
                        Typing...
                      </span>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Toolbar */}
              <div className="flex items-center space-x-2">
                {/* Collaborative Editor Toggle */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    setUseCollaborativeEditor(!useCollaborativeEditor)
                  }
                  className={`p-2 rounded-xl transition-all duration-300 ${
                    useCollaborativeEditor
                      ? "bg-neon-purple/20 text-neon-purple"
                      : "glass hover:bg-white/10 text-gray-400"
                  }`}
                  title="Toggle Collaborative Editor"
                >
                  <Zap className="w-5 h-5" />
                </motion.button>

                {/* Presence Toggle */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowPresence(!showPresence)}
                  className={`p-2 rounded-xl transition-all duration-300 ${
                    showPresence
                      ? "bg-neon-purple/20 text-neon-purple"
                      : "glass hover:bg-white/10 text-gray-400"
                  }`}
                >
                  {showPresence ? (
                    <Eye className="w-5 h-5" />
                  ) : (
                    <EyeOff className="w-5 h-5" />
                  )}
                </motion.button>

                {/* AI Assistant */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAI(!showAI)}
                  className={`p-2 rounded-xl transition-all duration-300 ${
                    showAI
                      ? "bg-neon-teal/20 text-neon-teal"
                      : "glass hover:bg-white/10 text-gray-400"
                  }`}
                >
                  <Bot className="w-5 h-5" />
                </motion.button>

                {/* Share */}
                <AnimatedButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowShareModal(true)}
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </AnimatedButton>

                {/* Fullscreen */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleFullscreen}
                  className="p-2 rounded-xl glass hover:bg-white/10 text-gray-400 transition-all duration-300"
                >
                  {isFullscreen ? (
                    <Minimize className="w-5 h-5" />
                  ) : (
                    <Maximize className="w-5 h-5" />
                  )}
                </motion.button>
              </div>
            </div>

            {/* Collaborators Bar */}
            <AnimatePresence>
              {showPresence && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center justify-between mt-4 pt-4 border-t border-white/10"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-400">
                      {document.collaborators.length > 1
                        ? "Collaborating with:"
                        : "Document"}
                    </span>
                    {document.collaborators.length > 0 ? (
                      <div className="flex items-center space-x-2">
                        {document.collaborators.map((collaborator) => (
                          <motion.div
                            key={collaborator.id}
                            whileHover={{ scale: 1.1 }}
                            className="relative group"
                          >
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-white border-2 relative overflow-hidden"
                              style={{
                                backgroundColor: collaborator.color,
                                borderColor: collaborator.isTyping
                                  ? collaborator.color
                                  : "transparent",
                              }}
                            >
                              {/* Always show the first letter as fallback */}
                              <div className="w-full h-full flex items-center justify-center text-white font-bold">
                                {collaborator.name.charAt(0).toUpperCase()}
                              </div>

                              {/* Only show image if it's a valid URL (length > 10) */}
                              {collaborator.avatar &&
                                collaborator.avatar.length > 10 && (
                                  <img
                                    src={collaborator.avatar}
                                    alt={collaborator.name}
                                    className="absolute inset-0 w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.style.display = "none";
                                    }}
                                  />
                                )}
                            </div>

                            {/* Role indicator */}
                            <div
                              className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border border-white ${
                                collaborator.role === "owner"
                                  ? "bg-yellow-400"
                                  : collaborator.role === "edit"
                                  ? "bg-green-400"
                                  : "bg-blue-400"
                              }`}
                            />

                            {/* Online status indicator */}
                            {collaborator.isOnline && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white shadow-sm"
                                title={`${collaborator.name} is online`}
                              >
                                <motion.div
                                  animate={{ opacity: [1, 0.3, 1] }}
                                  transition={{
                                    duration: 2,
                                    repeat: Number.POSITIVE_INFINITY,
                                  }}
                                  className="w-full h-full bg-green-400 rounded-full"
                                />
                              </motion.div>
                            )}

                            {collaborator.isTyping && (
                              <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{
                                  duration: 1,
                                  repeat: Number.POSITIVE_INFINITY,
                                }}
                                className="absolute -bottom-1 -left-1 w-3 h-3 bg-orange-400 rounded-full border border-white"
                                title={`${collaborator.name} is typing...`}
                              />
                            )}

                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 border border-white/20">
                              <div className="font-medium">
                                {collaborator.name}
                              </div>
                              <div className="text-gray-300 capitalize">
                                {collaborator.role}
                              </div>
                              <div
                                className={`flex items-center space-x-1 mt-1 ${
                                  collaborator.isOnline
                                    ? "text-green-400"
                                    : "text-gray-500"
                                }`}
                              >
                                <div
                                  className={`w-2 h-2 rounded-full ${
                                    collaborator.isOnline
                                      ? "bg-green-400"
                                      : "bg-gray-500"
                                  }`}
                                />
                                <span>
                                  {collaborator.isOnline ? "Online" : "Offline"}
                                </span>
                              </div>
                              {collaborator.isTyping && (
                                <div className="text-orange-400 mt-1">
                                  Currently typing...
                                </div>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">
                        No collaborators
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span>{wordCount} words</span>
                    <span>{document.content.length} characters</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Editor Content */}
          <div className="flex-1 relative">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}
                    className="w-8 h-8 border-2 border-neon-purple border-t-transparent rounded-full mx-auto mb-4"
                  />
                  <p className="text-gray-400">Loading document...</p>
                </div>
              </div>
            ) : useCollaborativeEditor &&
              docId &&
              docId !== "new" &&
              token &&
              user ? (
              /* Collaborative Editor */
              <div className="h-full">
                <CollaborativeEditor
                  docId={docId}
                  token={token}
                  user={collaborativeUser}
                  document={document}
                  onBack={handleBackFromCollaborativeEditor}
                />
              </div>
            ) : (
              /* Fallback Traditional Editor */
              <>
                {/* Collaborative Cursors */}
                <AnimatePresence>
                  {showPresence &&
                    document.collaborators.map((collaborator) => (
                      <motion.div
                        key={collaborator.id}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        className="absolute pointer-events-none z-10"
                        style={{
                          left: collaborator.cursor.x,
                          top: collaborator.cursor.y,
                        }}
                      >
                        <div className="flex items-center space-x-1">
                          <div
                            className="w-0.5 h-6 animate-pulse"
                            style={{ backgroundColor: collaborator.color }}
                          />
                          <div
                            className="px-2 py-1 rounded text-xs text-white font-medium"
                            style={{ backgroundColor: collaborator.color }}
                          >
                            {collaborator.name}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </AnimatePresence>

                {/* Main Text Area */}
                <textarea
                  ref={editorRef}
                  value={document.content}
                  onChange={handleContentChange}
                  placeholder="Start writing your document..."
                  className="w-full h-full p-8 bg-transparent text-white placeholder-gray-500 border-none outline-none resize-none font-mono text-lg leading-relaxed"
                  style={{ minHeight: "calc(100vh - 200px)" }}
                />

                {/* Selection Highlights */}
                {showPresence &&
                  document.collaborators
                    .filter((c) => c.selection)
                    .map((collaborator) => (
                      <motion.div
                        key={`selection-${collaborator.id}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.3 }}
                        className="absolute pointer-events-none"
                        style={{
                          backgroundColor: collaborator.color,
                          // This would need proper text selection positioning in a real implementation
                          left: "200px",
                          top: "300px",
                          width: "150px",
                          height: "24px",
                        }}
                      />
                    ))}
              </>
            )}
          </div>
        </div>

        {/* AI Assistant Sidebar */}
        <AnimatePresence>
          {showAI && (
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className="w-80 glass-strong border-l border-white/10 flex flex-col"
            >
              {/* AI Header */}
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-neon-teal to-neon-purple flex items-center justify-center">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      AI Assistant
                    </h3>
                    <p className="text-sm text-gray-400">Writing companion</p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="p-3 glass rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300"
                  >
                    <Zap className="w-4 h-4 mb-1 mx-auto" />
                    Improve
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="p-3 glass rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300"
                  >
                    <Bot className="w-4 h-4 mb-1 mx-auto" />
                    Summarize
                  </motion.button>
                </div>
              </div>

              {/* AI Chat */}
              <div className="flex-1 p-4">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-neon-teal to-neon-purple flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 glass rounded-xl p-3">
                      <p className="text-sm text-gray-300">
                        Hi! I'm your AI writing assistant. I can help you
                        improve your writing, fix grammar, or generate new
                        content. What would you like me to help with?
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Input */}
              <div className="p-4 border-t border-white/10">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Ask AI anything..."
                    className="flex-1 input-field"
                  />
                  <AnimatedButton variant="primary" size="sm">
                    Send
                  </AnimatedButton>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        document={document}
        onDocumentUpdated={setDocument}
      />
    </Layout>
  );
};

export default Editor;
