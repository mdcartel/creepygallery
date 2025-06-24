import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  orderBy,
  limit,
  where,
  serverTimestamp,
  increment,
  onSnapshot,
} from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { db, storage } from "./firebase"

// Types
export interface Post {
  id: string
  title: string
  caption: string
  imageUrl: string
  thumbnailUrl?: string
  tags: string[]
  authorId: string
  authorName: string
  authorAvatar?: string
  createdAt: any
  chillFactor: number
  totalRatings: number
  commentCount: number
  downloadCount: number
}

export interface Comment {
  id: string
  postId: string
  authorId: string
  authorName: string
  authorAvatar?: string
  message: string
  createdAt: any
}

export interface Rating {
  id: string
  postId: string
  userId: string
  rating: number
  createdAt: any
}

export interface UserProfile {
  id: string
  displayName: string
  email: string
  photoURL?: string
  bio?: string
  joinedAt: any
  totalUploads: number
  totalRatings: number
  averageRating: number
}

// Posts
export const createPost = async (
  postData: Omit<Post, "id" | "createdAt" | "chillFactor" | "totalRatings" | "commentCount" | "downloadCount">,
) => {
  try {
    const docRef = await addDoc(collection(db, "posts"), {
      ...postData,
      createdAt: serverTimestamp(),
      chillFactor: 0,
      totalRatings: 0,
      commentCount: 0,
      downloadCount: 0,
    })
    return docRef.id
  } catch (error) {
    console.error("Error creating post:", error)
    throw error
  }
}

export const getPosts = async (limitCount = 20) => {
  try {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(limitCount))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Post[]
  } catch (error) {
    console.error("Error getting posts:", error)
    throw error
  }
}

export const getPost = async (postId: string) => {
  try {
    const docRef = doc(db, "posts", postId)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Post
    }
    return null
  } catch (error) {
    console.error("Error getting post:", error)
    throw error
  }
}

export const updatePost = async (postId: string, updates: Partial<Post>) => {
  try {
    const docRef = doc(db, "posts", postId)
    await updateDoc(docRef, updates)
  } catch (error) {
    console.error("Error updating post:", error)
    throw error
  }
}

export const deletePost = async (postId: string) => {
  try {
    await deleteDoc(doc(db, "posts", postId))
  } catch (error) {
    console.error("Error deleting post:", error)
    throw error
  }
}

// Comments
export const addComment = async (commentData: Omit<Comment, "id" | "createdAt">) => {
  try {
    const docRef = await addDoc(collection(db, "comments"), {
      ...commentData,
      createdAt: serverTimestamp(),
    })

    // Update comment count on post
    const postRef = doc(db, "posts", commentData.postId)
    await updateDoc(postRef, {
      commentCount: increment(1),
    })

    return docRef.id
  } catch (error) {
    console.error("Error adding comment:", error)
    throw error
  }
}

export const getComments = async (postId: string) => {
  try {
    const q = query(collection(db, "comments"), where("postId", "==", postId), orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Comment[]
  } catch (error) {
    console.error("Error getting comments:", error)
    throw error
  }
}

export const subscribeToComments = (postId: string, callback: (comments: Comment[]) => void) => {
  const q = query(collection(db, "comments"), where("postId", "==", postId), orderBy("createdAt", "desc"))

  return onSnapshot(q, (querySnapshot) => {
    const comments = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Comment[]
    callback(comments)
  })
}

// Ratings
export const addOrUpdateRating = async (ratingData: Omit<Rating, "id" | "createdAt">) => {
  try {
    // Check if user already rated this post
    const q = query(
      collection(db, "ratings"),
      where("postId", "==", ratingData.postId),
      where("userId", "==", ratingData.userId),
    )
    const existingRatings = await getDocs(q)

    if (!existingRatings.empty) {
      // Update existing rating
      const existingRating = existingRatings.docs[0]
      const oldRating = existingRating.data().rating
      await updateDoc(existingRating.ref, {
        rating: ratingData.rating,
        createdAt: serverTimestamp(),
      })

      // Update post's chill factor
      await updatePostChillFactor(ratingData.postId, ratingData.rating - oldRating, 0)
    } else {
      // Add new rating
      await addDoc(collection(db, "ratings"), {
        ...ratingData,
        createdAt: serverTimestamp(),
      })

      // Update post's chill factor
      await updatePostChillFactor(ratingData.postId, ratingData.rating, 1)
    }
  } catch (error) {
    console.error("Error adding/updating rating:", error)
    throw error
  }
}

const updatePostChillFactor = async (postId: string, ratingChange: number, countChange: number) => {
  try {
    const postRef = doc(db, "posts", postId)
    const postSnap = await getDoc(postRef)

    if (postSnap.exists()) {
      const postData = postSnap.data()
      const currentTotal = (postData.chillFactor || 0) * (postData.totalRatings || 0)
      const newTotal = currentTotal + ratingChange
      const newCount = (postData.totalRatings || 0) + countChange
      const newAverage = newCount > 0 ? newTotal / newCount : 0

      await updateDoc(postRef, {
        chillFactor: newAverage,
        totalRatings: newCount,
      })
    }
  } catch (error) {
    console.error("Error updating chill factor:", error)
    throw error
  }
}

export const getUserRating = async (postId: string, userId: string) => {
  try {
    const q = query(collection(db, "ratings"), where("postId", "==", postId), where("userId", "==", userId))
    const querySnapshot = await getDocs(q)
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data().rating as number
    }
    return null
  } catch (error) {
    console.error("Error getting user rating:", error)
    return null
  }
}

// Storage
export const uploadImage = async (file: File, path: string) => {
  try {
    const storageRef = ref(storage, path)
    const snapshot = await uploadBytes(storageRef, file)
    const downloadURL = await getDownloadURL(snapshot.ref)
    return downloadURL
  } catch (error) {
    console.error("Error uploading image:", error)
    throw error
  }
}

export const deleteImage = async (path: string) => {
  try {
    const storageRef = ref(storage, path)
    await deleteObject(storageRef)
  } catch (error) {
    console.error("Error deleting image:", error)
    throw error
  }
}

// User Profiles
export const createUserProfile = async (
  userId: string,
  profileData: Omit<UserProfile, "id" | "joinedAt" | "totalUploads" | "totalRatings" | "averageRating">,
) => {
  try {
    await updateDoc(doc(db, "users", userId), {
      ...profileData,
      joinedAt: serverTimestamp(),
      totalUploads: 0,
      totalRatings: 0,
      averageRating: 0,
    })
  } catch (error) {
    console.error("Error creating user profile:", error)
    throw error
  }
}

export const getUserProfile = async (userId: string) => {
  try {
    const docRef = doc(db, "users", userId)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as UserProfile
    }
    return null
  } catch (error) {
    console.error("Error getting user profile:", error)
    return null
  }
}

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
  try {
    const docRef = doc(db, "users", userId)
    await updateDoc(docRef, updates)
  } catch (error) {
    console.error("Error updating user profile:", error)
    throw error
  }
}

// Utility functions
export const incrementDownloadCount = async (postId: string) => {
  try {
    const postRef = doc(db, "posts", postId)
    await updateDoc(postRef, {
      downloadCount: increment(1),
    })
  } catch (error) {
    console.error("Error incrementing download count:", error)
  }
}

export const formatTimestamp = (timestamp: any) => {
  if (!timestamp) return "Unknown"

  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return "just now"
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`

  return date.toLocaleDateString()
}
