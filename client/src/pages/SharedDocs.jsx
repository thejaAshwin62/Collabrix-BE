"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Share2,
  Users,
  Clock,
  Eye,
  Download,
  ExternalLink,
  Search,
  AlertCircle,
} from "lucide-react";
import Layout from "../components/Layout";
import AnimatedButton from "../components/AnimatedButton";
import { documentAPI } from "../utils/documentAPI";

const SharedDocs = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState("all"); // 'all', 'viewer', 'editor', 'admin'
  const [sharedDocs, setSharedDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSharedDocuments();
  }, []);

  const fetchSharedDocuments = async () => {
    setLoading(true);
    try {
      const result = await documentAPI.getSharedDocuments();
      if (result.success) {
        console.log("Raw shared documents from API:", result.data);
        // Transform the backend data to match our component structure
        const transformedDocs = result.data.map((doc) => ({
          id: doc._id || doc.id,
          title: doc.title,
          description: doc.description || "No description available",
          owner: doc.owner?.name || doc.owner?.username || "Unknown",
          ownerAvatar: doc.owner?.avatar || doc.owner?.name?.charAt(0) || "?",
          permission: doc.permission || doc.userPermission || "view",
          lastModified: doc.updatedAt
            ? new Date(doc.updatedAt).toLocaleDateString()
            : "Unknown",
          collaborators: doc.collaborators || [],
          starred: doc.starred || false,
          views: doc.views || 0,
        }));
        setSharedDocs(transformedDocs);
        setError(null);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Failed to fetch shared documents");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDocument = (doc) => {
    console.log("Opening document:", doc);
    console.log("Navigating to:", `/editor/${doc.id}`);
    navigate(`/editor/${doc.id}`);
  };

  const getPermissionBadge = (permission) => {
    const colors = {
      admin: "bg-neon-orange/20 text-neon-orange border-neon-orange/30",
      editor: "bg-neon-teal/20 text-neon-teal border-neon-teal/30",
      viewer: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium border ${colors[permission]}`}
      >
        {permission.charAt(0).toUpperCase() + permission.slice(1)}
      </span>
    );
  };

  const filteredDocs = sharedDocs.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.owner.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = filterBy === "all" || doc.permission === filterBy;

    return matchesSearch && matchesFilter;
  });

  return (
    <Layout>
      <div className="h-[calc(100vh-4rem)] overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0"
          >
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center space-x-3">
                <Share2 className="w-8 h-8 text-neon-teal" />
                <span>Shared with Me</span>
              </h1>
              <p className="text-gray-400">
                Documents and folders that others have shared with you.
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <AnimatedButton variant="secondary" size="sm">
                <Download className="w-4 h-4" />
                Export List
              </AnimatedButton>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6"
          >
            {[
              {
                label: "Total Shared",
                value: sharedDocs.length,
                icon: Share2,
                color: "text-neon-purple",
              },
              {
                label: "Can Edit",
                value: sharedDocs.filter(
                  (d) => d.permission === "editor" || d.permission === "admin"
                ).length,
                icon: Users,
                color: "text-neon-teal",
              },
              {
                label: "Total Views",
                value: sharedDocs.reduce((sum, doc) => sum + doc.views, 0),
                icon: Eye,
                color: "text-neon-orange",
              },
              {
                label: "Active Today",
                value: sharedDocs.filter((d) => d.lastModified.includes("hour"))
                  .length,
                icon: Clock,
                color: "text-neon-pink",
              },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                whileHover={{ scale: 1.02, y: -5 }}
                className="glass rounded-2xl p-6 border border-white/10"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-white/10 ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white mb-1">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-400">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Filters and Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0"
          >
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors duration-300 peer-focus:text-neon-purple" />
              <input
                type="text"
                placeholder="Search shared documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-12 w-full peer"
              />
            </div>

            {/* Permission Filter */}
            <div className="flex items-center space-x-1 glass rounded-xl p-1">
              {[
                { key: "all", label: "All" },
                { key: "admin", label: "Admin" },
                { key: "editor", label: "Editor" },
                { key: "viewer", label: "Viewer" },
              ].map((filter) => (
                <motion.button
                  key={filter.key}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFilterBy(filter.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    filterBy === filter.key
                      ? "bg-neon-purple text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {filter.label}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Shared Documents */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            {loading ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 border-4 border-neon-purple/30 border-t-neon-purple rounded-full animate-spin"></div>
                <p className="text-gray-400">Loading shared documents...</p>
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 bg-red-500/20 rounded-3xl flex items-center justify-center">
                  <AlertCircle className="w-12 h-12 text-red-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Error loading documents
                </h3>
                <p className="text-gray-400 mb-4">{error}</p>
                <button onClick={fetchSharedDocuments} className="btn-primary">
                  Try Again
                </button>
              </div>
            ) : (
              filteredDocs.map((doc, index) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.01, x: 5 }}
                  className="glass rounded-2xl p-6 cursor-pointer group border border-white/10 hover:border-neon-purple/30 transition-all duration-300"
                  onClick={() => handleOpenDocument(doc)}
                >
                  <div className="flex items-start space-x-4">
                    {/* Owner Avatar */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-neon-purple to-neon-teal flex items-center justify-center">
                        <span className="text-sm font-semibold text-white">
                          {doc.owner
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-white group-hover:text-neon-purple transition-colors">
                          {doc.title}
                        </h3>
                        {getPermissionBadge(doc.permission)}
                        {doc.starred && (
                          <motion.div
                            animate={{ rotate: [0, 15, -15, 0] }}
                            transition={{
                              duration: 2,
                              repeat: Number.POSITIVE_INFINITY,
                            }}
                          >
                            <Share2 className="w-4 h-4 text-neon-orange" />
                          </motion.div>
                        )}
                      </div>

                      <p className="text-gray-400 mb-3">{doc.description}</p>

                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>Shared by {doc.owner}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{doc.lastModified}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>{doc.views} views</span>
                        </span>
                      </div>

                      {/* Collaborators */}
                      {doc.collaborators.length > 0 && (
                        <div className="flex items-center space-x-1 mt-3">
                          <span className="text-xs text-gray-500 mr-2">
                            Collaborators:
                          </span>
                          {doc.collaborators
                            .slice(0, 4)
                            .map((collaborator, index) => (
                              <motion.div
                                key={collaborator.id}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className="w-6 h-6 rounded-full bg-gradient-to-r from-neon-purple to-neon-teal flex items-center justify-center text-xs font-semibold text-white border-2 border-dark-300"
                                style={{ marginLeft: index > 0 ? "-8px" : "0" }}
                              >
                                {collaborator.name.charAt(0).toUpperCase()}
                              </motion.div>
                            ))}
                          {doc.collaborators.length > 4 && (
                            <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-xs font-semibold text-white border-2 border-dark-300 -ml-2">
                              +{doc.collaborators.length - 4}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDocument(doc);
                        }}
                        className="p-2 rounded-lg text-gray-400 hover:text-neon-teal transition-colors"
                        title="Open document"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>

          {/* Empty State */}
          {!loading && !error && filteredDocs.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-neon-purple to-neon-teal rounded-3xl flex items-center justify-center">
                <Share2 className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                No shared documents found
              </h3>
              <p className="text-gray-400">
                {searchQuery
                  ? "Try adjusting your search terms"
                  : "No documents have been shared with you yet"}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SharedDocs;
