"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  WifiOff,
  Wifi,
  Download,
  Upload,
  Send as Sync,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  RefreshCw,
  Settings,
  HardDrive,
  Cloud,
  Activity,
} from "lucide-react"
import Layout from "../components/Layout"
import AnimatedButton from "../components/AnimatedButton"

const Offline = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [syncStatus, setSyncStatus] = useState("synced")
  const [offlineDocuments, setOfflineDocuments] = useState([
    {
      id: 1,
      title: "Project Proposal Draft",
      lastModified: "2024-03-10 14:30",
      size: "2.4 MB",
      status: "pending_sync",
      changes: 15,
    },
    {
      id: 2,
      title: "Meeting Notes - Q1 Review",
      lastModified: "2024-03-10 11:15",
      size: "1.2 MB",
      status: "synced",
      changes: 0,
    },
    {
      id: 3,
      title: "Design System Guidelines",
      lastModified: "2024-03-09 16:45",
      size: "5.8 MB",
      status: "conflict",
      changes: 8,
    },
  ])

  const [storageInfo, setStorageInfo] = useState({
    used: 45.2,
    total: 100,
    documents: 12,
    pendingSync: 3,
  })

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const handleSyncAll = () => {
    setSyncStatus("syncing")
    setTimeout(() => {
      setSyncStatus("synced")
      setOfflineDocuments((docs) => docs.map((doc) => ({ ...doc, status: "synced", changes: 0 })))
    }, 3000)
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "synced":
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case "pending_sync":
        return <Clock className="w-5 h-5 text-yellow-400" />
      case "conflict":
        return <AlertCircle className="w-5 h-5 text-red-400" />
      default:
        return <FileText className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case "synced":
        return "Synced"
      case "pending_sync":
        return "Pending Sync"
      case "conflict":
        return "Conflict"
      default:
        return "Unknown"
    }
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">Offline Mode</h1>
                <p className="text-gray-300">Manage your offline documents and sync status</p>
              </div>

              {/* Connection Status */}
              <div
                className={`flex items-center space-x-3 px-4 py-2 rounded-xl ${
                  isOnline ? "bg-green-500/20 border border-green-500/30" : "bg-red-500/20 border border-red-500/30"
                }`}
              >
                {isOnline ? <Wifi className="w-5 h-5 text-green-400" /> : <WifiOff className="w-5 h-5 text-red-400" />}
                <span className={`font-medium ${isOnline ? "text-green-400" : "text-red-400"}`}>
                  {isOnline ? "Online" : "Offline"}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <HardDrive className="w-8 h-8 text-purple-400" />
                <span className="text-2xl font-bold text-white">{storageInfo.used}MB</span>
              </div>
              <h3 className="text-white font-semibold mb-1">Storage Used</h3>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(storageInfo.used / storageInfo.total) * 100}%` }}
                />
              </div>
              <p className="text-gray-400 text-sm mt-2">{storageInfo.total - storageInfo.used}MB available</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <FileText className="w-8 h-8 text-teal-400" />
                <span className="text-2xl font-bold text-white">{storageInfo.documents}</span>
              </div>
              <h3 className="text-white font-semibold mb-1">Offline Documents</h3>
              <p className="text-gray-400 text-sm">Available offline</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <Clock className="w-8 h-8 text-yellow-400" />
                <span className="text-2xl font-bold text-white">{storageInfo.pendingSync}</span>
              </div>
              <h3 className="text-white font-semibold mb-1">Pending Sync</h3>
              <p className="text-gray-400 text-sm">Waiting for connection</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <Activity className="w-8 h-8 text-orange-400" />
                <div
                  className={`w-3 h-3 rounded-full ${
                    syncStatus === "syncing"
                      ? "bg-yellow-400 animate-pulse"
                      : syncStatus === "synced"
                        ? "bg-green-400"
                        : "bg-gray-400"
                  }`}
                />
              </div>
              <h3 className="text-white font-semibold mb-1">Sync Status</h3>
              <p className="text-gray-400 text-sm capitalize">{syncStatus.replace("_", " ")}</p>
            </motion.div>
          </div>

          {/* Sync Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">Sync Management</h2>
                <p className="text-gray-400">Control how your documents sync between devices</p>
              </div>

              <div className="flex items-center space-x-4">
                <AnimatedButton
                  onClick={handleSyncAll}
                  disabled={!isOnline || syncStatus === "syncing"}
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 disabled:opacity-50"
                >
                  {syncStatus === "syncing" ? (
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <Sync className="w-5 h-5 mr-2" />
                  )}
                  {syncStatus === "syncing" ? "Syncing..." : "Sync All"}
                </AnimatedButton>

                <button className="p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-gray-300 hover:text-white hover:bg-white/20 transition-all duration-300">
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Offline Documents */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-white/10">
              <h2 className="text-xl font-semibold text-white">Offline Documents</h2>
              <p className="text-gray-400 text-sm mt-1">Documents available for offline editing</p>
            </div>

            <div className="divide-y divide-white/10">
              {offlineDocuments.map((doc, index) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="p-6 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                        <FileText className="w-6 h-6 text-white" />
                      </div>

                      <div>
                        <h3 className="text-white font-semibold">{doc.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                          <span>Modified {doc.lastModified}</span>
                          <span>{doc.size}</span>
                          {doc.changes > 0 && <span className="text-yellow-400">{doc.changes} unsaved changes</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(doc.status)}
                        <span
                          className={`text-sm font-medium ${
                            doc.status === "synced"
                              ? "text-green-400"
                              : doc.status === "pending_sync"
                                ? "text-yellow-400"
                                : doc.status === "conflict"
                                  ? "text-red-400"
                                  : "text-gray-400"
                          }`}
                        >
                          {getStatusText(doc.status)}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        {doc.status === "pending_sync" && (
                          <button className="p-2 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-yellow-400 hover:bg-yellow-500/30 transition-colors">
                            <Upload className="w-4 h-4" />
                          </button>
                        )}

                        {doc.status === "conflict" && (
                          <button className="p-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/30 transition-colors">
                            <AlertCircle className="w-4 h-4" />
                          </button>
                        )}

                        <button className="p-2 bg-white/10 border border-white/20 rounded-lg text-gray-400 hover:text-white hover:bg-white/20 transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Offline Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-8 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-2xl p-6"
          >
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Cloud className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-2">Offline Mode Tips</h3>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Documents are automatically saved locally while offline</li>
                  <li>• Changes will sync automatically when connection is restored</li>
                  <li>• Conflicts are highlighted and can be resolved manually</li>
                  <li>• Offline storage is limited to 100MB per device</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  )
}

export default Offline
