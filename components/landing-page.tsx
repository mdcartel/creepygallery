"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skull, Eye, Upload, User, LogIn } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import AuthModal from "@/components/auth-modal"
import Gallery from "@/components/gallery"
import Navigation from "@/components/navigation"

export default function LandingPage() {
  const { user } = useAuth()
  const [showAuth, setShowAuth] = useState(false)
  const [glitchEffect, setGlitchEffect] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setGlitchEffect(true)
      setTimeout(() => setGlitchEffect(false), 200)
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  if (user) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navigation />
        <Gallery />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Fog Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/20 to-black/60 pointer-events-none" />

      {/* Glitch Overlay */}
      {glitchEffect && <div className="absolute inset-0 bg-red-900/10 animate-pulse pointer-events-none" />}

      <div className="relative z-10 container mx-auto px-4 py-8 md:py-16">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h1 className={`text-4xl md:text-7xl font-bold mb-4 ${glitchEffect ? "animate-pulse text-red-500" : ""}`}>
            🕸️ CreepyGallery
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Enter the nether-realm of cursed photos. Share your darkest captures with fellow souls who dare to witness
            the unseen.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={() => setShowAuth(true)}
              className="bg-red-900 hover:bg-red-800 text-white px-8 py-3 text-lg w-full sm:w-auto"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Enter the Gallery
            </Button>

            <Button
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-3 text-lg w-full sm:w-auto"
              onClick={() => setShowAuth(true)}
            >
              <User className="w-5 h-5 mr-2" />
              Join the Coven
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-16">
          <Card className="bg-gray-900/50 border-gray-700 hover:bg-gray-800/50 transition-colors">
            <CardContent className="p-6 text-center">
              <Upload className="w-12 h-12 mx-auto mb-4 text-red-500" />
              <h3 className="text-xl font-semibold mb-2">Share Your Darkness</h3>
              <p className="text-gray-400">
                Upload your most chilling captures with haunting captions and mysterious tags.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700 hover:bg-gray-800/50 transition-colors">
            <CardContent className="p-6 text-center">
              <Skull className="w-12 h-12 mx-auto mb-4 text-red-500" />
              <h3 className="text-xl font-semibold mb-2">Chill Factor Rating</h3>
              <p className="text-gray-400">
                Rate the creepiness with our unique skull system. How many souls dare to witness?
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700 hover:bg-gray-800/50 transition-colors md:col-span-2 lg:col-span-1">
            <CardContent className="p-6 text-center">
              <Eye className="w-12 h-12 mx-auto mb-4 text-red-500" />
              <h3 className="text-xl font-semibold mb-2">Whisper Comments</h3>
              <p className="text-gray-400">
                Leave your thoughts in the shadows. Every image tells a story worth sharing.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Preview Gallery */}
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Recent Hauntings</h2>
          <p className="text-gray-400 mb-8">A glimpse into the darkness that awaits...</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-16">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="aspect-square bg-gray-800 rounded-lg overflow-hidden relative group cursor-pointer">
              <img
                src={`/placeholder.svg?height=300&width=300`}
                alt={`Preview ${i}`}
                className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-300"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    {[1, 2, 3, 4, 5].map((skull) => (
                      <Skull key={skull} className="w-4 h-4 text-red-500" />
                    ))}
                  </div>
                  <p className="text-sm">Sign in to explore</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <p className="text-xl md:text-2xl text-gray-300 mb-6">Ready to descend into the gallery of the damned?</p>
          <Button
            onClick={() => setShowAuth(true)}
            className="bg-red-900 hover:bg-red-800 text-white px-12 py-4 text-xl"
          >
            Welcome back, brave soul...
          </Button>
        </div>
      </div>

      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />
    </div>
  )
}
