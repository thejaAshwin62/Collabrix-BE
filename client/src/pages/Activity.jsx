"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ActivityIcon,
  FileText,
  MessageSquare,
  Users,
  Star,
  Share2,
  Edit,
  Plus,
  Clock,
  Filter,
  Search,
  TrendingUp,
  Eye,
  Download,
} from "lucide-react";
import Layout from "../components/Layout";
import AnimatedButton from "../components/AnimatedButton";
import { documentAPI } from "../utils/documentAPI";

const Activity = () => {
  const [filterBy, setFilterBy] = useState("all"); // 'all', 'documents', 'comments', 'collaborations'
  const [timeFilter, setTimeFilter] = useState("today"); // 'today', 'week', 'month', 'all'
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalActivities, setTotalActivities] = useState(0);

  const ITEMS_PER_PAGE = 10;

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(0);
    setActivities([]);
    setHasMore(true);
  }, [filterBy, timeFilter, debouncedSearchQuery]);

  // Fetch activities from backend
  useEffect(() => {
    const fetchActivities = async (page = 0, reset = true) => {
      try {
        if (reset) {
          setLoading(true);
          setError(null);
        } else {
          setLoadingMore(true);
        }

        const offset = page * ITEMS_PER_PAGE;
        const result = await documentAPI.getUserActivity(
          ITEMS_PER_PAGE,
          offset
        );

        if (result.success) {
          const newActivities = result.data.activities || [];
          setTotalActivities(result.data.total || 0);
          setHasMore(result.data.hasMore || false);

          if (reset) {
            setActivities(newActivities);
          } else {
            setActivities((prev) => [...prev, ...newActivities]);
          }
        } else {
          setError(result.error || "Failed to fetch activities");
        }
      } catch (error) {
        console.error("Error fetching activities:", error);
        setError("Failed to load activities");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };

    fetchActivities(currentPage, currentPage === 0);
  }, [currentPage, filterBy, timeFilter, debouncedSearchQuery]);

  // Load more activities
  const loadMoreActivities = () => {
    if (!loadingMore && hasMore) {
      setCurrentPage((prev) => prev + 1);
    }
  };
  // Calculate stats based on real activities
  const stats = [
    {
      label: "Total Activities",
      value: totalActivities,
      change: "+12%",
      icon: ActivityIcon,
      color: "text-neon-purple",
    },
    {
      label: "Loaded Activities",
      value: activities.length,
      change: `${Math.round(
        (activities.length / Math.max(totalActivities, 1)) * 100
      )}%`,
      icon: FileText,
      color: "text-neon-teal",
    },
    {
      label: "Current Page",
      value: currentPage + 1,
      change: `of ${Math.ceil(totalActivities / ITEMS_PER_PAGE)}`,
      icon: MessageSquare,
      color: "text-neon-orange",
    },
    {
      label: "Collaborations",
      value: activities.filter(
        (a) =>
          a.type &&
          (a.type.includes("collaboration") || a.type.includes("shared"))
      ).length,
      change: "+15%",
      icon: Users,
      color: "text-neon-pink",
    },
  ];

  // Icon mapping for backend data
  const getIconComponent = (iconName) => {
    const iconMap = {
      FileText,
      Edit,
      Users,
      Star,
      Share2,
      MessageSquare,
      Eye,
      Download,
    };
    return iconMap[iconName] || FileText;
  };

  const getActivityIcon = (activity) => {
    const IconComponent = getIconComponent(activity.icon);
    return <IconComponent className={`w-5 h-5 ${activity.color}`} />;
  };

  const filteredActivities = activities.filter((activity) => {
    const matchesSearch =
      !debouncedSearchQuery ||
      activity.target
        ?.toLowerCase()
        .includes(debouncedSearchQuery.toLowerCase()) ||
      activity.user
        ?.toLowerCase()
        .includes(debouncedSearchQuery.toLowerCase()) ||
      activity.action
        ?.toLowerCase()
        .includes(debouncedSearchQuery.toLowerCase());

    const matchesFilter =
      filterBy === "all" ||
      (filterBy === "documents" &&
        activity.type &&
        activity.type.includes("document")) ||
      (filterBy === "comments" &&
        activity.type &&
        activity.type.includes("comment")) ||
      (filterBy === "collaborations" &&
        activity.type &&
        (activity.type.includes("collaboration") ||
          activity.type.includes("shared")));

    return matchesSearch && matchesFilter;
  });

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-4rem)] p-6">
        {/* Fixed Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 mb-6"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center space-x-3">
              <ActivityIcon className="w-8 h-8 text-neon-purple" />
              <span>Activity Feed</span>
            </h1>
            <p className="text-gray-400">
              Stay updated with all document activities and collaborations.
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <AnimatedButton variant="secondary" size="sm">
              <Filter className="w-4 h-4" />
              Export
            </AnimatedButton>
          </div>
        </motion.div>

        {/* Fixed Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6"
        >
          {stats.map((stat, index) => (
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

        {/* Fixed Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 mb-6"
        >
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors duration-300 peer-focus:text-neon-purple" />
            <input
              type="text"
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-12 pr-10 w-full peer"
            />
            {searchQuery !== debouncedSearchQuery && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  }}
                  className="w-4 h-4 border-2 border-neon-purple border-t-transparent rounded-full"
                />
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {/* Activity Filter */}
            <div className="flex items-center space-x-1 glass rounded-xl p-1">
              {[
                { key: "all", label: "All" },
                { key: "documents", label: "Documents" },
                { key: "comments", label: "Comments" },
                { key: "collaborations", label: "Collaborations" },
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

            {/* Time Filter */}
            <div className="flex items-center space-x-1 glass rounded-xl p-1">
              {[
                { key: "today", label: "Today" },
                { key: "week", label: "Week" },
                { key: "month", label: "Month" },
                { key: "all", label: "All Time" },
              ].map((filter) => (
                <motion.button
                  key={filter.key}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setTimeFilter(filter.key)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    timeFilter === filter.key
                      ? "bg-neon-teal text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {filter.label}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Scrollable Activity Container */}
        <div className="flex-1 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="h-full overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
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
                    <ActivityIcon className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Error Loading Activities
                  </h3>
                  <p className="text-gray-400 mb-4">{error}</p>
                  <AnimatedButton onClick={() => window.location.reload()}>
                    Retry
                  </AnimatedButton>
                </div>
              </motion.div>
            ) : filteredActivities.length > 0 ? (
              <>
                {filteredActivities.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.01, x: 5 }}
                    className="glass rounded-2xl p-6 border border-white/10 hover:border-neon-purple/30 transition-all duration-300 group"
                  >
                    <div className="flex items-start space-x-4">
                      {/* Activity Icon */}
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          {getActivityIcon(activity)}
                        </div>
                      </div>

                      {/* Activity Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          {/* User Avatar */}
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-neon-purple to-neon-teal flex items-center justify-center text-sm font-semibold text-white">
                            {activity.user.charAt(0)}
                          </div>

                          {/* Activity Description */}
                          <div className="flex-1">
                            <p className="text-white">
                              <span className="font-semibold">
                                {activity.user}
                              </span>{" "}
                              <span className="text-gray-300">
                                {activity.action}
                              </span>{" "}
                              <span className="font-semibold text-neon-purple group-hover:text-neon-teal transition-colors">
                                {activity.target}
                              </span>
                            </p>
                          </div>

                          {/* Timestamp */}
                          <div className="flex items-center space-x-1 text-sm text-gray-400">
                            <Clock className="w-4 h-4" />
                            <span>{activity.timestamp}</span>
                          </div>
                        </div>

                        {/* Activity Details */}
                        {activity.details && (
                          <p className="text-sm text-gray-400 ml-10 mb-2">
                            {activity.details}
                          </p>
                        )}

                        {/* Activity Type Badge */}
                        <div className="ml-10">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                              activity.type.includes("document")
                                ? "bg-neon-purple/20 text-neon-purple border-neon-purple/30"
                                : activity.type.includes("comment")
                                ? "bg-neon-orange/20 text-neon-orange border-neon-orange/30"
                                : activity.type.includes("collaboration") ||
                                  activity.type.includes("shared")
                                ? "bg-neon-teal/20 text-neon-teal border-neon-teal/30"
                                : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                            }`}
                          >
                            {activity.targetType}
                          </span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="flex-shrink-0">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 rounded-lg glass hover:bg-white/10 text-gray-400 hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100"
                        >
                          <TrendingUp className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Loading More Indicator */}
                {loadingMore && (
                  <div className="flex items-center justify-center py-8">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear",
                      }}
                      className="w-6 h-6 border-3 border-neon-purple border-t-transparent rounded-full mr-3"
                    />
                    <span className="text-gray-400">
                      Loading more activities...
                    </span>
                  </div>
                )}

                {/* Load More Button */}
                {hasMore && (
                  <div className="text-center pt-8">
                    <AnimatedButton
                      variant="secondary"
                      onClick={loadMoreActivities}
                      disabled={loadingMore}
                    >
                      {loadingMore ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Number.POSITIVE_INFINITY,
                              ease: "linear",
                            }}
                            className="w-5 h-5 border-2 border-current border-t-transparent rounded-full mr-2"
                          />
                          Loading...
                        </>
                      ) : (
                        <>
                          <Plus className="w-5 h-5" />
                          Load Next{" "}
                          {Math.min(
                            ITEMS_PER_PAGE,
                            totalActivities - activities.length
                          )}{" "}
                          Activities
                        </>
                      )}
                    </AnimatedButton>
                    <p className="text-sm text-gray-400 mt-3">
                      Showing {activities.length} of {totalActivities}{" "}
                      activities
                    </p>
                  </div>
                )}

                {/* No More Activities */}
                {!hasMore && activities.length >= ITEMS_PER_PAGE && (
                  <div className="text-center pt-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-neon-purple to-neon-teal rounded-2xl flex items-center justify-center">
                      <ActivityIcon className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-gray-400 text-sm">
                      You've reached the end! All {totalActivities} activities
                      loaded.
                    </p>
                  </div>
                )}
              </>
            ) : (
              /* Empty State */
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-center h-full"
              >
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-neon-purple to-neon-teal rounded-3xl flex items-center justify-center">
                    <ActivityIcon className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {totalActivities === 0
                      ? "No activities yet"
                      : "No activities found"}
                  </h3>
                  <p className="text-gray-400">
                    {totalActivities === 0
                      ? "Start creating and editing documents to see your activity here"
                      : debouncedSearchQuery
                      ? "Try adjusting your search terms or filters"
                      : "No activities match your current filters"}
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

export default Activity;
