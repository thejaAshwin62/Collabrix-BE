"use client"

import { motion } from "framer-motion"
import { FileText, Users, Clock, TrendingUp } from "lucide-react"

const QuickStats = () => {
  const stats = [
    {
      label: "Documents",
      value: "24",
      change: "+3 this week",
      icon: FileText,
      color: "neon-purple",
    },
    {
      label: "Collaborators",
      value: "12",
      change: "+2 new",
      icon: Users,
      color: "neon-teal",
    },
    {
      label: "Hours Saved",
      value: "156",
      change: "+12 this month",
      icon: Clock,
      color: "neon-orange",
    },
    {
      label: "Productivity",
      value: "94%",
      change: "+8% increase",
      icon: TrendingUp,
      color: "neon-pink",
    },
  ]

  const colorClasses = {
    "neon-purple": "from-neon-purple/20 to-neon-purple/5 border-neon-purple/30 text-neon-purple",
    "neon-teal": "from-neon-teal/20 to-neon-teal/5 border-neon-teal/30 text-neon-teal",
    "neon-orange": "from-neon-orange/20 to-neon-orange/5 border-neon-orange/30 text-neon-orange",
    "neon-pink": "from-neon-pink/20 to-neon-pink/5 border-neon-pink/30 text-neon-pink",
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          className={`glass-panel p-6 bg-gradient-to-br border ${colorClasses[stat.color]} hover:scale-105 transition-all duration-300`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          whileHover={{ y: -5 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-2xl bg-gradient-to-br ${colorClasses[stat.color]}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          </div>
          <div className="text-sm text-gray-300">{stat.change}</div>
        </motion.div>
      ))}
    </div>
  )
}

export default QuickStats
