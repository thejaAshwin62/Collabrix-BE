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
    collaborators: [
      {
        id: 1,
        name: "Alex Chen",
        avatar: "/api/placeholder/32/32",
        color: "#a855f7",
        cursor: { x: 100, y: 200 },
        selection: null,
        isTyping: false,
      },
      {
        id: 2,
        name: "Sarah Kim",
        avatar: "/api/placeholder/32/32",
        color: "#14b8a6",
        cursor: { x: 300, y: 150 },
        selection: { start: 45, end: 67 },
        isTyping: true,
      },
    ],
  });

  // Enhanced user object for collaborative editor
  const collaborativeUser = {
    ...user,
    color: user?.color || "#8B5CF6",
    name: user?.name || "Anonymous",
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
            setDocument((prev) => ({
              ...prev,
              id: result.data._id || result.data.id || docId,
              title: result.data.title,
              content: result.data.content,
              lastModified: new Date(result.data.updatedAt),
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
  }, [docId]);

  // Simulate typing effect
  useEffect(() => {
    const interval = setInterval(() => {
      setDocument((prev) => ({
        ...prev,
        collaborators: prev.collaborators.map((collab) => ({
          ...collab,
          isTyping: Math.random() > 0.7,
          cursor: {
            x: Math.random() * 800 + 100,
            y: Math.random() * 600 + 100,
          },
        })),
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

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
        } flex h-screen`}
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
                      Collaborating with:
                    </span>
                    <div className="flex items-center space-x-2">
                      {document.collaborators.map((collaborator) => (
                        <motion.div
                          key={collaborator.id}
                          whileHover={{ scale: 1.1 }}
                          className="relative"
                        >
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-white border-2"
                            style={{
                              backgroundColor: collaborator.color,
                              borderColor: collaborator.isTyping
                                ? collaborator.color
                                : "transparent",
                            }}
                          >
                            {collaborator.name.charAt(0)}
                          </div>
                          {collaborator.isTyping && (
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{
                                duration: 1,
                                repeat: Number.POSITIVE_INFINITY,
                              }}
                              className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full"
                            />
                          )}
                        </motion.div>
                      ))}
                    </div>
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
