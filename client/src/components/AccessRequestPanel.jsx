"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Check,
  X,
  Clock,
  User,
  FileText,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";
import { documentAPI } from "../utils/documentAPI";
import AnimatedButton from "./AnimatedButton";

const AccessRequestPanel = () => {
  const [accessRequests, setAccessRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [processingRequest, setProcessingRequest] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchAccessRequests();
  }, []);

  const fetchAccessRequests = async () => {
    try {
      const result = await documentAPI.getAccessRequests();
      if (result.success) {
        setAccessRequests(result.data);
        setError(null);
        // Initialize permissions state
        const permissions = {};
        result.data.forEach((req) => {
          permissions[req.requestId] = "view";
        });
        setSelectedPermissions(permissions);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Failed to fetch access requests");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestResponse = async (
    documentId,
    requestId,
    action,
    permission = "view"
  ) => {
    setProcessingRequest(requestId);
    try {
      const permissionToUse =
        action === "approve"
          ? selectedPermissions[requestId] || "view"
          : undefined;

      const result = await documentAPI.respondToAccessRequest(
        documentId,
        requestId,
        action,
        permissionToUse
      );

      if (result.success) {
        // Remove the processed request from the list
        setAccessRequests((prev) =>
          prev.filter((req) => req.requestId !== requestId)
        );
        // Clean up permission state
        setSelectedPermissions((prev) => {
          const newState = { ...prev };
          delete newState[requestId];
          return newState;
        });
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Failed to process request");
    } finally {
      setProcessingRequest(null);
    }
  };

  const updatePermission = (requestId, permission) => {
    setSelectedPermissions((prev) => ({
      ...prev,
      [requestId]: permission,
    }));
  };

  if (loading) {
    return (
      <div className="glass rounded-2xl p-4">
        <div className="flex items-center space-x-3">
          <Bell className="w-5 h-5 text-gray-400" />
          <span className="text-gray-400">Loading access requests...</span>
        </div>
      </div>
    );
  }

  if (accessRequests.length === 0) {
    return null; // Don't show the panel if no requests
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <motion.div
        className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Bell className="w-5 h-5 text-neon-orange" />
              {accessRequests.length > 0 && (
                <span className="absolute -top-2 -right-2 w-4 h-4 bg-neon-orange rounded-full text-xs text-white flex items-center justify-center">
                  {accessRequests.length}
                </span>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                Access Requests
              </h3>
              <p className="text-sm text-gray-400">
                {accessRequests.length} pending request
                {accessRequests.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                navigate("/access-requests");
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-1 px-3 py-1 text-sm text-neon-purple hover:text-white transition-colors"
            >
              <span>View All</span>
              <ExternalLink className="w-3 h-3" />
            </motion.button>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-5 h-5 text-gray-400" />
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Requests List */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/10">
              {error && (
                <div className="p-4 bg-red-500/10 border-l-4 border-red-500">
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              <div className="max-h-96 overflow-y-auto">
                {accessRequests.slice(0, 3).map((request) => (
                  <motion.div
                    key={request.requestId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="p-4 border-b border-white/5 last:border-b-0"
                  >
                    <div className="flex items-start justify-between space-x-4">
                      {/* Request Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <FileText className="w-4 h-4 text-neon-teal flex-shrink-0" />
                          <h4 className="text-white font-medium truncate">
                            {request.documentTitle}
                          </h4>
                        </div>

                        <div className="flex items-center space-x-2 mb-2">
                          <User className="w-3 h-3 text-gray-400 flex-shrink-0" />
                          <span className="text-gray-400 text-sm">
                            {request.requester.name || request.requester.email}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>
                            {new Date(request.requestedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col space-y-2">
                        {/* Permission selector */}
                        <select
                          className="text-xs bg-dark-surface border border-white/20 rounded px-2 py-1 text-white"
                          value={
                            selectedPermissions[request.requestId] || "view"
                          }
                          onChange={(e) =>
                            updatePermission(request.requestId, e.target.value)
                          }
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value="view">View Only</option>
                          <option value="edit">Edit Access</option>
                        </select>

                        <div className="flex space-x-2">
                          <AnimatedButton
                            onClick={() =>
                              handleRequestResponse(
                                request.documentId,
                                request.requestId,
                                "approve"
                              )
                            }
                            disabled={processingRequest === request.requestId}
                            variant="primary"
                            className="px-3 py-1 text-xs"
                          >
                            {processingRequest === request.requestId ? (
                              <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <>
                                <Check className="w-3 h-3 mr-1" />
                                Approve
                              </>
                            )}
                          </AnimatedButton>

                          <AnimatedButton
                            onClick={() =>
                              handleRequestResponse(
                                request.documentId,
                                request.requestId,
                                "reject"
                              )
                            }
                            disabled={processingRequest === request.requestId}
                            variant="secondary"
                            className="px-3 py-1 text-xs"
                          >
                            <X className="w-3 h-3 mr-1" />
                            Reject
                          </AnimatedButton>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {accessRequests.length > 3 && (
                  <div className="p-4 border-t border-white/5 text-center">
                    <button
                      onClick={() => navigate("/access-requests")}
                      className="text-neon-purple hover:text-white transition-colors text-sm"
                    >
                      +{accessRequests.length - 3} more requests
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AccessRequestPanel;
