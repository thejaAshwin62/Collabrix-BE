"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Bot,
  Send,
  Sparkles,
  FileText,
  Edit3,
  Lightbulb,
  Brain,
  MessageSquare,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Settings,
  History,
  Bookmark,
} from "lucide-react"
import Layout from "../components/Layout"
import AnimatedButton from "../components/AnimatedButton"

const AI = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "ai",
      content:
        "Hello! I'm your AI writing assistant. I can help you with document creation, editing, summarization, and more. What would you like to work on today?",
      timestamp: new Date(),
      suggestions: ["Write a blog post", "Summarize document", "Improve writing", "Generate ideas"],
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [activeFeature, setActiveFeature] = useState("chat")
  const messagesEndRef = useRef(null)

  const features = [
    { id: "chat", name: "Chat", icon: MessageSquare, color: "from-purple-500 to-pink-500" },
    { id: "write", name: "Write", icon: Edit3, color: "from-teal-500 to-cyan-500" },
    { id: "summarize", name: "Summarize", icon: FileText, color: "from-orange-500 to-red-500" },
    { id: "ideas", name: "Ideas", icon: Lightbulb, color: "from-yellow-500 to-orange-500" },
  ]

  const quickActions = [
    { text: "Write a professional email", icon: "📧" },
    { text: "Create a meeting agenda", icon: "📋" },
    { text: "Summarize this document", icon: "📄" },
    { text: "Generate blog post ideas", icon: "💡" },
    { text: "Improve this paragraph", icon: "✨" },
    { text: "Create a project outline", icon: "🗂️" },
  ]

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        type: "ai",
        content: generateAIResponse(inputValue),
        timestamp: new Date(),
        actions: ["Copy", "Regenerate", "Save"],
      }
      setMessages((prev) => [...prev, aiResponse])
      setIsTyping(false)
    }, 2000)
  }

  const generateAIResponse = (input) => {
    const responses = [
      "I'd be happy to help you with that! Here's a comprehensive approach to your request...",
      "Great question! Let me break this down for you with some actionable insights...",
      "I can definitely assist with that. Here's what I recommend based on best practices...",
      "Excellent! I'll help you create something amazing. Here's my suggestion...",
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const handleQuickAction = (action) => {
    setInputValue(action)
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex">
        {/* Sidebar */}
        <div className="w-80 bg-white/5 backdrop-blur-sm border-r border-white/10 p-6">
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">AI Assistant</h2>
                <p className="text-gray-400 text-sm">Powered by advanced AI</p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="mb-8">
            <h3 className="text-white font-semibold mb-4">Features</h3>
            <div className="space-y-2">
              {features.map((feature) => {
                const Icon = feature.icon
                return (
                  <button
                    key={feature.id}
                    onClick={() => setActiveFeature(feature.id)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-300 ${
                      activeFeature === feature.id
                        ? `bg-gradient-to-r ${feature.color} text-white shadow-lg`
                        : "text-gray-300 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{feature.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h3 className="text-white font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {quickActions.map((action, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleQuickAction(action.text)}
                  className="w-full flex items-center space-x-3 p-3 text-left text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300"
                >
                  <span className="text-lg">{action.icon}</span>
                  <span className="text-sm">{action.text}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="mt-auto">
            <button className="w-full flex items-center space-x-3 p-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300">
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </button>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">AI Assistant</h1>
                <p className="text-gray-400">Get help with writing, editing, and creative tasks</p>
              </div>
              <div className="flex items-center space-x-3">
                <button className="p-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-gray-300 hover:text-white hover:bg-white/20 transition-all duration-300">
                  <History className="w-5 h-5" />
                </button>
                <button className="p-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-gray-300 hover:text-white hover:bg-white/20 transition-all duration-300">
                  <Bookmark className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-3xl ${message.type === "user" ? "order-2" : "order-1"}`}>
                    <div
                      className={`flex items-start space-x-3 ${message.type === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          message.type === "user"
                            ? "bg-gradient-to-r from-teal-500 to-cyan-500"
                            : "bg-gradient-to-r from-purple-500 to-pink-500"
                        }`}
                      >
                        {message.type === "user" ? (
                          <span className="text-white font-semibold">U</span>
                        ) : (
                          <Bot className="w-6 h-6 text-white" />
                        )}
                      </div>

                      <div className={`flex-1 ${message.type === "user" ? "text-right" : ""}`}>
                        <div
                          className={`inline-block p-4 rounded-2xl ${
                            message.type === "user"
                              ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white"
                              : "bg-white/10 backdrop-blur-sm border border-white/20 text-white"
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        </div>

                        {message.suggestions && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {message.suggestions.map((suggestion, index) => (
                              <button
                                key={index}
                                onClick={() => handleQuickAction(suggestion)}
                                className="px-3 py-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm text-gray-300 hover:text-white hover:bg-white/20 transition-all duration-300"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        )}

                        {message.actions && (
                          <div className="mt-3 flex items-center space-x-2">
                            {message.actions.map((action, index) => (
                              <button
                                key={index}
                                className="p-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-gray-300 hover:text-white hover:bg-white/20 transition-all duration-300"
                              >
                                {action === "Copy" && <Copy className="w-4 h-4" />}
                                {action === "Regenerate" && <RefreshCw className="w-4 h-4" />}
                                {action === "Save" && <Bookmark className="w-4 h-4" />}
                              </button>
                            ))}
                            <button className="p-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-gray-300 hover:text-green-400 hover:bg-green-500/20 transition-all duration-300">
                              <ThumbsUp className="w-4 h-4" />
                            </button>
                            <button className="p-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-500/20 transition-all duration-300">
                              <ThumbsDown className="w-4 h-4" />
                            </button>
                          </div>
                        )}

                        <p className="text-xs text-gray-500 mt-2">{message.timestamp.toLocaleTimeString()}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-6 border-t border-white/10">
            <div className="flex items-end space-x-4">
              <div className="flex-1 relative">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  placeholder="Ask me anything about writing, editing, or creative tasks..."
                  className="w-full p-4 pr-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none min-h-[60px] max-h-32"
                  rows={1}
                />
                <div className="absolute right-3 bottom-3 flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-white transition-colors">
                    <Sparkles className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <AnimatedButton
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </AnimatedButton>
            </div>

            <div className="flex items-center justify-center mt-4 text-xs text-gray-500">
              <Brain className="w-4 h-4 mr-2" />
              AI can make mistakes. Consider checking important information.
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default AI
