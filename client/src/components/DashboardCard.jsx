"use client";

import { motion } from "framer-motion";
import { MoreVertical, Star, Users, Clock, Copy } from "lucide-react";
import { toast } from "sonner";

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return "Unknown";

  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now - date;
  const diffInHours = diffInMs / (1000 * 60 * 60);
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

  if (diffInHours < 1) {
    const minutes = Math.floor(diffInMs / (1000 * 60));
    return minutes <= 1 ? "Just now" : `${minutes}m ago`;
  } else if (diffInHours < 24) {
    const hours = Math.floor(diffInHours);
    return `${hours}h ago`;
  } else if (diffInDays < 7) {
    const days = Math.floor(diffInDays);
    return `${days}d ago`;
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  }
};

const DashboardCard = ({
  title,
  description,
  lastModified,
  collaborators = [],
  starred = false,
  type = "document",
  onClick,
  onStar,
  onMenu,
  document: documentData, // Rename to avoid conflict with global document
}) => {
  const handleMenuClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const scrollX = window.scrollX || document.documentElement.scrollLeft;

    const position = {
      x: rect.left + scrollX - 50, // Position menu slightly to the left of button
      y: rect.bottom + scrollY + 5, // Position below button with small gap
    };

    onMenu?.(position, documentData || { title, description, type });
  };

  const handleCopyDocumentId = (e) => {
    e.stopPropagation();
    e.preventDefault();

    const documentId = documentData?.id || documentData?._id;
    if (documentId) {
      navigator.clipboard
        .writeText(documentId)
        .then(() => {
          toast.success(`Document ID copied to clipboard!`, {
            description: `ID: ${documentId.slice(0, 8)}...`,
          });
        })
        .catch(() => {
          toast.error("Failed to copy document ID");
        });
    } else {
      toast.error("Document ID not available");
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={(e) => {
        // Only trigger card click if it's not a button click
        if (e.target.closest("button")) {
          return;
        }
        onClick?.();
      }}
      className="cursor-pointer group relative overflow-hidden rounded-xl backdrop-blur-md bg-white/5 border border-white/10 p-6 shadow-xl hover:shadow-2xl hover:border-white/20 transition-all duration-300"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full bg-gradient-to-br from-neon-purple via-transparent to-neon-teal" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1 pr-3 min-w-0">
            <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-neon-purple transition-colors duration-300 line-clamp-1">
              {title}
            </h3>
            <p className="text-sm text-gray-300 line-clamp-2 leading-relaxed">
              {description}
            </p>
          </div>

          <div className="flex items-center space-x-2 flex-shrink-0 relative z-20">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleCopyDocumentId}
              className="p-2 rounded-lg backdrop-blur-sm bg-white/5 border border-white/10 text-gray-300 hover:text-neon-teal hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer pointer-events-auto"
              title="Copy Document ID"
            >
              <Copy className="w-4 h-4" />
            </motion.button>

            {/* <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                toast.success(
                  starred ? `Unstarred "${title}"` : `Starred "${title}"`
                );
                onStar?.();
              }}
              className={`p-2 rounded-lg backdrop-blur-sm bg-white/5 border border-white/10 transition-all duration-300 hover:bg-white/10 hover:border-white/20 cursor-pointer pointer-events-auto ${
                starred
                  ? "text-neon-orange"
                  : "text-gray-300 hover:text-neon-orange"
              }`}
              title={starred ? "Unstar document" : "Star document"}
            >
              <Star className={`w-4 h-4 ${starred ? "fill-current" : ""}`} />
            </motion.button> */}

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                toast.info("Opening document options...");
                handleMenuClick(e);
              }}
              className="p-2 rounded-lg backdrop-blur-sm bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer pointer-events-auto"
              title="More options"
            >
              <MoreVertical className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* Open Button */}
        <div className="mt-4 mb-4">
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
            className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-neon-purple/20 to-neon-teal/20 hover:from-neon-purple/30 hover:to-neon-teal/30 border border-white/20 hover:border-white/30 text-white font-medium transition-all duration-300 backdrop-blur-sm group"
          >
            <div className="flex items-center justify-center space-x-2">
              <span>Open Document</span>
              <motion.div className="transform transition-transform duration-300 group-hover:translate-x-1">
                →
              </motion.div>
            </div>
          </motion.button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-sm text-gray-300 pt-4 border-t border-white/10">
          <div className="flex items-center space-x-6">
            {/* Last Modified */}
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-neon-teal" />
              <span>{formatDate(lastModified)}</span>
            </div>

            {/* Collaborators */}
            {collaborators.length > 0 && (
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-neon-purple" />
                <span>{collaborators.length}</span>
              </div>
            )}
          </div>

          {/* Type Badge */}
          <span className="px-3 py-1.5 rounded-full bg-gradient-to-r from-neon-purple/20 to-neon-teal/20 border border-white/20 text-sm font-medium capitalize backdrop-blur-sm">
            {type}
          </span>
        </div>

        {/* Collaborator Avatars */}
        {collaborators.length > 0 && (
          <div className="flex items-center space-x-1 mt-4">
            {collaborators.slice(0, 3).map((collaborator, index) => (
              <motion.div
                key={collaborator.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="w-8 h-8 rounded-full bg-gradient-to-r from-neon-purple to-neon-teal flex items-center justify-center text-sm font-semibold text-white border-2 border-white/20 backdrop-blur-sm"
                style={{ marginLeft: index > 0 ? "-12px" : "0" }}
              >
                {collaborator.name.charAt(0).toUpperCase()}
              </motion.div>
            ))}
            {collaborators.length > 3 && (
              <div className="w-8 h-8 rounded-full bg-white/10 border-2 border-white/20 backdrop-blur-sm flex items-center justify-center text-sm font-semibold text-gray-300 -ml-3">
                +{collaborators.length - 3}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hover Effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-neon-purple/5 to-neon-teal/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"
        initial={false}
      />
    </motion.div>
  );
};

export default DashboardCard;
