"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Users,
  Plus,
  Crown,
  UserPlus,
  Mail,
  Shield,
  Search,
  Filter,
  MoreVertical,
  FileText,
  Activity,
} from "lucide-react"
import Layout from "../components/Layout"
import AnimatedButton from "../components/AnimatedButton"

const Teams = () => {
  const [activeTab, setActiveTab] = useState("teams")
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateTeam, setShowCreateTeam] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState(null)

  const teams = [
    {
      id: 1,
      name: "Design Team",
      description: "UI/UX designers working on product interfaces",
      members: 8,
      documents: 24,
      avatar: "🎨",
      role: "owner",
      activity: "Active 2h ago",
      color: "from-purple-500 to-pink-500",
    },
    {
      id: 2,
      name: "Engineering",
      description: "Full-stack developers building the platform",
      members: 12,
      documents: 45,
      avatar: "⚡",
      role: "admin",
      activity: "Active 30m ago",
      color: "from-teal-500 to-cyan-500",
    },
    {
      id: 3,
      name: "Marketing",
      description: "Growth and marketing strategy team",
      members: 6,
      documents: 18,
      avatar: "📈",
      role: "member",
      activity: "Active 1d ago",
      color: "from-orange-500 to-red-500",
    },
  ]

  const members = [
    {
      id: 1,
      name: "Alex Chen",
      email: "alex@company.com",
      role: "Owner",
      avatar: "AC",
      status: "online",
      joinDate: "2024-01-15",
      documents: 32,
    },
    {
      id: 2,
      name: "Sarah Johnson",
      email: "sarah@company.com",
      role: "Admin",
      avatar: "SJ",
      status: "away",
      joinDate: "2024-02-01",
      documents: 28,
    },
    {
      id: 3,
      name: "Mike Rodriguez",
      email: "mike@company.com",
      role: "Member",
      avatar: "MR",
      status: "offline",
      joinDate: "2024-02-15",
      documents: 15,
    },
  ]

  const invitations = [
    {
      id: 1,
      email: "john@company.com",
      role: "Member",
      sentBy: "Alex Chen",
      sentDate: "2024-03-10",
      status: "pending",
    },
    {
      id: 2,
      email: "emma@company.com",
      role: "Admin",
      sentBy: "Sarah Johnson",
      sentDate: "2024-03-08",
      status: "expired",
    },
  ]

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Teams</h1>
            <p className="text-gray-300">Manage your teams and collaborate with members</p>
          </motion.div>

          {/* Tabs */}
          <div className="flex space-x-1 mb-8 bg-white/5 backdrop-blur-sm rounded-xl p-1">
            {["teams", "members", "invitations"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 capitalize ${
                  activeTab === tab
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "teams" && (
              <motion.div
                key="teams"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                {/* Teams Header */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search teams..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <button className="p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-gray-300 hover:text-white hover:bg-white/20 transition-all duration-300">
                      <Filter className="w-5 h-5" />
                    </button>
                  </div>
                  <AnimatedButton
                    onClick={() => setShowCreateTeam(true)}
                    className="bg-gradient-to-r from-purple-500 to-pink-500"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Create Team
                  </AnimatedButton>
                </div>

                {/* Teams Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {teams.map((team) => (
                    <motion.div
                      key={team.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -5 }}
                      className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 cursor-pointer"
                      onClick={() => setSelectedTeam(team)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className={`w-12 h-12 rounded-xl bg-gradient-to-r ${team.color} flex items-center justify-center text-2xl`}
                        >
                          {team.avatar}
                        </div>
                        <div className="flex items-center space-x-2">
                          {team.role === "owner" && <Crown className="w-4 h-4 text-yellow-400" />}
                          {team.role === "admin" && <Shield className="w-4 h-4 text-blue-400" />}
                          <button className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                            <MoreVertical className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                      </div>

                      <h3 className="text-xl font-semibold text-white mb-2">{team.name}</h3>
                      <p className="text-gray-300 text-sm mb-4 line-clamp-2">{team.description}</p>

                      <div className="flex items-center justify-between text-sm text-gray-400">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{team.members}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <FileText className="w-4 h-4" />
                            <span>{team.documents}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Activity className="w-4 h-4" />
                          <span className="text-xs">{team.activity}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === "members" && (
              <motion.div
                key="members"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                {/* Members Header */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search members..."
                        className="pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <AnimatedButton className="bg-gradient-to-r from-teal-500 to-cyan-500">
                    <UserPlus className="w-5 h-5 mr-2" />
                    Invite Member
                  </AnimatedButton>
                </div>

                {/* Members List */}
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden">
                  {members.map((member, index) => (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-6 border-b border-white/10 last:border-b-0 hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {member.avatar}
                          </div>
                          <div
                            className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 ${
                              member.status === "online"
                                ? "bg-green-400"
                                : member.status === "away"
                                  ? "bg-yellow-400"
                                  : "bg-gray-400"
                            }`}
                          />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">{member.name}</h3>
                          <p className="text-gray-400 text-sm">{member.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <p className="text-white text-sm font-medium">{member.role}</p>
                          <p className="text-gray-400 text-xs">Joined {member.joinDate}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white text-sm">{member.documents}</p>
                          <p className="text-gray-400 text-xs">Documents</p>
                        </div>
                        <button className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                          <MoreVertical className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === "invitations" && (
              <motion.div
                key="invitations"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                {/* Invitations Header */}
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-semibold text-white">Pending Invitations</h2>
                  <AnimatedButton className="bg-gradient-to-r from-orange-500 to-red-500">
                    <Mail className="w-5 h-5 mr-2" />
                    Send Invitation
                  </AnimatedButton>
                </div>

                {/* Invitations List */}
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden">
                  {invitations.map((invitation, index) => (
                    <motion.div
                      key={invitation.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-6 border-b border-white/10 last:border-b-0 hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center">
                          <Mail className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">{invitation.email}</h3>
                          <p className="text-gray-400 text-sm">Invited by {invitation.sentBy}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <p className="text-white text-sm font-medium">{invitation.role}</p>
                          <p className="text-gray-400 text-xs">Sent {invitation.sentDate}</p>
                        </div>
                        <div
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            invitation.status === "pending"
                              ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                              : "bg-red-500/20 text-red-400 border border-red-500/30"
                          }`}
                        >
                          {invitation.status}
                        </div>
                        <button className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                          <MoreVertical className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  )
}

export default Teams
