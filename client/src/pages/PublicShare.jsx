"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Lock,
  Eye,
  Download,
  Share2,
  Clock,
  User,
  CheckCircle,
  ArrowLeft,
  Copy,
  Check,
} from "lucide-react";
import AnimatedButton from "../components/AnimatedButton";
import FormInput from "../components/FormInput";
import { documentAPI } from "../utils/documentAPI";

const PublicShare = () => {
  const { docId } = useParams();
  const navigate = useNavigate();
  const [documentData, setDocumentData] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [requestStatus, setRequestStatus] = useState(null); // 'pending', 'success', 'error'
  const [requestForm, setRequestForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  useEffect(() => {
    const loadSharedDocument = async () => {
      if (!docId) {
        setError("No document ID provided");
        setIsLoading(false);
        return;
      }

      try {
        const result = await documentAPI.getDocumentByShareToken(docId);
        if (result.success) {
          setDocumentData(result.data);
          setHasAccess(true);
        } else {
          setError(result.error);
          setHasAccess(false);
        }
      } catch (error) {
        setError("Failed to load shared document");
        setHasAccess(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadSharedDocument();
  }, [docId]);

  const handleCopyContent = async () => {
    try {
      await navigator.clipboard.writeText(documentData?.content || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy content:", err);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleRequestAccess = async (e) => {
    e.preventDefault();
    if (!docId) return;

    setIsLoading(true);
    setError("");

    try {
      const result = await documentAPI.requestAccess(
        docId,
        requestForm.message
      );
      if (result.success) {
        setRequestStatus("success");
      } else {
        setRequestStatus("error");
        setError(result.error);
      }
    } catch (error) {
      setRequestStatus("error");
      setError("Failed to send access request");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRequestForm((prev) => ({ ...prev, [name]: value }));
  };

  // Loading state
  if (isLoading && !documentData && !error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-300 via-dark-200 to-dark-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
            className="w-16 h-16 mx-auto mb-4 border-4 border-neon-purple border-t-transparent rounded-full"
          />
          <p className="text-white text-lg">Loading shared document...</p>
        </motion.div>
      </div>
    );
  }

  // Error state or document not found
  if (error || !hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-300 via-dark-200 to-dark-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md p-4"
        >
          <div className="relative">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
              className="absolute inset-0 bg-gradient-to-r from-red-500/30 to-neon-purple/30 rounded-3xl blur-2xl"
            />

            <div className="relative glass-strong rounded-3xl p-8 border border-white/20">
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-red-500 to-neon-purple rounded-2xl flex items-center justify-center"
                >
                  <Lock className="w-8 h-8 text-white" />
                </motion.div>

                <h1 className="text-2xl font-bold text-white mb-2">
                  Document Not Available
                </h1>
                <p className="text-gray-400 mb-6">
                  {error || "This document is not publicly accessible"}
                </p>

                <div className="space-y-4">
                  <AnimatedButton
                    variant="primary"
                    onClick={() => navigate("/login")}
                  >
                    Sign In to Access
                  </AnimatedButton>
                  <AnimatedButton variant="ghost" onClick={() => navigate("/")}>
                    Go Home
                  </AnimatedButton>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Success - show document
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-300 via-dark-200 to-dark-100">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong border-b border-white/10 p-4"
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/")}
              className="p-2 rounded-xl glass hover:bg-white/10 transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </motion.button>
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">
                {documentData?.title}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <span className="flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span>By {documentData?.owner?.name}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>Updated {formatDate(documentData?.updatedAt)}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>Shared document</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <AnimatedButton
              variant="secondary"
              size="sm"
              onClick={handleCopyContent}
            >
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              {copied ? "Copied!" : "Copy"}
            </AnimatedButton>
            <AnimatedButton
              variant="primary"
              size="sm"
              onClick={() => navigate("/login")}
            >
              Sign In
            </AnimatedButton>
          </div>
        </div>
      </motion.div>

      {/* Document Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-4xl mx-auto p-8"
      >
        <div className="glass-strong rounded-2xl p-8 border border-white/10">
          <div className="prose prose-invert max-w-none">
            <pre className="whitespace-pre-wrap text-gray-300 font-mono leading-relaxed">
              {documentData?.content || "This document is empty."}
            </pre>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PublicShare;
