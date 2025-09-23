"use client"

import { useState, forwardRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Eye, EyeOff } from "lucide-react"

const FormInput = forwardRef(
  (
    { label, type = "text", placeholder, error, icon: Icon, className = "", showPasswordToggle = false, ...props },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false)
    const [isFocused, setIsFocused] = useState(false)

    const inputType = type === "password" && showPassword ? "text" : type

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`relative ${className}`}>
        {/* Floating Label */}
        <AnimatePresence>
          {label && (
            <motion.label
              initial={{ opacity: 0, y: 10 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: isFocused || props.value ? 0.85 : 1,
                x: isFocused || props.value ? 12 : 0,
              }}
              className={`absolute left-4 transition-all duration-300 pointer-events-none z-10 ${
                isFocused || props.value ? "top-2 text-xs text-neon-purple" : "top-1/2 -translate-y-1/2 text-gray-400"
              }`}
            >
              {label}
            </motion.label>
          )}
        </AnimatePresence>

        {/* Input Container */}
        <div className="relative">
          {/* Icon */}
          {Icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
              <Icon
                className={`w-5 h-5 transition-colors duration-300 ${isFocused ? "text-neon-purple" : "text-gray-400"}`}
              />
            </div>
          )}

          {/* Input */}
          <motion.input
            ref={ref}
            type={inputType}
            placeholder={!label ? placeholder : ""}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`input-field w-full ${Icon ? "pl-12" : "pl-4"} ${
              showPasswordToggle || type === "password" ? "pr-12" : "pr-4"
            } ${label ? "pt-6 pb-2" : "py-3"} ${
              error ? "border-red-500 focus:ring-red-500/50" : ""
            } ${isFocused ? "ring-2 ring-neon-purple/50 bg-white/10" : ""}`}
            {...props}
          />

          {/* Password Toggle */}
          {(showPasswordToggle || type === "password") && (
            <motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-300"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </motion.button>
          )}
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-red-400 text-sm mt-2 ml-1"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Focus Glow Effect */}
        <AnimatePresence>
          {isFocused && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 rounded-2xl bg-gradient-to-r from-neon-purple/20 to-neon-teal/20 blur-xl -z-10"
            />
          )}
        </AnimatePresence>
      </motion.div>
    )
  },
)

FormInput.displayName = "FormInput"

export default FormInput
