"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { IndexeddbPersistence } from "y-indexeddb";
import "./CollaborativeEditor.css";

export default function CollaborativeEditor({
  docId,
  token,
  user,
  document,
  onBack,
}) {
  const [ydoc] = useState(() => new Y.Doc());
  const [provider, setProvider] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [connectedUsers, setConnectedUsers] = useState(new Set());

  useEffect(() => {
    if (!docId || docId === "new") {
      console.error("Invalid docId for collaborative editor:", docId);
      setIsReady(false);
      return;
    }

    if (!token) {
      console.error("No authentication token available");
      setIsReady(false);
      return;
    }

    console.log("Initializing collaborative editor for docId:", docId);

    // Initialize persistence
    const persistence = new IndexeddbPersistence(docId, ydoc);

    // Initialize WebSocket provider with authentication
    const wsUrl = "ws://localhost:5000"; // Using port 5000 as per .env
    const wsProvider = new WebsocketProvider(wsUrl, docId, ydoc, {
      params: { token },
    });

    // Setup connection handlers
    wsProvider.on("status", (event) => {
      console.log("WebSocket status:", event.status);
      setConnectionStatus(event.status);
    });

    wsProvider.on("connection-close", (event) => {
      console.log("WebSocket connection closed:", event);
      setConnectionStatus("disconnected");
    });

    wsProvider.on("connection-error", (error) => {
      console.error("WebSocket connection error:", error);
      setConnectionStatus("error");
    });

    // Track awareness changes (connected users)
    wsProvider.awareness.on("change", () => {
      const states = wsProvider.awareness.getStates();
      const users = new Set();
      states.forEach((state, clientId) => {
        if (state.user) {
          users.add(state.user.name);
        }
      });
      setConnectedUsers(users);
    });

    // Wait for persistence to be ready, then set up the editor
    persistence.whenSynced
      .then(() => {
        console.log("Local state loaded");
        setProvider(wsProvider);
        setIsReady(true);
      })
      .catch((error) => {
        console.error("Persistence error:", error);
        // Still proceed even if persistence fails
        setProvider(wsProvider);
        setIsReady(true);
      });

    // Fallback: Set ready after a delay
    const fallbackTimer = setTimeout(() => {
      if (!isReady) {
        console.log("Fallback: Setting ready state");
        setProvider(wsProvider);
        setIsReady(true);
      }
    }, 3000);

    return () => {
      clearTimeout(fallbackTimer);
      wsProvider?.destroy();
      persistence?.destroy();
    };
  }, [docId, token, ydoc, isReady]);

  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          history: false, // Disable history as it conflicts with Collaboration
        }),
        Collaboration.configure({
          document: ydoc,
        }),
        ...(provider
          ? [
              CollaborationCursor.configure({
                provider: provider,
                user: {
                  name: user.name,
                  color: user.color,
                },
              }),
            ]
          : []),
      ],
      content: "<p>Start collaborating...</p>",
      editable: isReady,
    },
    [ydoc, provider, isReady]
  );

  const getStatusColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "#28a745";
      case "connecting":
        return "#ffc107";
      case "disconnected":
        return "#6c757d";
      case "error":
        return "#dc3545";
      default:
        return "#6c757d";
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case "connected":
        return "Online";
      case "connecting":
        return "Connecting...";
      case "disconnected":
        return "Offline";
      case "error":
        return "Connection Error";
      default:
        return "Unknown";
    }
  };

  if (!isReady) {
    return (
      <div className="h-full flex items-center justify-center bg-dark-300">
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
          <p className="text-gray-400 mb-4">Loading collaborative editor...</p>
          {onBack && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="px-4 py-2 glass rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300"
            >
              ← Back to Documents
            </motion.button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-dark-300">
      {/* Header */}
      <div className="glass-strong border-b border-white/10 p-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">
              {document?.title || "Collaborative Document"}
            </h2>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: getStatusColor() }}
                ></span>
                <span className="text-sm text-gray-400">{getStatusText()}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">You: {user.name}</span>
                <span
                  className="text-sm font-bold"
                  style={{ color: user.color }}
                >
                  ●
                </span>
              </div>

              {/* Connected Users */}
              {connectedUsers.size > 1 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">
                    Collaborating with:
                  </span>
                  <div className="flex gap-2">
                    {Array.from(connectedUsers)
                      .filter((userName) => userName !== user.name)
                      .map((userName, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 rounded-full text-xs font-medium bg-neon-teal text-white"
                        >
                          {userName}
                        </span>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {onBack && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="px-4 py-2 glass rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300"
            >
              ← Back to Documents
            </motion.button>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 glass border border-white/10 rounded-xl m-4 overflow-hidden">
        <EditorContent editor={editor} className="h-full" />
      </div>

      {/* Tips */}
      <div className="glass-strong border-t border-white/10 p-4">
        <p className="text-sm font-semibold text-gray-300 mb-2">
          💡 Collaboration Tips:
        </p>
        <ul className="text-xs text-gray-400 space-y-1">
          <li>
            • Share the Document ID with others to collaborate in real-time
          </li>
          <li>• Each user has a unique colored cursor and text selection</li>
          <li>
            • Changes are automatically saved and synced across all devices
          </li>
          <li>• The editor works offline and syncs when reconnected</li>
        </ul>
      </div>
    </div>
  );
}
