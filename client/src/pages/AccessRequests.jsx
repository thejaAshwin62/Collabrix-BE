"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  Filter,
  Search,
  MoreVertical,
  AlertTriangle,
  FileText,
  MessageSquare,
} from "lucide-react";
import Layout from "../components/Layout";
import AnimatedButton from "../components/AnimatedButton";
import { documentAPI } from "../utils/documentAPI";

const AccessRequests = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [accessRequests, setAccessRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingRequest, setProcessingRequest] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState({});

  useEffect(() => {
    fetchAccessRequests();
  }, []);

  const fetchAccessRequests = async () => {
    setLoading(true);
    try {
      const result = await documentAPI.getAccessRequests();
      if (result.success) {
        setAccessRequests(result.data);
        setError(null);
        // Initialize permissions state for each request
        const permissions = {};
        result.data.forEach((req) => {
          permissions[req.requestId] = "view"; // Default permission
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

  const updatePermission = (requestId, permission) => {
    setSelectedPermissions((prev) => ({
      ...prev,
      [requestId]: permission,
    }));
  };

  const handleApprove = async (requestId, docId) => {
    setProcessingRequest(requestId);
    try {
      const permission = selectedPermissions[requestId] || "view";
      const result = await documentAPI.respondToAccessRequest(
        docId,
        requestId,
        "approve",
        permission
      );
      if (result.success) {
        // Remove the approved request from the list
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
      setError("Failed to approve request");
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleDeny = async (requestId, docId) => {
    setProcessingRequest(requestId);
    try {
      const result = await documentAPI.respondToAccessRequest(
        docId,
        requestId,
        "reject"
      );
      if (result.success) {
        // Remove the denied request from the list
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
      setError("Failed to deny request");
    } finally {
      setProcessingRequest(null);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-4rem)] p-6">
        {/* Fixed Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center space-x-3">
              <Shield className="w-8 h-8 text-neon-purple" />
              <span>Access Requests</span>
            </h1>
            <p className="text-gray-400">
              Manage document access requests from team members
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 glass rounded-xl px-4 py-2">
              <Clock className="w-5 h-5 text-neon-orange" />
              <span className="text-white font-medium">
                {accessRequests.filter((r) => r.status === "pending").length}{" "}
                Pending
              </span>
            </div>
          </div>
        </motion.div>

        {/* Fixed Tabs */}
        <div className="flex space-x-1 mb-6 glass rounded-xl p-1">
          {[
            { id: "pending", label: "Pending", icon: Clock },
            { id: "approved", label: "Approved", icon: CheckCircle },
            { id: "denied", label: "Denied", icon: XCircle },
            { id: "all", label: "All", icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-neon-purple text-white"
                    : "text-gray-400 hover:text-white hover:bg-white/10"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Fixed Search and Filters */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors duration-300 peer-focus:text-neon-purple" />
            <input
              type="text"
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-12 w-full peer"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 glass rounded-xl text-gray-400 hover:text-neon-purple hover:shadow-lg hover:shadow-neon-purple/20 transition-all duration-300"
          >
            <Filter className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Scrollable Requests Container */}
        <div className="flex-1 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="h-full overflow-y-auto pr-2 space-y-4"
          >
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  }}
                  className="w-8 h-8 border-4 border-neon-purple border-t-transparent rounded-full"
                />
              </div>
            ) : error ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-center h-full"
              >
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-red-500 to-orange-500 rounded-3xl flex items-center justify-center">
                    <AlertTriangle className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Error Loading Requests
                  </h3>
                  <p className="text-gray-400 mb-4">{error}</p>
                  <AnimatedButton onClick={fetchAccessRequests}>
                    Retry
                  </AnimatedButton>
                </div>
              </motion.div>
            ) : accessRequests.length > 0 ? (
              <AnimatePresence>
                {accessRequests.map((request, index) => (
                  <motion.div
                    key={request.requestId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.01, x: 5 }}
                    className="glass rounded-2xl p-6 border border-white/10 hover:border-neon-purple/30 transition-all duration-300 group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        {/* Requester Avatar */}
                        <div className="w-12 h-12 bg-gradient-to-r from-neon-teal to-neon-purple rounded-full flex items-center justify-center text-white font-semibold">
                          {request.requester.name
                            ? request.requester.name.charAt(0).toUpperCase()
                            : request.requester.email
                            ? request.requester.email.charAt(0).toUpperCase()
                            : "?"}
                        </div>

                        {/* Request Details */}
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-white font-semibold">
                              {request.requester.name ||
                                request.requester.email}
                            </h3>
                            <span className="text-gray-400 text-sm">
                              {request.requester.email}
                            </span>
                            <span className="px-2 py-1 rounded-full text-xs font-medium border border-neon-orange/30 bg-neon-orange/20 text-neon-orange">
                              Pending
                            </span>
                          </div>

                          <div className="flex items-center space-x-6 mb-3">
                            <div className="flex items-center space-x-2">
                              <FileText className="w-4 h-4 text-gray-400" />
                              <span className="text-white font-medium">
                                {request.documentTitle}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-400 text-sm">
                                {new Date(
                                  request.requestedAt
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          {/* Permission Selection */}
                          <div className="flex items-center space-x-4 mb-4">
                            <label className="text-sm text-gray-300">
                              Grant Permission:
                            </label>
                            <select
                              className="glass border border-white/20 rounded-lg px-3 py-1 text-white text-sm focus:border-neon-purple/50 focus:outline-none"
                              value={
                                selectedPermissions[request.requestId] || "view"
                              }
                              onChange={(e) =>
                                updatePermission(
                                  request.requestId,
                                  e.target.value
                                )
                              }
                            >
                              <option value="view">View Only</option>
                              <option value="edit">Edit Access</option>
                            </select>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex space-x-3">
                            <AnimatedButton
                              onClick={() =>
                                handleApprove(
                                  request.requestId,
                                  request.documentId
                                )
                              }
                              disabled={processingRequest === request.requestId}
                              variant="primary"
                              className="px-4 py-2 text-sm"
                            >
                              {processingRequest === request.requestId ? (
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{
                                    duration: 1,
                                    repeat: Number.POSITIVE_INFINITY,
                                    ease: "linear",
                                  }}
                                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                                />
                              ) : (
                                <CheckCircle className="w-4 h-4 mr-2" />
                              )}
                              Approve
                            </AnimatedButton>

                            <AnimatedButton
                              onClick={() =>
                                handleDeny(
                                  request.requestId,
                                  request.documentId
                                )
                              }
                              disabled={processingRequest === request.requestId}
                              variant="secondary"
                              className="px-4 py-2 text-sm"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Deny
                            </AnimatedButton>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              /* Empty State */
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-center h-full"
              >
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-neon-purple to-neon-teal rounded-3xl flex items-center justify-center">
                    <Shield className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    No access requests found
                  </h3>
                  <p className="text-gray-400">
                    All caught up! No pending access requests at the moment.
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default AccessRequests;
