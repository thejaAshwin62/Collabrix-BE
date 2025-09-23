"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Edit, Trash2, X, ExternalLink } from "lucide-react";

const DocumentOptionsMenu = ({
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onOpen,
  position = { x: 0, y: 0 },
}) => {
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  useEffect(() => {
    if (isOpen) {
      const menuWidth = 200; // Approximate menu width
      const menuHeight = 120; // Approximate menu height
      const padding = 16; // Padding from screen edges

      let newX = position.x;
      let newY = position.y;

      // Check if menu would go off the right edge
      if (newX + menuWidth > window.innerWidth - padding) {
        newX = window.innerWidth - menuWidth - padding;
      }

      // Check if menu would go off the left edge
      if (newX < padding) {
        newX = padding;
      }

      // Check if menu would go off the bottom edge
      if (newY + menuHeight > window.innerHeight - padding) {
        newY = position.y - menuHeight - 10; // Position above the trigger
      }

      // Check if menu would go off the top edge
      if (newY < padding) {
        newY = padding;
      }

      setAdjustedPosition({ x: newX, y: newY });
    }
  }, [isOpen, position]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-transparent"
            onClick={onClose}
          />

          {/* Menu */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed z-50 min-w-[200px] backdrop-blur-md bg-white/10 border border-white/20 rounded-xl shadow-2xl overflow-hidden pointer-events-auto"
            style={{
              left: adjustedPosition.x,
              top: adjustedPosition.y,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-2">
              {onOpen && (
                <motion.button
                  whileHover={{
                    x: 5,
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onOpen();
                    onClose();
                  }}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:text-white transition-all duration-300"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="font-medium">Open Document</span>
                </motion.button>
              )}

              <motion.button
                whileHover={{
                  x: 5,
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                  onClose();
                }}
                className="w-full flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:text-white transition-all duration-300"
              >
                <Edit className="w-4 h-4" />
                <span className="font-medium">Edit Document</span>
              </motion.button>

              <div className="my-1 mx-3 h-px bg-white/10"></div>

              <motion.button
                whileHover={{ x: 5, backgroundColor: "rgba(239, 68, 68, 0.1)" }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                  onClose();
                }}
                className="w-full flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:text-red-400 transition-all duration-300"
              >
                <Trash2 className="w-4 h-4" />
                <span className="font-medium">Delete Document</span>
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const EditDocumentModal = ({
  isOpen,
  onClose,
  onSave,
  document,
  loading = false,
}) => {
  const [title, setTitle] = useState(document?.title || "");
  const [description, setDescription] = useState(document?.description || "");

  const handleSave = () => {
    if (title.trim()) {
      onSave({ title: title.trim(), description: description.trim() });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleSave();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md glass-strong rounded-2xl border border-white/20 p-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">
                Edit Document
              </h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Form */}
            <div className="space-y-4">
              {/* Title Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter document title"
                  className="w-full px-4 py-3 rounded-xl backdrop-blur-md bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-purple focus:border-transparent transition-all duration-300"
                  autoFocus
                />
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter document description (optional)"
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl backdrop-blur-md bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-purple focus:border-transparent transition-all duration-300 resize-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 mt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300"
              >
                Cancel
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={!title.trim() || loading}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-neon-purple to-neon-teal text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-300"
              >
                {loading ? "Saving..." : "Save Changes"}
              </motion.button>
            </div>

            {/* Shortcut hint */}
            <p className="text-xs text-gray-500 mt-3 text-center">
              Press Ctrl + Enter to save
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export { DocumentOptionsMenu, EditDocumentModal };
