"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Share2,
  MessageSquare,
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
  Save,
  Users,
  Settings,
} from "lucide-react";
import Layout from "../components/Layout";
import AnimatedButton from "../components/AnimatedButton";
import { useAuth } from "../context/AuthContext";
import { documentAPI } from "../utils/documentAPI";

const Editor = () => {
  const { docId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const editorRef = useRef(null);
  const wsRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showComments, setShowComments] = useState(true);
  const [showPresence, setShowPresence] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [wordCount, setWordCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Document state
  const [document, setDocument] = useState({
    id: docId,
    title: "Loading...",
    content: "",
    owner: null,
    userPermission: "view",
    lastModified: new Date(),
    collaborators: [],
  });

  // Connected users state
  const [connectedUsers, setConnectedUsers] = useState([]);

  // Fetch document data
  useEffect(() => {
    if (!docId || !user) return;

    const fetchDocument = async () => {
      setLoading(true);
      try {
        const result = await documentAPI.getDocumentById(docId);
        if (result.success) {
          setDocument({
            id: result.data._id,
            title: result.data.title,
            content: result.data.content || "",
            owner: result.data.owner,
            userPermission: result.data.userPermission,
            lastModified: new Date(result.data.updatedAt),
            collaborators: result.data.permissions || [],
          });
          setWordCount(
            (result.data.content || "")
              .split(/\s+/)
              .filter((word) => word.length > 0).length
          );
          setError(null);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError("Failed to load document");
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [docId, user]);

  // WebSocket connection for real-time collaboration
  useEffect(() => {
    if (!docId || !user || !localStorage.getItem("authToken")) return;

    const connectWebSocket = () => {
      const token = localStorage.getItem("authToken");
      const wsUrl = `ws://localhost:5000/${docId}?token=${token}`;

      try {
        wsRef.current = new WebSocket(wsUrl);

        wsRef.current.onopen = () => {
          console.log("WebSocket connected");
          setIsOnline(true);
        };

        wsRef.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            if (data.type === "user-joined") {
              setConnectedUsers((prev) => [
                ...prev.filter((u) => u.id !== data.user.id),
                data.user,
              ]);
            } else if (data.type === "user-left") {
              setConnectedUsers((prev) =>
                prev.filter((u) => u.id !== data.user.id)
              );
            } else if (data.type === "content-change") {
              if (data.userId !== user.id) {
                setDocument((prev) => ({ ...prev, content: data.content }));
              }
            } else if (data.type === "cursor-change") {
              setConnectedUsers((prev) =>
                prev.map((u) =>
                  u.id === data.userId ? { ...u, cursor: data.cursor } : u
                )
              );
            }
          } catch (err) {
            console.error("Error parsing WebSocket message:", err);
          }
        };

        wsRef.current.onclose = () => {
          console.log("WebSocket disconnected");
          setIsOnline(false);
          // Attempt to reconnect after 3 seconds
          setTimeout(connectWebSocket, 3000);
        };

        wsRef.current.onerror = (error) => {
          console.error("WebSocket error:", error);
          setIsOnline(false);
        };
      } catch (err) {
        console.error("Failed to connect WebSocket:", err);
      }
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [docId, user]);

  // Auto-save functionality
  useEffect(() => {
    if (!document.content && !document.title) return;
    if (document.userPermission === "view") return;

    const timer = setTimeout(async () => {
      await saveDocument();
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(timer);
  }, [document.content, document.title]);

  const saveDocument = async () => {
    if (document.userPermission === "view") return;

    setIsSaving(true);
    try {
      const result = await documentAPI.updateDocument(
        docId,
        document.title,
        document.content
      );
      if (result.success) {
        setLastSaved(new Date());
        setError(null);
      } else {
        setError("Failed to save document");
      }
    } catch (err) {
      setError("Failed to save document");
    } finally {
      setIsSaving(false);
    }
  };

  const handleContentChange = (e) => {
    if (document.userPermission === "view") return;

    const content = e.target.value;
    setDocument((prev) => ({ ...prev, content }));
    setWordCount(content.split(/\s+/).filter((word) => word.length > 0).length);
    setIsTyping(true);

    // Send content change via WebSocket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "content-change",
          content,
          userId: user.id,
          docId,
        })
      );
    }

    setTimeout(() => setIsTyping(false), 1000);
  };

  const handleTitleChange = (e) => {
    if (document.userPermission === "view") return;

    setDocument((prev) => ({ ...prev, title: e.target.value }));
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const formatTime = (date) => {
    if (!date) return "Never";
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const requestAccess = async () => {
    try {
      const result = await documentAPI.requestAccess(
        docId,
        "Please grant me access to this document"
      );
      if (result.success) {
        setError("Access request sent successfully");
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Failed to send access request");
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      </Layout>
    );
  }

  if (error && !document.title) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Access Denied
            </h2>
            <p className="text-gray-300 mb-6">{error}</p>
            <div className="space-x-4">
              <AnimatedButton
                onClick={requestAccess}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Request Access
              </AnimatedButton>
              <AnimatedButton
                onClick={() => navigate("/dashboard")}
                className="bg-gray-600 hover:bg-gray-700"
              >
                Back to Dashboard
              </AnimatedButton>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showSidebar={!isFullscreen}>
      <div
        className={`${
          isFullscreen ? "fixed inset-0 z-50 bg-slate-900" : ""
        } flex h-screen`}
      >
        {/* Main Editor */}
        <div className="flex-1 flex flex-col">
          {/* Editor Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-sm border-b border-white/10 p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Back Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/dashboard")}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-300" />
                </motion.button>

                {/* Document Title */}
                <input
                  type="text"
                  value={document.title}
                  onChange={handleTitleChange}
                  disabled={document.userPermission === "view"}
                  className="text-xl font-semibold bg-transparent text-white border-none outline-none focus:text-purple-400 transition-colors disabled:cursor-not-allowed"
                  placeholder="Untitled Document"
                />

                {/* Permission Badge */}
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    document.userPermission === "owner"
                      ? "bg-green-500/20 text-green-300"
                      : document.userPermission === "edit"
                      ? "bg-blue-500/20 text-blue-300"
                      : "bg-gray-500/20 text-gray-300"
                  }`}
                >
                  {document.userPermission === "owner"
                    ? "Owner"
                    : document.userPermission === "edit"
                    ? "Editor"
                    : "Viewer"}
                </span>

                {/* Status Indicators */}
                <div className="flex items-center space-x-3">
                  {/* Connection Status */}
                  <div className="flex items-center space-x-2">
                    {isOnline ? (
                      <Wifi className="w-4 h-4 text-green-400" />
                    ) : (
                      <WifiOff className="w-4 h-4 text-red-400" />
                    )}
                    <span
                      className={`text-sm ${
                        isOnline ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {isOnline ? "Connected" : "Offline"}
                    </span>
                  </div>

                  {/* Save Status */}
                  <div className="flex items-center space-x-2">
                    {isSaving ? (
                      <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 text-gray-400" />
                    )}
                    <span className="text-sm text-gray-400">
                      {isSaving
                        ? "Saving..."
                        : lastSaved
                        ? `Saved ${formatTime(lastSaved)}`
                        : "Not saved"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {/* Word Count */}
                <span className="text-sm text-gray-400">{wordCount} words</span>

                {/* Connected Users */}
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-400">
                    {connectedUsers.length + 1} users
                  </span>
                </div>

                {/* User Avatars */}
                <div className="flex -space-x-2">
                  {/* Current User */}
                  <div
                    className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-semibold border-2 border-white"
                    title={user?.name}
                  >
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </div>

                  {/* Connected Users */}
                  {connectedUsers.slice(0, 3).map((connectedUser, index) => (
                    <div
                      key={connectedUser.id}
                      className="w-8 h-8 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center justify-center text-white text-sm font-semibold border-2 border-white"
                      title={connectedUser.name}
                    >
                      {connectedUser.name?.charAt(0)?.toUpperCase()}
                    </div>
                  ))}

                  {connectedUsers.length > 3 && (
                    <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white text-xs font-semibold border-2 border-white">
                      +{connectedUsers.length - 3}
                    </div>
                  )}
                </div>

                {/* Fullscreen Toggle */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleFullscreen}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300"
                >
                  {isFullscreen ? (
                    <Minimize className="w-5 h-5 text-gray-300" />
                  ) : (
                    <Maximize className="w-5 h-5 text-gray-300" />
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Error Banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/20 border-b border-red-500/30 p-3"
            >
              <p className="text-red-300 text-sm text-center">{error}</p>
            </motion.div>
          )}

          {/* Editor Content */}
          <div className="flex-1 flex">
            {/* Text Editor */}
            <div className="flex-1 relative">
              <textarea
                ref={editorRef}
                value={document.content}
                onChange={handleContentChange}
                disabled={document.userPermission === "view"}
                placeholder={
                  document.userPermission === "view"
                    ? "You don't have permission to edit this document"
                    : "Start writing your document..."
                }
                className="w-full h-full bg-transparent text-white p-8 text-lg leading-relaxed resize-none outline-none placeholder-gray-500 disabled:cursor-not-allowed"
                style={{
                  fontFamily:
                    "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  lineHeight: "1.7",
                }}
              />

              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute bottom-4 left-8 flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full"
                >
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                  <span className="text-sm text-gray-300">Typing...</span>
                </motion.div>
              )}
            </div>

            {/* Presence Indicators */}
            {showPresence && connectedUsers.length > 0 && (
              <div className="absolute top-20 right-4 space-y-2">
                {connectedUsers.map((connectedUser) => (
                  <motion.div
                    key={connectedUser.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg"
                  >
                    <div
                      className="w-3 h-3 rounded-full bg-green-400"
                      style={{ backgroundColor: connectedUser.color }}
                    />
                    <span className="text-sm text-white">
                      {connectedUser.name}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Editor Footer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-sm border-t border-white/10 p-4"
          >
            <div className="flex items-center justify-between text-sm text-gray-400">
              <div className="flex items-center space-x-6">
                <span>Document ID: {docId}</span>
                <span>Last modified: {formatTime(document.lastModified)}</span>
                {document.owner && (
                  <span>
                    Owner: {document.owner.name || document.owner.username}
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-4">
                {document.userPermission !== "view" && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={saveDocument}
                    disabled={isSaving}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    {isSaving ? "Saving..." : "Save Now"}
                  </motion.button>
                )}

                <AnimatedButton
                  onClick={() => setShowPresence(!showPresence)}
                  className={`px-4 py-2 ${
                    showPresence ? "bg-green-600" : "bg-gray-600"
                  }`}
                >
                  {showPresence ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                </AnimatedButton>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default Editor;
