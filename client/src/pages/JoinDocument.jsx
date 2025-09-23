"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  FileText,
  Users,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Clock,
  Copy,
} from "lucide-react";
import Layout from "../components/Layout";
import AnimatedButton from "../components/AnimatedButton";
import FormInput from "../components/FormInput";
import { documentAPI } from "../utils/documentAPI";
import { useAuth } from "../context/AuthContext";

const JoinDocument = () => {
  const [docId, setDocId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [documentInfo, setDocumentInfo] = useState(null);
  const [requestMessage, setRequestMessage] = useState("");
  const [showRequestForm, setShowRequestForm] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSearch = async () => {
    if (!docId.trim()) {
      setError("Please enter a document ID");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    setDocumentInfo(null);
    setShowRequestForm(false);

    try {
      const result = await documentAPI.getDocumentById(docId.trim());

      if (result.success) {
        const docData = result.data;

        // Check if user has access
        if (docData.userPermission) {
          // User has access to the document
          setDocumentInfo(docData);
          setSuccess("Document found! You have access to this document.");
        } else if (docData.canRequestAccess) {
          // Document exists but user doesn't have access
          setDocumentInfo(docData);
          setShowRequestForm(true);
          setError(
            "You don't have access to this document. You can request access below."
          );
        } else {
          setError("Document found but access cannot be requested");
        }
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Failed to search for document. Please check the Document ID.");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAccess = async () => {
    if (!requestMessage.trim()) {
      setError("Please provide a reason for requesting access");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await documentAPI.requestAccess(
        docId.trim(),
        requestMessage
      );

      if (result.success) {
        setSuccess(
          "Access request sent successfully! The document owner will be notified."
        );
        setShowRequestForm(false);
        setRequestMessage("");
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Failed to send access request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDocument = () => {
    if (documentInfo && documentInfo._id) {
      navigate(`/editor/${documentInfo._id}`);
    }
  };

  const copyDocumentId = () => {
    navigator.clipboard.writeText(docId);
    // You could add a toast notification here
  };

  const testAuth = async () => {
    console.log("Testing authentication...");
    const result = await documentAPI.testAuth();
    console.log("Auth test result:", result);
    if (result.success) {
      setSuccess("Authentication working! " + JSON.stringify(result.data));
    } else {
      setError(
        "Auth test failed: " +
          result.error +
          (result.details ? " - " + result.details : "")
      );
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-dark-bg via-dark-surface to-dark-accent p-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-neon-purple to-neon-teal rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Join Collaborative Document
            </h1>
            <p className="text-gray-400">
              Enter a Document ID to access or request access to a shared
              document
            </p>
          </motion.div>

          {/* Search Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-2xl p-6 mb-6"
          >
            <div className="space-y-4">
              <FormInput
                type="text"
                placeholder="Enter Document ID (e.g., 60f7b3b3b3b3b3b3b3b3b3b3)"
                value={docId}
                onChange={(e) => setDocId(e.target.value)}
                icon={FileText}
                disabled={loading}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />

              <div className="flex gap-3">
                <AnimatedButton
                  onClick={handleSearch}
                  disabled={loading || !docId.trim()}
                  className="flex-1"
                  variant="primary"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Search Document
                    </>
                  )}
                </AnimatedButton>

                {docId && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={copyDocumentId}
                    className="p-3 glass rounded-xl hover:bg-white/10 transition-colors"
                    title="Copy Document ID"
                  >
                    <Copy className="w-4 h-4 text-gray-400" />
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass border-l-4 border-red-500 rounded-xl p-4 mb-6"
            >
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-red-300">{error}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Success Message */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass border-l-4 border-green-500 rounded-xl p-4 mb-6"
            >
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-green-300">{success}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Document Found - Access Available */}
          {documentInfo && !showRequestForm && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-6 mb-6"
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-neon-purple to-neon-teal rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {documentInfo.title}
                  </h3>
                  {documentInfo.owner && (
                    <p className="text-gray-400 mb-3">
                      Owner:{" "}
                      {documentInfo.owner.name ||
                        documentInfo.owner.username ||
                        documentInfo.owner.email}
                    </p>
                  )}
                  <div className="flex items-center space-x-4 text-sm text-gray-400 mb-4">
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>Collaborative Document</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>
                        Last modified:{" "}
                        {new Date(documentInfo.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <AnimatedButton
                    onClick={handleOpenDocument}
                    variant="primary"
                    className="w-full"
                  >
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Open Document
                  </AnimatedButton>
                </div>
              </div>
            </motion.div>
          )}

          {/* Request Access Form */}
          {showRequestForm && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-6"
            >
              <div className="flex items-start space-x-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Request Access
                  </h3>
                  <p className="text-gray-400">
                    This document is private. Send a request to the owner for
                    access.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Reason for Access Request
                  </label>
                  <textarea
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                    placeholder="Please explain why you need access to this document..."
                    className="w-full p-3 glass rounded-xl text-white placeholder-gray-400 border border-white/10 focus:border-neon-purple/50 focus:ring-1 focus:ring-neon-purple/50 resize-none"
                    rows={4}
                    disabled={loading}
                  />
                </div>

                <div className="flex gap-3">
                  <AnimatedButton
                    onClick={handleRequestAccess}
                    disabled={loading || !requestMessage.trim()}
                    variant="primary"
                    className="flex-1"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Sending Request...
                      </>
                    ) : (
                      <>
                        <ArrowRight className="w-4 h-4 mr-2" />
                        Send Access Request
                      </>
                    )}
                  </AnimatedButton>
                  <AnimatedButton
                    onClick={() => {
                      setShowRequestForm(false);
                      setError(null);
                      setDocumentInfo(null);
                    }}
                    variant="secondary"
                  >
                    Cancel
                  </AnimatedButton>
                </div>
              </div>
            </motion.div>
          )}

          {/* Help Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-6 mt-8"
          >
            <h3 className="text-lg font-semibold text-white mb-3">
              💡 How to find Document IDs
            </h3>
            <ul className="space-y-2 text-sm text-gray-400 mb-4">
              <li>
                • Document owners can share the ID from their document list
              </li>
              <li>
                • IDs are typically 24-character strings (e.g.,
                60f7b3b3b3b3b3b3b3b3b3b3)
              </li>
              <li>• You can find shared document IDs in team communications</li>
              <li>• Document URLs contain the ID: /editor/DOCUMENT_ID</li>
            </ul>

            {/* Debug Auth Button */}
            <AnimatedButton
              onClick={testAuth}
              variant="secondary"
              className="w-full"
            >
              🔧 Test Authentication (Debug)
            </AnimatedButton>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default JoinDocument;
