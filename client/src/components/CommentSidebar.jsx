"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { X, MessageCircle, Send, Reply, MoreHorizontal, Heart } from "lucide-react"
import { useAuth } from "../context/AuthContext"

const CommentSidebar = ({ isOpen, onClose, document }) => {
  const { user } = useAuth()
  const [newComment, setNewComment] = useState("")
  const [replyTo, setReplyTo] = useState(null)
  const [comments, setComments] = useState([
    {
      id: "1",
      author: {
        name: "Alex Chen",
        avatar:
          "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2",
        color: "#8B5CF6",
      },
      content: "Great progress on the roadmap! I think we should add more details about the Q2 milestones.",
      timestamp: "2 hours ago",
      likes: 3,
      isLiked: false,
      replies: [
        {
          id: "1-1",
          author: {
            name: "Sarah Kim",
            avatar:
              "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2",
            color: "#14B8A6",
          },
          content: "Agreed! I can help with the technical specifications.",
          timestamp: "1 hour ago",
          likes: 1,
          isLiked: true,
        },
      ],
    },
    {
      id: "2",
      author: {
        name: "Mike Johnson",
        avatar:
          "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2",
        color: "#F97316",
      },
      content: "The design section looks comprehensive. Should we include user research findings?",
      timestamp: "3 hours ago",
      likes: 2,
      isLiked: false,
      replies: [],
    },
  ])

  const handleSubmitComment = (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    const comment = {
      id: Date.now().toString(),
      author: {
        name: user?.name || "You",
        avatar: user?.avatar || "/placeholder.svg",
        color: user?.color || "#8B5CF6",
      },
      content: newComment,
      timestamp: "Just now",
      likes: 0,
      isLiked: false,
      replies: [],
    }

    if (replyTo) {
      setComments((prev) =>
        prev.map((c) =>
          c.id === replyTo
            ? {
                ...c,
                replies: [...c.replies, { ...comment, id: `${replyTo}-${Date.now()}` }],
              }
            : c,
        ),
      )
      setReplyTo(null)
    } else {
      setComments((prev) => [comment, ...prev])
    }

    setNewComment("")
  }

  const handleLike = (commentId, isReply = false, parentId = null) => {
    setComments((prev) =>
      prev.map((comment) => {
        if (isReply && comment.id === parentId) {
          return {
            ...comment,
            replies: comment.replies.map((reply) =>
              reply.id === commentId
                ? {
                    ...reply,
                    isLiked: !reply.isLiked,
                    likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1,
                  }
                : reply,
            ),
          }
        } else if (!isReply && comment.id === commentId) {
          return {
            ...comment,
            isLiked: !comment.isLiked,
            likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
          }
        }
        return comment
      }),
    )
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed right-0 top-20 bottom-0 w-80 bg-glass-white backdrop-blur-md border-l border-white/20 z-30"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-6 h-6 text-neon-purple" />
                  <h2 className="text-xl font-bold text-white">Comments</h2>
                </div>
                <motion.button
                  className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                  onClick={onClose}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* New Comment Form */}
              <form onSubmit={handleSubmitComment} className="space-y-3">
                {replyTo && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Reply className="w-4 h-4" />
                    <span>Replying to comment</span>
                    <button
                      type="button"
                      onClick={() => setReplyTo(null)}
                      className="text-neon-purple hover:text-neon-teal transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
                <div className="relative">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={replyTo ? "Write a reply..." : "Add a comment..."}
                    className="w-full p-3 bg-glass-white backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-neon-purple focus:shadow-lg focus:shadow-neon-purple/25 transition-all duration-300 resize-none"
                    rows={3}
                  />
                  <motion.button
                    type="submit"
                    className="absolute bottom-3 right-3 p-2 bg-gradient-to-r from-neon-purple to-neon-teal rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!newComment.trim()}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Send className="w-4 h-4" />
                  </motion.button>
                </div>
              </form>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-auto p-6 space-y-6">
              {comments.map((comment) => (
                <motion.div
                  key={comment.id}
                  className="space-y-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Main Comment */}
                  <div className="group">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                        <img
                          src={comment.author.avatar || "/placeholder.svg"}
                          alt={comment.author.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-white text-sm">{comment.author.name}</span>
                          <span className="text-xs text-gray-400">{comment.timestamp}</span>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed mb-3">{comment.content}</p>
                        <div className="flex items-center gap-4">
                          <motion.button
                            className={`flex items-center gap-1 text-xs transition-colors ${
                              comment.isLiked ? "text-red-400" : "text-gray-400 hover:text-red-400"
                            }`}
                            onClick={() => handleLike(comment.id)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Heart className={`w-4 h-4 ${comment.isLiked ? "fill-current" : ""}`} />
                            <span>{comment.likes}</span>
                          </motion.button>
                          <motion.button
                            className="text-xs text-gray-400 hover:text-white transition-colors"
                            onClick={() => setReplyTo(comment.id)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Reply
                          </motion.button>
                          <motion.button
                            className="text-xs text-gray-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </div>
                    </div>

                    {/* Replies */}
                    {comment.replies.length > 0 && (
                      <div className="ml-11 mt-4 space-y-4">
                        {comment.replies.map((reply) => (
                          <motion.div
                            key={reply.id}
                            className="group"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                                <img
                                  src={reply.author.avatar || "/placeholder.svg"}
                                  alt={reply.author.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-white text-xs">{reply.author.name}</span>
                                  <span className="text-xs text-gray-400">{reply.timestamp}</span>
                                </div>
                                <p className="text-gray-300 text-xs leading-relaxed mb-2">{reply.content}</p>
                                <div className="flex items-center gap-3">
                                  <motion.button
                                    className={`flex items-center gap-1 text-xs transition-colors ${
                                      reply.isLiked ? "text-red-400" : "text-gray-400 hover:text-red-400"
                                    }`}
                                    onClick={() => handleLike(reply.id, true, comment.id)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    <Heart className={`w-3 h-3 ${reply.isLiked ? "fill-current" : ""}`} />
                                    <span>{reply.likes}</span>
                                  </motion.button>
                                  <motion.button
                                    className="text-xs text-gray-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    <MoreHorizontal className="w-3 h-3" />
                                  </motion.button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {comments.length === 0 && (
                <motion.div
                  className="text-center py-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No comments yet</h3>
                  <p className="text-gray-400 text-sm">Be the first to share your thoughts!</p>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default CommentSidebar
