"use client"

import { motion } from "framer-motion"
import { forwardRef } from "react"

const AnimatedButton = forwardRef(
  ({ children, variant = "primary", size = "md", className = "", disabled = false, ...props }, ref) => {
    const baseClasses =
      "font-semibold rounded-2xl transition-all duration-300 flex items-center justify-center space-x-2"

    const variants = {
      primary: "btn-primary",
      secondary: "btn-secondary",
      ghost: "text-white hover:bg-white/10 border border-white/20",
      danger: "bg-red-500 hover:bg-red-600 text-white",
      success: "bg-green-500 hover:bg-green-600 text-white",
    }

    const sizes = {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-3 text-base",
      lg: "px-8 py-4 text-lg",
    }

    const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className} ${
      disabled ? "opacity-50 cursor-not-allowed" : ""
    }`

    return (
      <motion.button
        ref={ref}
        whileHover={disabled ? {} : { scale: 1.05, y: -2 }}
        whileTap={disabled ? {} : { scale: 0.95 }}
        className={classes}
        disabled={disabled}
        {...props}
      >
        {children}
      </motion.button>
    )
  },
)

AnimatedButton.displayName = "AnimatedButton"

export default AnimatedButton
