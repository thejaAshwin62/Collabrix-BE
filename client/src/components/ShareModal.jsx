"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  X,
  Copy,
  Mail,
  Link,
  Users,
  Shield,
  Eye,
  Edit,
  Crown,
  Check,
  Plus,
} from "lucide-react";
import AnimatedButton from "./AnimatedButton";
import FormInput from "./FormInput";
import { documentAPI } from "../utils/documentAPI";

const ShareModal = ({ isOpen, onClose, document, onDocumentUpdated }) => {
  const [activeTab, setActiveTab] = useState("share");
  const [shareLink, setShareLink] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("view");
  const [linkCopied, setLinkCopied] = useState(false);
  const [docIdCopied, setDocIdCopied] = useState(false);
  const [publicAccess, setPublicAccess] = useState("anyone-with-link");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const roles = [
    {
      id: "view",
      name: "Viewer",
      description: "Can view and comment",
      icon: Eye,
      color: "text-blue-400",
    },
    {
      id: "edit",
      name: "Editor",
      description: "Can view, comment, and edit",
      icon: Edit,
      color: "text-green-400",
    },
  ];

  const accessLevels = [
    {
      id: "anyone-with-link",
      name: "Anyone with the link",
      description: "Anyone with the link can view",
      icon: Link,
    },
    {
      id: "public",
      name: "Public",
      description: "Anyone can find and view",
      icon: Users,
    },
  ];

  // Update share link when document changes
  useEffect(() => {
    if (document?.id && document.id !== "new") {
      setShareLink(`${window.location.origin}/share/${document.id}`);
    } else {
      setShareLink("");
    }
  }, [document?.id]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handleCopyDocId = async () => {
    try {
      await navigator.clipboard.writeText(document?.id || "");
      setDocIdCopied(true);
      setTimeout(() => setDocIdCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy document ID:", err);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !document?.id) return;

    setIsLoading(true);
    setError("");

    try {
      const result = await documentAPI.addCollaborator(
        document.id,
        inviteEmail,
        inviteRole
      );

      if (result.success) {
        // Add the new collaborator to the local state
        const newCollaborator = {
          id: result.data.collaborator.id,
          name: result.data.collaborator.name,
          email: result.data.collaborator.email,
          avatar: "/placeholder.svg",
          color: "#8B5CF6",
          role: result.data.collaborator.permission,
          isOnline: false,
          isPending: false,
        };

        onDocumentUpdated((prev) => ({
          ...prev,
          collaborators: [...(prev.collaborators || []), newCollaborator],
        }));

        setInviteEmail("");
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError("Failed to add collaborator");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveCollaborator = async (collaboratorId) => {
    if (!document?.id) return;

    setIsLoading(true);
    setError("");

    try {
      const result = await documentAPI.removeCollaborator(
        document.id,
        collaboratorId
      );

      if (result.success) {
        onDocumentUpdated((prev) => ({
          ...prev,
          collaborators: prev.collaborators.filter(
            (c) => c.id !== collaboratorId
          ),
        }));
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError("Failed to remove collaborator");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (collaboratorId, newRole) => {
    if (!document?.id) return;

    setIsLoading(true);
    setError("");

    try {
      const result = await documentAPI.updateCollaboratorPermission(
        document.id,
        collaboratorId,
        newRole
      );

      if (result.success) {
        onDocumentUpdated((prev) => ({
          ...prev,
          collaborators: prev.collaborators.map((c) =>
            c.id === collaboratorId ? { ...c, role: newRole } : c
          ),
        }));
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError("Failed to update permission");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-2xl glass-panel neon-glow max-h-[90vh] overflow-hidden"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">
                  Share Document
                </h2>
                <motion.button
                  className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                  onClick={onClose}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>

              {/* Tabs */}
              <div className="flex gap-2">
                {[
                  { id: "share", label: "Share", icon: Link },
                  { id: "collaborators", label: "Collaborators", icon: Users },
                  { id: "permissions", label: "Permissions", icon: Shield },
                ].map((tab) => (
                  <motion.button
                    key={tab.id}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                      activeTab === tab.id
                        ? "bg-neon-purple text-white shadow-lg shadow-neon-purple/25"
                        : "text-gray-400 hover:text-white hover:bg-white/10"
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{tab.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-auto max-h-[60vh]">
              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-sm"
                >
                  {error}
                </motion.div>
              )}

              {activeTab === "share" && (
                <motion.div
                  className="space-y-6"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Share Link */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">
                      Share Link
                    </h3>
                    <div className="flex gap-3">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={shareLink || "Document ID not available"}
                          readOnly
                          className="w-full px-4 py-3 bg-glass-white backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:border-neon-purple transition-all duration-300"
                        />
                      </div>
                      <AnimatedButton
                        variant="secondary"
                        onClick={handleCopyLink}
                        disabled={!shareLink}
                      >
                        {linkCopied ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </AnimatedButton>
                    </div>
                    {linkCopied && (
                      <motion.p
                        className="text-sm text-green-400 mt-2"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        Link copied to clipboard!
                      </motion.p>
                    )}
                  </div>

                  {/* Document ID */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">
                      Document ID
                    </h3>
                    <div className="flex gap-3">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={document?.id || "No document ID"}
                          readOnly
                          className="w-full px-4 py-3 bg-glass-white backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:border-neon-purple transition-all duration-300 font-mono text-sm"
                        />
                      </div>
                      <AnimatedButton
                        variant="secondary"
                        onClick={handleCopyDocId}
                        disabled={!document?.id}
                      >
                        {docIdCopied ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </AnimatedButton>
                    </div>
                    {docIdCopied && (
                      <motion.p
                        className="text-sm text-green-400 mt-2"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        Document ID copied to clipboard!
                      </motion.p>
                    )}
                  </div>

                  {/* Invite by Email */}
                  {/* <div>
                    <h3 className="text-lg font-semibold text-white mb-3">
                      Invite People
                    </h3>
                    <form onSubmit={handleInvite} className="space-y-4">
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <FormInput
                            type="email"
                            name="email"
                            placeholder="Enter email address"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            icon={Mail}
                          />
                        </div>
                        <select
                          value={inviteRole}
                          onChange={(e) => setInviteRole(e.target.value)}
                          className="px-4 py-3 bg-glass-white backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:border-neon-purple transition-all duration-300"
                        >
                          {roles.map((role) => (
                            <option key={role.id} value={role.id}>
                              {role.name}
                            </option>
                          ))}
                        </select>
                        <AnimatedButton
                          type="submit"
                          variant="primary"
                          disabled={!inviteEmail.trim() || isLoading}
                        >
                          {isLoading ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{
                                duration: 1,
                                repeat: Number.POSITIVE_INFINITY,
                                ease: "linear",
                              }}
                              className="w-4 h-4 border border-white border-t-transparent rounded-full"
                            />
                          ) : (
                            <Plus className="w-4 h-4" />
                          )}
                        </AnimatedButton>
                      </div>
                    </form>
                  </div> */}
                </motion.div>
              )}

              {activeTab === "collaborators" && (
                <motion.div
                  className="space-y-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Collaborators ({document?.collaborators?.length || 0})
                  </h3>

                  {document?.collaborators?.map((collaborator) => (
                    <motion.div
                      key={collaborator.id}
                      className="flex items-center justify-between p-4 bg-glass-white backdrop-blur-sm border border-white/20 rounded-xl"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full overflow-hidden">
                            <img
                              src={collaborator.avatar || "/placeholder.svg"}
                              alt={collaborator.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          {collaborator.isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-dark-surface" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white">
                              {collaborator.name}
                            </span>
                            {collaborator.isPending && (
                              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                                Pending
                              </span>
                            )}
                          </div>
                          <span className="text-sm text-gray-400">
                            {collaborator.email}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <select
                          value={collaborator.role}
                          onChange={(e) =>
                            handleRoleChange(collaborator.id, e.target.value)
                          }
                          className="px-3 py-2 bg-glass-white backdrop-blur-sm border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-neon-purple transition-all duration-300"
                        >
                          {roles.map((role) => (
                            <option key={role.id} value={role.id}>
                              {role.name}
                            </option>
                          ))}
                        </select>
                        <motion.button
                          className="p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                          onClick={() =>
                            handleRemoveCollaborator(collaborator.id)
                          }
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <X className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}

                  {(!document?.collaborators ||
                    document.collaborators.length === 0) && (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-white mb-2">
                        No collaborators yet
                      </h3>
                      <p className="text-gray-400 text-sm">
                        Invite people to start collaborating!
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "permissions" && (
                <motion.div
                  className="space-y-6"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Public Access
                    </h3>
                    <div className="space-y-3">
                      {accessLevels.map((level) => (
                        <motion.button
                          key={level.id}
                          className={`w-full p-4 rounded-xl border transition-all duration-300 text-left ${
                            publicAccess === level.id
                              ? "border-neon-purple bg-neon-purple/20"
                              : "border-white/20 bg-glass-white hover:border-white/30"
                          }`}
                          onClick={() => setPublicAccess(level.id)}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <div className="flex items-center gap-3">
                            <level.icon className="w-5 h-5 text-neon-purple" />
                            <div>
                              <div className="font-medium text-white">
                                {level.name}
                              </div>
                              <div className="text-sm text-gray-400">
                                {level.description}
                              </div>
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Role Permissions
                    </h3>
                    <div className="space-y-3">
                      {roles.map((role) => (
                        <div
                          key={role.id}
                          className="flex items-center justify-between p-4 bg-glass-white backdrop-blur-sm border border-white/20 rounded-xl"
                        >
                          <div className="flex items-center gap-3">
                            <role.icon className={`w-5 h-5 ${role.color}`} />
                            <div>
                              <div className="font-medium text-white">
                                {role.name}
                              </div>
                              <div className="text-sm text-gray-400">
                                {role.description}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/10">
              <div className="flex justify-end gap-3">
                <AnimatedButton variant="ghost" onClick={onClose}>
                  Close
                </AnimatedButton>
                <AnimatedButton variant="primary">Save Changes</AnimatedButton>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ShareModal;
