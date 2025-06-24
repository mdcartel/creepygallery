"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skull, MessageCircle, Eye } from "lucide-react"
import PostModal from "@/components/post-modal"
import { getPosts, formatTimestamp, type Post } from "@/lib/firebase-utils"

export default function Gallery() {
  const [posts, setPosts] = useState<Post[]>([])
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true)
        const fetchedPosts = await getPosts(20)
        setPosts(fetchedPosts)
      } catch (err) {
        console.error("Error loading posts:", err)
        setError("Failed to load posts")
      } finally {
        setLoading(false)
      }
    }

    loadPosts()
  }, [])

  const renderSkullRating = (rating: number) => {
    const fullSkulls = Math.floor(rating)
    const hasHalfSkull = rating % 1 >= 0.5

    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Skull
            key={i}
            className={`w-4 h-4 ${
              i < fullSkulls
                ? "text-red-500 fill-red-500"
                : i === fullSkulls && hasHalfSkull
                  ? "text-red-500 fill-red-500/50"
                  : "text-gray-600"
            }`}
          />
        ))}
        <span className="text-sm text-gray-400 ml-1">{rating > 0 ? rating.toFixed(1) : "0.0"}</span>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="bg-gray-900/50 border-gray-700 animate-pulse">
              <div className="aspect-[3/4] bg-gray-800 rounded-t-lg" />
              <CardContent className="p-4">
                <div className="h-4 bg-gray-800 rounded mb-2" />
                <div className="h-3 bg-gray-800 rounded mb-4 w-3/4" />
                <div className="flex gap-2 mb-3">
                  <div className="h-6 bg-gray-800 rounded w-16" />
                  <div className="h-6 bg-gray-800 rounded w-20" />
                </div>
                <div className="h-4 bg-gray-800 rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-400">
          <p className="text-xl mb-4">Failed to load the gallery</p>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-400">
          <Skull className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <p className="text-xl mb-4">The gallery awaits your darkness...</p>
          <p>Be the first brave soul to share a haunting image.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Gallery of the Damned</h2>
        <p className="text-gray-400">
          Explore the darkness that others have captured... ({posts.length} haunting images)
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {posts.map((post) => (
          <Card
            key={post.id}
            className="bg-gray-900/50 border-gray-700 hover:bg-gray-800/50 transition-all duration-300 cursor-pointer group"
            onClick={() => setSelectedPost(post)}
          >
            <div className="aspect-[3/4] overflow-hidden rounded-t-lg relative">
              <img
                src={post.thumbnailUrl || post.imageUrl || "/placeholder.svg"}
                alt={post.title}
                className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-300"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Eye className="w-5 h-5 text-white" />
              </div>
            </div>

            <CardContent className="p-4">
              <h3 className="font-semibold text-white mb-1 line-clamp-1">{post.title}</h3>
              <p className="text-sm text-gray-400 mb-3 line-clamp-2">{post.caption}</p>

              <div className="flex flex-wrap gap-1 mb-3">
                {post.tags.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs bg-gray-800 text-gray-300">
                    {tag}
                  </Badge>
                ))}
                {post.tags.length > 2 && (
                  <Badge variant="secondary" className="text-xs bg-gray-800 text-gray-300">
                    +{post.tags.length - 2}
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  {renderSkullRating(post.chillFactor || 0)}
                  <div className="flex items-center gap-1 text-gray-400">
                    <MessageCircle className="w-4 h-4" />
                    <span>{post.commentCount || 0}</span>
                  </div>
                </div>
                <span className="text-gray-500 text-xs">{formatTimestamp(post.createdAt)}</span>
              </div>

              <div className="mt-2 text-xs text-gray-500">by {post.authorName}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedPost && <PostModal post={selectedPost} onClose={() => setSelectedPost(null)} />}
    </div>
  )
}
