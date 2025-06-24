"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/components/auth-provider"
import { Chrome, Mail, Skull, AlertCircle } from "lucide-react"

interface AuthModalProps {
  open: boolean
  onClose: () => void
}

export default function AuthModal({ open, onClose }: AuthModalProps) {
  const { signIn, signUp, signInWithGoogle } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    displayName: "",
  })

  const handleSubmit = async (type: "signin" | "signup") => {
    setLoading(true)
    setError("")

    try {
      if (type === "signin") {
        await signIn(formData.email, formData.password)
      } else {
        if (!formData.displayName.trim()) {
          setError("Display name is required")
          return
        }
        await signUp(formData.email, formData.password, formData.displayName)
      }
      onClose()
    } catch (error: any) {
      setError(error.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError("")

    try {
      await signInWithGoogle()
      onClose()
    } catch (error: any) {
      setError(error.message || "Failed to sign in with Google")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({ email: "", password: "", displayName: "" })
    setError("")
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          resetForm()
          onClose()
        }
      }}
    >
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold flex items-center justify-center gap-2">
            <Skull className="w-6 h-6 text-red-500" />
            Enter the Realm
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <Tabs defaultValue="signin" className="w-full" onValueChange={resetForm}>
          <TabsList className="grid w-full grid-cols-2 bg-gray-800">
            <TabsTrigger value="signin" className="data-[state=active]:bg-red-900">
              Sign In
            </TabsTrigger>
            <TabsTrigger value="signup" className="data-[state=active]:bg-red-900">
              Join Coven
            </TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  className="bg-gray-800 border-gray-600"
                  placeholder="your.soul@email.com"
                  disabled={loading}
                  required
                />
              </div>
              <div>
                <Label htmlFor="signin-password">Password</Label>
                <Input
                  id="signin-password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                  className="bg-gray-800 border-gray-600"
                  placeholder="Enter the darkness..."
                  disabled={loading}
                  required
                />
              </div>
              <Button
                onClick={() => handleSubmit("signin")}
                disabled={loading || !formData.email || !formData.password}
                className="w-full bg-red-900 hover:bg-red-800"
              >
                <Mail className="w-4 h-4 mr-2" />
                {loading ? "Summoning..." : "Enter Gallery"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="signup-name">Display Name</Label>
                <Input
                  id="signup-name"
                  value={formData.displayName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, displayName: e.target.value }))}
                  className="bg-gray-800 border-gray-600"
                  placeholder="Dark Wanderer"
                  disabled={loading}
                  required
                />
              </div>
              <div>
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  className="bg-gray-800 border-gray-600"
                  placeholder="your.soul@email.com"
                  disabled={loading}
                  required
                />
              </div>
              <div>
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                  className="bg-gray-800 border-gray-600"
                  placeholder="Create your key..."
                  disabled={loading}
                  required
                />
              </div>
              <Button
                onClick={() => handleSubmit("signup")}
                disabled={loading || !formData.email || !formData.password || !formData.displayName}
                className="w-full bg-red-900 hover:bg-red-800"
              >
                <Mail className="w-4 h-4 mr-2" />
                {loading ? "Summoning..." : "Join the Coven"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-600" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-gray-900 px-2 text-gray-400">Or continue with</span>
          </div>
        </div>

        <Button
          onClick={handleGoogleSignIn}
          disabled={loading}
          variant="outline"
          className="w-full border-gray-600 hover:bg-gray-800"
        >
          <Chrome className="w-4 h-4 mr-2" />
          {loading ? "Summoning..." : "Google"}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
