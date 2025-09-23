"use client"

import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { ExternalLink, Users } from "lucide-react"

const ActivityCard = ({ activity, icon: Icon, iconColor }) => {
  return (
    <motion.div
      className="glass-panel p-6 hover:bg-white/10 transition-all duration-300 group"
      whileHover={{ scale: 1.01, x: 4 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="flex items-start gap-4">
        {/* User Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-dark-surface">
            <img
              src={activity.user.avatar || "/placeholder.svg"}
              alt={activity.user.name}
              className="w-full h-full object-cover"
            />
          </div>
          {/* Activity Icon */}
          <div
            className={`absolute -bottom-1 -right-1 w-6 h-6 bg-dark-surface rounded-full flex items-center justify-center border-2 border-dark-surface ${iconColor}`}
          >
            <Icon className="w-3 h-3" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <p className="text-white">
                <span className="font-medium">{activity.user.name}</span>{" "}
                <span className="text-gray-300">{activity.action}</span>{" "}
                <Link
                  to={`/editor/${activity.document.id}`}
                  className="font-medium text-neon-purple hover:text-neon-teal transition-colors"
                >
                  {activity.target}
                </Link>
              </p>
              <p className="text-sm text-gray-400 mt-1">{activity.timestamp}</p>
            </div>

            <Link
              to={`/editor/${activity.document.id}`}
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <motion.button
                className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <ExternalLink className="w-4 h-4" />
              </motion.button>
            </Link>
          </div>

          {/* Activity Details */}
          {activity.details && (
            <div className="mb-4">
              <p className="text-gray-300 text-sm leading-relaxed">{activity.details}</p>
            </div>
          )}

          {/* Document Preview */}
          <div className="flex items-center gap-3">
            <div className="w-16 h-10 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src={activity.document.cover || "/placeholder.svg"}
                alt={activity.document.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{activity.document.title}</p>
              <p className="text-xs text-gray-400 capitalize">{activity.targetType}</p>
            </div>
          </div>

          {/* Shared With (for share activities) */}
          {activity.type === "share" && activity.sharedWith && (
            <div className="mt-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">Shared with {activity.sharedWith.length} people</span>
              <div className="flex -space-x-1">
                {activity.sharedWith.slice(0, 3).map((email, index) => (
                  <div
                    key={index}
                    className="w-6 h-6 bg-gradient-to-r from-neon-purple to-neon-teal rounded-full flex items-center justify-center text-xs text-white font-medium border-2 border-dark-surface"
                  >
                    {email.charAt(0).toUpperCase()}
                  </div>
                ))}
                {activity.sharedWith.length > 3 && (
                  <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-xs text-white border-2 border-dark-surface">
                    +{activity.sharedWith.length - 3}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default ActivityCard
