"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Upload, X, Plus, ImageIcon, AlertCircle } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { uploadImage, createPost } from "@/lib/firebase-utils"

interface UploadModalProps {
  open: boolean
  onClose: () => void
}

export default function UploadModal({ open, onClose }: UploadModalProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    title: "",
    caption: "",
    tags: [] as string[],
    currentTag: "",
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string>("")

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB")
        return
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file")
        return
      }

      setError("")
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleAddTag = () => {
    const tag = formData.currentTag.trim().toLowerCase()
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 10) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
        currentTag: "",
      }))
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const handleSubmit = async () => {
    if (!selectedFile || !formData.title.trim() || !user) return

    setUploading(true)
    setUploadProgress(0)
    setError("")

    try {
      // Create unique filename
      const timestamp = Date.now()
      const filename = `${timestamp}_${selectedFile.name.replace(/[^a-zA-Z0-9.]/g, "_")}`
      const imagePath = `posts/${user.id}/${filename}`

      setUploadProgress(25)

      // Upload image to Firebase Storage
      const imageUrl = await uploadImage(selectedFile, imagePath)

      setUploadProgress(75)

      // Create post in Firestore
      await createPost({
        title: formData.title.trim(),
        caption: formData.caption.trim(),
        imageUrl,
        tags: formData.tags,
        authorId: user.id,
        authorName: user.displayName,
        authorAvatar: user.photoURL,
      })

      setUploadProgress(100)

      // Reset form
      setFormData({ title: "", caption: "", tags: [], currentTag: "" })
      setSelectedFile(null)
      setPreviewUrl("")

      // Close modal after short delay
      setTimeout(() => {
        onClose()
        setUploadProgress(0)
      }, 1000)
    } catch (error: any) {
      console.error("Upload error:", error)
      setError(error.message || "Failed to upload image. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddTag()
    }
  }

  const handleClose = () => {
    if (!uploading) {
      // Clean up preview URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
      setFormData({ title: "", caption: "", tags: [], currentTag: "" })
      setSelectedFile(null)
      setPreviewUrl("")
      setError("")
      setUploadProgress(0)
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl bg-gray-900 border-gray-700 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Share Your Darkness</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Summoning your darkness...</span>
                <span className="text-gray-400">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          {/* File Upload */}
          <div className="space-y-4">
            <Label>Choose Your Cursed Image</Label>
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-gray-500 transition-colors">
              {previewUrl ? (
                <div className="relative">
                  <img src={previewUrl || "/placeholder.svg"} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
                  {!uploading && (
                    <Button
                      onClick={() => {
                        if (previewUrl) URL.revokeObjectURL(previewUrl)
                        setSelectedFile(null)
                        setPreviewUrl("")
                      }}
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ) : (
                <div>
                  <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-400 mb-4">Drag and drop your haunting image here</p>
                  <p className="text-xs text-gray-500 mb-4">Max file size: 10MB • Supported: JPG, PNG, GIF, WebP</p>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                    disabled={uploading}
                  />
                  <Label htmlFor="file-upload" className="cursor-pointer">
                    <Button
                      variant="outline"
                      className="border-gray-600 hover:bg-gray-800"
                      asChild
                      disabled={uploading}
                    >
                      <span>
                        <Upload className="w-4 h-4 mr-2" />
                        Select Image
                      </span>
                    </Button>
                  </Label>
                </div>
              )}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Give your darkness a name..."
              className="bg-gray-800 border-gray-600"
              disabled={uploading}
              maxLength={100}
            />
            <p className="text-xs text-gray-500">{formData.title.length}/100 characters</p>
          </div>

          {/* Caption */}
          <div className="space-y-2">
            <Label htmlFor="caption">Caption</Label>
            <Textarea
              id="caption"
              value={formData.caption}
              onChange={(e) => setFormData((prev) => ({ ...prev, caption: e.target.value }))}
              placeholder="Tell the story behind this haunting image..."
              className="bg-gray-800 border-gray-600 resize-none"
              rows={3}
              disabled={uploading}
              maxLength={500}
            />
            <p className="text-xs text-gray-500">{formData.caption.length}/500 characters</p>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags (max 10)</Label>
            <div className="flex gap-2">
              <Input
                value={formData.currentTag}
                onChange={(e) => setFormData((prev) => ({ ...prev, currentTag: e.target.value }))}
                onKeyPress={handleKeyPress}
                placeholder="Add a tag..."
                className="bg-gray-800 border-gray-600"
                disabled={uploading || formData.tags.length >= 10}
                maxLength={20}
              />
              <Button
                onClick={handleAddTag}
                variant="outline"
                className="border-gray-600 hover:bg-gray-800"
                disabled={uploading || !formData.currentTag.trim() || formData.tags.length >= 10}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="bg-gray-800 text-gray-300 pr-1">
                    #{tag}
                    {!uploading && (
                      <Button
                        onClick={() => handleRemoveTag(tag)}
                        variant="ghost"
                        size="sm"
                        className="h-auto p-1 ml-1 hover:bg-gray-700"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    )}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-4 pt-4">
            <Button
              onClick={handleClose}
              variant="outline"
              className="flex-1 border-gray-600 hover:bg-gray-800"
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedFile || !formData.title.trim() || uploading}
              className="flex-1 bg-red-900 hover:bg-red-800"
            >
              {uploading ? "Summoning..." : "Share with the Coven"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
