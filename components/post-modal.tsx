"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skull, Download, MessageCircle, X, Send } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import {
  addComment,
  subscribeToComments,
  addOrUpdateRating,
  getUserRating,
  incrementDownloadCount,
  formatTimestamp,
  type Post,
  type Comment,
} from "@/lib/firebase-utils"

interface PostModalProps {
  post: Post
  onClose: () => void
}

export default function PostModal({ post, onClose }: PostModalProps) {
  const { user } = useAuth()
  const [userRating, setUserRating] = useState<number>(0)
  const [newComment, setNewComment] = useState("")
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)
  const [submittingComment, setSubmittingComment] = useState(false)

  useEffect(() => {
    // Subscribe to comments
    const unsubscribe = subscribeToComments(post.id, (fetchedComments) => {
      setComments(fetchedComments)
    })

    // Get user's existing rating
    if (user) {
      getUserRating(post.id, user.id).then((rating) => {
        if (rating) setUserRating(rating)
      })
    }

    return () => unsubscribe()
  }, [post.id, user])

  const handleRating = async (rating: number) => {
    if (!user) return

    try {
      setLoading(true)
      await addOrUpdateRating({
        postId: post.id,
        userId: user.id,
        rating,
      })
      setUserRating(rating)
    } catch (error) {
      console.error("Error rating post:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    try {
      // Increment download count
      await incrementDownloadCount(post.id)

      // Create download link
      const link = document.createElement("a")
      link.href = post.imageUrl
      link.download = `creepygallery_${post.title.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.jpg`
      link.target = "_blank"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Error downloading image:", error)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim() || !user) return

    try {
      setSubmittingComment(true)
      await addComment({
        postId: post.id,
        authorId: user.id,
        authorName: user.displayName,
        authorAvatar: user.photoURL,
        message: newComment.trim(),
      })
      setNewComment("")
    } catch (error) {
      console.error("Error adding comment:", error)
    } finally {
      setSubmittingComment(false)
    }
  }

  const renderSkullRating = (interactive = false) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((skull) => (
          <button
            key={skull}
            onClick={() => interactive && user && handleRating(skull)}
            className={`${interactive && user ? "hover:scale-110 transition-transform cursor-pointer" : ""} ${loading ? "opacity-50" : ""}`}
            disabled={!interactive || !user || loading}
          >
            <Skull
              className={`w-5 h-5 ${
                skull <= (userRating || 0) ? "text-red-500 fill-red-500" : "text-gray-600"
              } ${interactive && skull <= userRating ? "animate-pulse" : ""}`}
            />
          </button>
        ))}
        <span className="text-sm text-gray-400 ml-2">
          {userRating > 0
            ? `Your rating: ${userRating}`
            : `${(post.chillFactor || 0).toFixed(1)} (${post.totalRatings || 0} souls)`}
        </span>
      </div>
    )
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-gray-900 border-gray-700 text-white p-0 overflow-hidden">
        <div className="flex flex-col lg:flex-row h-full">
          {/* Image Section */}
          <div className="lg:w-2/3 relative">
            <img
              src={post.imageUrl || "/placeholder.svg"}
              alt={post.title}
              className="w-full h-64 lg:h-full object-cover"
            />
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Content Section */}
          <div className="lg:w-1/3 flex flex-col">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold mb-1">{post.title}</h2>
                  <p className="text-sm text-gray-400">
                    by {post.authorName} • {formatTimestamp(post.createdAt)}
                  </p>
                </div>
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  size="sm"
                  className="border-gray-600 hover:bg-gray-800"
                  title="Take it... if you dare"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>

              <p className="text-gray-300 mb-4">{post.caption}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="bg-gray-800 text-gray-300">
                    #{tag}
                  </Badge>
                ))}
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-400 mb-2">{user ? "Rate the Chill Factor:" : "Sign in to rate:"}</p>
                  {renderSkullRating(true)}
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <div className="flex-1 flex flex-col">
              <div className="p-4 border-b border-gray-700">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  {comments.length} whispers in the dark...
                </h3>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-64 lg:max-h-none">
                {comments.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No whispers yet... be the first to comment</p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarImage src={comment.authorAvatar || "/placeholder.svg"} />
                        <AvatarFallback className="bg-gray-700 text-white text-xs">
                          {comment.authorName[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{comment.authorName}</span>
                          <span className="text-xs text-gray-500">{formatTimestamp(comment.createdAt)}</span>
                        </div>
                        <p className="text-sm text-gray-300">{comment.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {user && (
                <div className="p-4 border-t border-gray-700">
                  <div className="flex gap-2">
                    <Textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Share your thoughts on this haunting image..."
                      className="bg-gray-800 border-gray-600 text-white resize-none"
                      rows={2}
                    />
                    <Button
                      onClick={handleAddComment}
                      disabled={!newComment.trim() || submittingComment}
                      className="bg-red-900 hover:bg-red-800 self-end"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {!user && (
                <div className="p-4 border-t border-gray-700 text-center text-gray-500">
                  <p className="text-sm">Sign in to leave a whisper in the dark...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
