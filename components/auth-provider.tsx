"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth"
import { auth, googleProvider } from "@/lib/firebase"
import { createUserProfile, getUserProfile, type UserProfile } from "@/lib/firebase-utils"

interface User {
  id: string
  email: string
  displayName: string
  photoURL?: string
  profile?: UserProfile
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, displayName: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Get or create user profile
        let profile = await getUserProfile(firebaseUser.uid)

        if (!profile) {
          // Create new user profile
          await createUserProfile(firebaseUser.uid, {
            displayName: firebaseUser.displayName || "Anonymous Soul",
            email: firebaseUser.email || "",
            photoURL: firebaseUser.photoURL || undefined,
          })
          profile = await getUserProfile(firebaseUser.uid)
        }

        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email || "",
          displayName: firebaseUser.displayName || "Anonymous Soul",
          photoURL: firebaseUser.photoURL || undefined,
          profile: profile || undefined,
        })
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error: any) {
      console.error("Sign in error:", error)
      throw new Error(error.message || "Failed to sign in")
    }
  }

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password)

      // Update the user's display name
      await updateProfile(firebaseUser, { displayName })

      // Create user profile in Firestore
      await createUserProfile(firebaseUser.uid, {
        displayName,
        email,
        photoURL: undefined,
      })
    } catch (error: any) {
      console.error("Sign up error:", error)
      throw new Error(error.message || "Failed to create account")
    }
  }

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const firebaseUser = result.user

      // Check if user profile exists, create if not
      const existingProfile = await getUserProfile(firebaseUser.uid)
      if (!existingProfile) {
        await createUserProfile(firebaseUser.uid, {
          displayName: firebaseUser.displayName || "Anonymous Soul",
          email: firebaseUser.email || "",
          photoURL: firebaseUser.photoURL || undefined,
        })
      }
    } catch (error: any) {
      console.error("Google sign in error:", error)
      throw new Error(error.message || "Failed to sign in with Google")
    }
  }

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
    } catch (error: any) {
      console.error("Sign out error:", error)
      throw new Error(error.message || "Failed to sign out")
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
