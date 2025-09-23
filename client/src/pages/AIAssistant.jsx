"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bot, Send, FileText, Edit3, Lightbulb, Zap, Copy, ThumbsUp, ThumbsDown, RotateCcw, Wand2 } from "lucide-react"

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "ai",
      content:
        "Hello! I'm your AI writing assistant. I can help you write, edit, summarize, and improve your documents. What would you like to work on today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  const quickActions = [
    { icon: Edit3, label: "Improve Writing", prompt: "Help me improve the writing in my document" },
    { icon: FileText, label: "Summarize", prompt: "Summarize the key points from my document" },
    { icon: Lightbulb, label: "Generate Ideas", prompt: "Generate creative ideas for my project" },
    { icon: Zap, label: "Fix Grammar", prompt: "Check and fix grammar in my text" },
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        type: "ai",
        content: generateAIResponse(input),
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiResponse])
      setIsTyping(false)
    }, 1500)
  }

  const generateAIResponse = (prompt) => {
    const responses = [
      "I'd be happy to help you with that! Here are some suggestions to improve your writing...",
      "Based on your request, I can help you restructure and enhance your content. Let me provide some specific recommendations...",
      "Great question! Here's how I would approach this writing challenge...",
      "I can definitely assist with that. Let me break this down into actionable steps for you...",
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const handleQuickAction = (prompt) => {
    setInput(prompt)
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Header */}
      <div className="border-b border-slate-800 p-6">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-xl flex items-center justify-center">
            <Bot size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              AI Writing Assistant
            </h1>
            <p className="text-slate-400">Powered by advanced language models</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-slate-400">Online</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="border-b border-slate-800 p-6">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-sm font-medium text-slate-300 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickActions.map((action, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleQuickAction(action.prompt)}
                className="flex items-center gap-3 p-3 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 hover:border-cyan-500/50 rounded-xl transition-all duration-300 text-left"
              >
                <action.icon size={18} className="text-cyan-400" />
                <span className="text-sm font-medium">{action.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex gap-4 ${message.type === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.type === "ai" && (
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Bot size={16} />
                  </div>
                )}
                <div className={`max-w-2xl ${message.type === "user" ? "order-first" : ""}`}>
                  <div
                    className={`p-4 rounded-xl ${
                      message.type === "user"
                        ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white"
                        : "bg-slate-800/50 border border-slate-700"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                    <span>{message.timestamp.toLocaleTimeString()}</span>
                    {message.type === "ai" && (
                      <div className="flex items-center gap-1 ml-auto">
                        <button
                          onClick={() => copyToClipboard(message.content)}
                          className="p-1 hover:bg-slate-700 rounded transition-colors duration-200"
                        >
                          <Copy size={12} />
                        </button>
                        <button className="p-1 hover:bg-slate-700 rounded transition-colors duration-200">
                          <ThumbsUp size={12} />
                        </button>
                        <button className="p-1 hover:bg-slate-700 rounded transition-colors duration-200">
                          <ThumbsDown size={12} />
                        </button>
                        <button className="p-1 hover:bg-slate-700 rounded transition-colors duration-200">
                          <RotateCcw size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {message.type === "user" && (
                  <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium">You</span>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex gap-4"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <Bot size={16} />
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-slate-800 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask me anything about writing, editing, or improving your documents..."
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 pr-12 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300"
              />
              <Wand2 className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 hover:shadow-lg hover:shadow-cyan-500/25 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send size={18} />
              Send
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIAssistant
