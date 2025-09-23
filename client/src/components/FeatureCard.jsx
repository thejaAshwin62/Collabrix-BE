"use client"

import { motion } from "framer-motion"
import { cn } from "../lib/utils"

const FeatureCard = ({ icon, title, description, color = "neon-purple" }) => {
  const colorClasses = {
    "neon-purple": "from-neon-purple/20 to-neon-purple/5 border-neon-purple/30 shadow-neon-purple/20",
    "neon-teal": "from-neon-teal/20 to-neon-teal/5 border-neon-teal/30 shadow-neon-teal/20",
    "neon-orange": "from-neon-orange/20 to-neon-orange/5 border-neon-orange/30 shadow-neon-orange/20",
    "neon-pink": "from-neon-pink/20 to-neon-pink/5 border-neon-pink/30 shadow-neon-pink/20",
  }

  const iconColors = {
    "neon-purple": "text-neon-purple",
    "neon-teal": "text-neon-teal",
    "neon-orange": "text-neon-orange",
    "neon-pink": "text-neon-pink",
  }

  return (
    <motion.div
      className={cn(
        "relative p-8 rounded-2xl backdrop-blur-md border shadow-lg transition-all duration-300 group cursor-pointer",
        "bg-gradient-to-br",
        colorClasses[color],
      )}
      whileHover={{
        scale: 1.05,
        rotateY: 5,
        rotateX: 5,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
      }}
    >
      {/* Glow effect on hover */}
      <motion.div
        className={cn(
          "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl",
          colorClasses[color],
        )}
        initial={false}
      />

      <div className="relative z-10">
        {/* Icon */}
        <motion.div
          className={cn(
            "w-16 h-16 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 flex items-center justify-center mb-6",
            iconColors[color],
          )}
          whileHover={{ rotate: 10, scale: 1.1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {icon}
        </motion.div>

        {/* Content */}
        <h3 className="text-xl font-bold text-white mb-4 group-hover:text-white transition-colors">{title}</h3>
        <p className="text-gray-300 leading-relaxed group-hover:text-gray-200 transition-colors">{description}</p>
      </div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className={cn("absolute w-1 h-1 rounded-full", `bg-${color}`)}
            style={{
              left: `${20 + i * 30}%`,
              top: `${30 + i * 20}%`,
            }}
            animate={{
              y: [-10, -20, -10],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 2 + i * 0.5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}

export default FeatureCard
