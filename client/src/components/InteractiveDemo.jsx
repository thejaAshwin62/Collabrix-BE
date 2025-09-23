"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { Type, Bold, Italic, List, MessageCircle } from "lucide-react"

const InteractiveDemo = () => {
  const [text, setText] = useState("")
  const [cursors, setCursors] = useState([
    { id: 1, name: "Alex", color: "#8B5CF6", position: 0 },
    { id: 2, name: "Sarah", color: "#14B8A6", position: 15 },
  ])

  const demoText = "Experience real-time collaboration like never before..."

  useEffect(() => {
    const interval = setInterval(() => {
      setText((prev) => {
        if (prev.length < demoText.length) {
          return demoText.slice(0, prev.length + 1)
        }
        return ""
      })
    }, 150)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCursors((prev) =>
        prev.map((cursor) => ({
          ...cursor,
          position: Math.random() * 40,
        })),
      )
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div
      className="max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.5 }}
    >
      <div className="glass-panel p-8 neon-glow">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-white mb-2">Live Demo</h3>
          <p className="text-gray-300">Watch real-time collaboration in action</p>
        </div>

        {/* Mock Editor Interface */}
        <div className="bg-dark-surface rounded-xl border border-white/10 overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center gap-4 px-4 py-3 border-b border-white/10 bg-dark-accent/50">
            <div className="flex items-center gap-2">
              {[Type, Bold, Italic, List, MessageCircle].map((Icon, index) => (
                <motion.button
                  key={index}
                  className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="w-4 h-4" />
                </motion.button>
              ))}
            </div>

            {/* User Avatars */}
            <div className="flex items-center gap-2 ml-auto">
              {cursors.map((cursor) => (
                <motion.div
                  key={cursor.id}
                  className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: cursor.id * 0.2 }}
                >
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cursor.color }} />
                  <span className="text-xs text-gray-300">{cursor.name}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Editor Content */}
          <div className="p-6 min-h-[200px] relative">
            <div className="text-white font-mono text-lg leading-relaxed">
              {text}
              <motion.span
                className="inline-block w-0.5 h-6 bg-neon-purple ml-1"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
              />
            </div>

            {/* Collaborative Cursors */}
            {cursors.map((cursor) => (
              <motion.div
                key={cursor.id}
                className="absolute pointer-events-none"
                style={{
                  left: `${cursor.position}%`,
                  top: "2rem",
                }}
                animate={{
                  left: `${cursor.position}%`,
                }}
                transition={{ duration: 1, ease: "easeInOut" }}
              >
                <div className="w-0.5 h-6 rounded-full" style={{ backgroundColor: cursor.color }} />
                <div
                  className="absolute -top-8 left-0 px-2 py-1 rounded text-xs text-white whitespace-nowrap"
                  style={{ backgroundColor: cursor.color }}
                >
                  {cursor.name}
                </div>
              </motion.div>
            ))}

            {/* Floating Comments */}
            <motion.div
              className="absolute right-4 top-16 w-64 bg-glass-white backdrop-blur-md rounded-xl border border-white/20 p-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 2, duration: 0.5 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-neon-teal" />
                <span className="text-sm font-medium text-white">Sarah</span>
              </div>
              <p className="text-sm text-gray-300">Great start! Maybe we should add more details about the features?</p>
            </motion.div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mt-8">
          {[
            { label: "Active Users", value: "2.4K+" },
            { label: "Documents", value: "15K+" },
            { label: "Edits/min", value: "850+" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + index * 0.1 }}
            >
              <div className="text-2xl font-bold gradient-text mb-1">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default InteractiveDemo
