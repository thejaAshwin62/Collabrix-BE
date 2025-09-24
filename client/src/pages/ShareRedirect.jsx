"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, Lock, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { documentAPI } from "../utils/documentAPI";

const ShareRedirect = () => {
  const { docId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const [checking, setChecking] = useState(true);
  const [documentInfo, setDocumentInfo] = useState(null);

  useEffect(() => {
    const handleShareRedirect = async () => {
      // If auth is still loading, wait
      if (authLoading) {
        return;
      }

      // If not authenticated, redirect to login with return URL
      if (!isAuthenticated) {
        const returnUrl = `/share/${docId}`;
        localStorage.setItem("redirectAfterLogin", returnUrl);
        navigate("/login", {
          state: {
            redirectUrl: returnUrl,
            message: "Please sign in to access the shared document",
          },
        });
        return;
      }

      // User is authenticated, check document access
      try {
        setChecking(true);

        // Try to get the document to check permissions
        const result = await documentAPI.getDocumentById(docId);

        if (result.success) {
          const docData = result.data;

          // Check if user has access (owner, or has permission, or document is public)
          const hasDirectAccess =
            docData.owner._id === user?.id || // User is owner
            docData.userPermission || // User has explicit permission
            docData.isPublic; // Document is public

          if (hasDirectAccess) {
            // User has access, redirect to editor
            navigate(`/editor/${docId}`, { replace: true });
          } else {
            // User doesn't have access, redirect to join document page with prefilled data
            setDocumentInfo(docData);
            navigate(`/join?docId=${docId}&autoRequest=true`, {
              state: {
                documentInfo: docData,
                fromShare: true,
              },
              replace: true,
            });
          }
        } else {
          // Document not found or error
          navigate(`/join?docId=${docId}&error=not_found`, {
            state: {
              error: result.error || "Document not found",
              fromShare: true,
            },
            replace: true,
          });
        }
      } catch (error) {
        console.error("Error checking document access:", error);
        navigate(`/join?docId=${docId}&error=server_error`, {
          state: {
            error: "Failed to check document access",
            fromShare: true,
          },
          replace: true,
        });
      } finally {
        setChecking(false);
      }
    };

    handleShareRedirect();
  }, [docId, isAuthenticated, user, authLoading, navigate]);

  // Show loading state while checking
  if (authLoading || checking) {
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
              duration: 1.5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
            className="w-12 h-12 mx-auto mb-4 border-3 border-neon-purple border-t-transparent rounded-full"
          />
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            <FileText className="w-8 h-8 mx-auto mb-3 text-neon-purple" />
            <p className="text-white text-lg font-medium">
              {!isAuthenticated
                ? "Redirecting to sign in..."
                : "Checking document access..."}
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Please wait while we verify your permissions
            </p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // This component should not render anything after redirects
  return null;
};

export default ShareRedirect;
