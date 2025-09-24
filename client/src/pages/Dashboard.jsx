"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Grid3X3,
  List,
  Star,
  Clock,
  Users,
  FileText,
  Folder,
  MoreVertical,
  Pin,
  TrendingUp,
  Zap,
} from "lucide-react";
import Layout from "../components/Layout";
import DashboardCard from "../components/DashboardCard";
import AnimatedButton from "../components/AnimatedButton";
import CreateDocumentModal from "../components/CreateDocumentModal";
import AccessRequestPanel from "../components/AccessRequestPanel";
import {
  DocumentOptionsMenu,
  EditDocumentModal,
} from "../components/DocumentOptionsMenu";
import { useAuth } from "../context/AuthContext";
import { documentAPI } from "../utils/documentAPI";

const Dashboard = () => {
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState("all"); // 'all', 'recent', 'starred', 'shared'
  const [sortBy, setSortBy] = useState("modified"); // 'modified', 'created', 'name'
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Menu and modal states
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [stats, setStats] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);

  const navigate = useNavigate();
  const { user } = useAuth();

  // console.log(documents);

  // Fetch documents on component mount
  useEffect(() => {
    fetchDocuments();
    fetchStats();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const result = await documentAPI.getDocuments();
      if (result.success) {
        // Transform documents to ensure they have both id and _id
        const transformedDocs = result.data.map((doc) => ({
          ...doc,
          id: doc._id || doc.id, // Use _id as id if id doesn't exist
          description: doc.description || "No description",
          lastModified: doc.updatedAt || doc.createdAt || "Unknown",
          collaborators: doc.collaborators || [],
          starred: doc.starred || false,
          type: doc.type || "document",
          size: "Unknown",
          views: 0,
        }));
        setDocuments(transformedDocs);
        setError(null);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Failed to fetch documents");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const result = await documentAPI.getDashboardStats();
      if (result.success) {
        const statsData = [
          {
            label: "Total Documents",
            value: result.data.totalDocuments.value,
            change: result.data.totalDocuments.change,
            icon: FileText,
            color: "text-purple-500",
          },
          {
            label: "Collaborators",
            value: result.data.collaborators.value,
            change: result.data.collaborators.change,
            icon: Users,
            color: "text-teal-500",
          },
          {
            label: "Views This Month",
            value:
              result.data.viewsThisMonth.value > 1000
                ? `${(result.data.viewsThisMonth.value / 1000).toFixed(1)}K`
                : result.data.viewsThisMonth.value,
            change: result.data.viewsThisMonth.change,
            icon: TrendingUp,
            color: "text-orange-500",
          },
          {
            label: "Active Projects",
            value: result.data.activeProjects.value,
            change: result.data.activeProjects.change,
            icon: Zap,
            color: "text-pink-500",
          },
        ];
        setStats(statsData);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Failed to fetch stats");
    } finally {
      setStatsLoading(false);
    }
  };

  const handleCreateDocument = async (documentData) => {
    try {
      toast.loading("Creating document...", { id: "create-doc" });
      const result = await documentAPI.createDocument(
        documentData.title,
        documentData.description || ""
      );
      if (result.success) {
        // Refresh the documents list to include the new document
        await fetchDocuments();
        toast.success(`Document "${documentData.title}" created successfully`, {
          id: "create-doc",
        });
        // Navigate to the new document
        navigate(`/editor/${result.data._id || result.data.id}`);
        return result;
      } else {
        setError(
          "Failed to create document: " + (result.error || "Unknown error")
        );
        toast.error(result.error || "Failed to create document", {
          id: "create-doc",
        });
        throw new Error(result.error || "Failed to create document");
      }
    } catch (error) {
      setError("Failed to create document: " + error.message);
      toast.error("Failed to create document: " + error.message, {
        id: "create-doc",
      });
      throw error;
    }
  };

  const createOptions = [
    {
      label: "New Document",
      icon: FileText,
      action: () => {
        setShowCreateModal(true);
        setShowCreateMenu(false);
      },
    },
    // {
    //   label: "New Folder",
    //   icon: Folder,
    //   action: () => console.log("Create folder"),
    // },
    // {
    //   label: "Import File",
    //   icon: Plus,
    //   action: () => console.log("Import file"),
    // },
  ];

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filterBy === "all" ||
      (filterBy === "starred" && doc.starred) ||
      (filterBy === "recent" && doc.lastModified.includes("hour")) ||
      doc.lastModified.includes("day") ||
      (filterBy === "shared" && doc.owner !== "You");

    return matchesSearch && matchesFilter;
  });

  const handleStarDocument = (docId) => {
    console.log("handleStarDocument called with docId:", docId);
    setDocuments((docs) =>
      docs.map((doc) =>
        doc.id === docId ? { ...doc, starred: !doc.starred } : doc
      )
    );
  };

  const handleDocumentClick = (doc) => {
    navigate(`/editor/${doc.id}`);
  };

  const handleDocumentMenu = (position, document) => {
    setMenuPosition(position);
    setSelectedDocument(document);
    setShowOptionsMenu(true);
  };

  const handleOpenDocument = () => {
    if (selectedDocument) {
      navigate(`/editor/${selectedDocument.id}`);
      setShowOptionsMenu(false);
    }
  };

  const handleEditDocument = () => {
    setShowOptionsMenu(false);
    setShowEditModal(true);
  };

  const handleDeleteDocument = async () => {
    if (!selectedDocument) return;

    // Use Sonner with action buttons for confirmation
    toast.error(
      `Delete "${selectedDocument.title}"? This action cannot be undone.`,
      {
        duration: 10000, // 10 seconds to decide
        action: {
          label: "Delete",
          onClick: async () => {
            try {
              toast.loading("Deleting document...", { id: "delete-doc" });
              const result = await documentAPI.deleteDocument(
                selectedDocument.id
              );
              if (result.success) {
                setDocuments((docs) =>
                  docs.filter((doc) => doc.id !== selectedDocument.id)
                );
                setShowOptionsMenu(false);
                setSelectedDocument(null);
                toast.success(
                  `"${selectedDocument.title}" deleted successfully`,
                  {
                    id: "delete-doc",
                  }
                );
              } else {
                setError(result.error);
                toast.error(result.error || "Failed to delete document", {
                  id: "delete-doc",
                });
              }
            } catch (error) {
              setError("Failed to delete document");
              toast.error("Failed to delete document", { id: "delete-doc" });
            }
          },
        },
        cancel: {
          label: "Cancel",
          onClick: () => {
            toast.info("Delete cancelled");
          },
        },
      }
    );

    setShowOptionsMenu(false);
  };

  const handleSaveDocumentEdit = async (updates) => {
    if (!selectedDocument) return;

    setEditLoading(true);
    try {
      toast.loading("Updating document...", { id: "edit-doc" });
      const result = await documentAPI.updateDocument(
        selectedDocument.id,
        updates
      );
      if (result.success) {
        // Update the document in the state
        setDocuments((docs) =>
          docs.map((doc) =>
            doc.id === selectedDocument.id
              ? { ...doc, ...updates, lastModified: new Date().toISOString() }
              : doc
          )
        );
        setShowEditModal(false);
        setSelectedDocument(null);
        toast.success(
          `Document "${
            updates.title || selectedDocument.title
          }" updated successfully`,
          {
            id: "edit-doc",
          }
        );
      } else {
        setError(result.error);
        toast.error(result.error || "Failed to update document", {
          id: "edit-doc",
        });
      }
    } catch (error) {
      setError("Failed to update document");
      toast.error("Failed to update document", { id: "edit-doc" });
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-gray-400">
              Here's what's happening with your documents today.
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Create Button */}
            <div className="relative">
              <AnimatedButton
                variant="primary"
                onClick={() => setShowCreateMenu(!showCreateMenu)}
                className="relative"
              >
                <Plus className="w-5 h-5" />
                Create New
              </AnimatedButton>

              <AnimatePresence>
                {showCreateMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    className="absolute top-full right-0 mt-2 w-48 glass-strong rounded-2xl border border-white/20 p-2 z-50"
                  >
                    {createOptions.map((option, index) => (
                      <motion.button
                        key={option.label}
                        whileHover={{ x: 5 }}
                        onClick={() => {
                          option.action();
                          if (option.label !== "New Document") {
                            setShowCreateMenu(false);
                          }
                        }}
                        className="w-full flex items-center space-x-3 p-3 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300"
                      >
                        <option.icon className="w-5 h-5" />
                        <span>{option.label}</span>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center justify-between"
            >
              <p className="text-red-400">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {statsLoading
            ? // Loading skeleton for stats
              Array.from({ length: 4 }).map((_, index) => (
                <motion.div
                  key={index}
                  className="glass rounded-2xl p-6 border border-white/10 animate-pulse"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-white/10 rounded-xl"></div>
                    <div className="w-8 h-4 bg-white/10 rounded"></div>
                  </div>
                  <div>
                    <div className="w-16 h-8 bg-white/10 rounded mb-1"></div>
                    <div className="w-20 h-4 bg-white/10 rounded"></div>
                  </div>
                </motion.div>
              ))
            : stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="glass rounded-2xl p-6 border border-white/10"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-white/10 ${stat.color}`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <span className="text-sm text-green-400 font-semibold">
                      {stat.change}
                    </span>
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

        {/* Access Requests Panel */}
        <AccessRequestPanel />

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
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-12 w-full peer"
            />
          </div>

          {/* Filters and View Controls */}
          <div className="flex items-center space-x-4">
            {/* Filter Tabs */}
            <div className="flex items-center space-x-1 glass rounded-xl p-1">
              {[
                { key: "all", label: "All" },
                { key: "recent", label: "Recent" },
                { key: "starred", label: "Starred" },
                { key: "shared", label: "Shared" },
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

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-1 glass rounded-xl p-1">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  viewMode === "grid"
                    ? "bg-neon-purple text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Grid3X3 className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  viewMode === "list"
                    ? "bg-neon-purple text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <List className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Documents Grid/List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={fetchDocuments}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredDocuments.map((doc, index) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <DashboardCard
                    title={doc.title}
                    description={doc.description}
                    lastModified={doc.lastModified}
                    collaborators={doc.collaborators}
                    starred={doc.starred}
                    type={doc.type}
                    document={doc}
                    onClick={() => handleDocumentClick(doc)}
                    onStar={() => handleStarDocument(doc.id)}
                    onMenu={handleDocumentMenu}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDocuments.map((doc, index) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.01, x: 5 }}
                  onClick={() => handleDocumentClick(doc)}
                  className="glass rounded-2xl p-4 cursor-pointer group border border-white/10 hover:border-neon-purple/30 transition-all duration-300"
                >
                  <div className="flex items-center space-x-4">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      {doc.type === "folder" ? (
                        <Folder className="w-8 h-8 text-neon-teal" />
                      ) : (
                        <FileText className="w-8 h-8 text-gray-400" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-semibold text-white truncate group-hover:text-neon-purple transition-colors">
                          {doc.title}
                        </h3>
                        {doc.pinned && (
                          <Pin className="w-4 h-4 text-neon-orange" />
                        )}
                        {doc.starred && (
                          <Star className="w-4 h-4 text-neon-orange fill-current" />
                        )}
                      </div>
                      <p className="text-sm text-gray-400 truncate mb-2">
                        {doc.description}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{doc.lastModified}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Users className="w-3 h-3" />
                          <span>{doc.collaborators.length}</span>
                        </span>
                        <span>{doc.size}</span>
                        <span>{doc.views} views</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStarDocument(doc.id);
                        }}
                        className={`p-2 rounded-lg transition-colors ${
                          doc.starred
                            ? "text-neon-orange"
                            : "text-gray-400 hover:text-neon-orange"
                        }`}
                      >
                        <Star
                          className={`w-4 h-4 ${
                            doc.starred ? "fill-current" : ""
                          }`}
                        />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          const rect = e.currentTarget.getBoundingClientRect();
                          const scrollY =
                            window.scrollY ||
                            document.documentElement.scrollTop;
                          const scrollX =
                            window.scrollX ||
                            document.documentElement.scrollLeft;

                          const position = {
                            x: rect.left + scrollX - 50,
                            y: rect.bottom + scrollY + 5,
                          };

                          handleDocumentMenu(position, doc);
                        }}
                        className="p-2 rounded-lg text-gray-400 hover:text-white transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Empty State */}
        {filteredDocuments.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-neon-purple to-neon-teal rounded-3xl flex items-center justify-center">
              <FileText className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No documents found
            </h3>
            <p className="text-gray-400 mb-6">
              {searchQuery
                ? "Try adjusting your search terms"
                : "Create your first document to get started"}
            </p>
            <AnimatedButton
              variant="primary"
              onClick={() => navigate("/editor")}
            >
              <Plus className="w-5 h-5" />
              Create Document
            </AnimatedButton>
          </motion.div>
        )}

        {/* Create Document Modal */}
        <CreateDocumentModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onDocumentCreated={handleCreateDocument}
        />

        {/* Document Options Menu */}
        <DocumentOptionsMenu
          isOpen={showOptionsMenu}
          onClose={() => setShowOptionsMenu(false)}
          onOpen={handleOpenDocument}
          onEdit={handleEditDocument}
          onDelete={handleDeleteDocument}
          position={menuPosition}
        />

        {/* Edit Document Modal */}
        <EditDocumentModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveDocumentEdit}
          document={selectedDocument}
          loading={editLoading}
        />
      </div>
    </Layout>
  );
};

export default Dashboard;
