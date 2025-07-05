'use client';

import React from 'react'
import Link from 'next/link'
import { useAuth } from '../lib/auth-context'
import ClientOnly from '../components/client-only'

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-[#F8F8FF] relative overflow-hidden">
      {/* Fog overlay (CSS effect) */}
      <div className="absolute inset-0 pointer-events-none z-0 animate-fog bg-gradient-to-b from-[#1A1A1A]/80 to-black opacity-80" />
      {/* Glitchy Title */}
      <h1 className="font-creepy text-6xl md:text-8xl text-center mb-4 z-10 glitch">CREEPYGALLERY</h1>
      <p className="text-lg md:text-2xl text-center max-w-xl mb-8 z-10">Where shadows come to life. Step into a haunted nether-realm of cursed photos, chilling tales, and eerie mysteries.</p>
      
      <ClientOnly>
        {user ? (
          <div className="z-10 flex flex-col items-center gap-4">
            <p className="text-lg text-zinc-300">Welcome back, {user.username}!</p>
            <Link href="/gallery" className="bg-[#B2002D] hover:bg-[#8B0000] text-[#F8F8FF] px-8 py-4 rounded-lg text-xl font-bold shadow-lg transition-all duration-200 glitch-btn">
              Enter the Gallery
            </Link>
          </div>
        ) : (
          <div className="z-10 flex flex-col items-center gap-4">
            <p className="text-lg text-zinc-300">Join the shadows to explore the gallery</p>
            <div className="flex gap-4">
              <Link href="/signup" className="bg-[#B2002D] hover:bg-[#8B0000] text-[#F8F8FF] px-8 py-4 rounded-lg text-xl font-bold shadow-lg transition-all duration-200 glitch-btn">
                Create Account
              </Link>
              <Link href="/login" className="bg-zinc-800 hover:bg-zinc-700 text-[#F8F8FF] px-8 py-4 rounded-lg text-xl font-bold shadow-lg transition-all duration-200 border border-zinc-600">
                Sign In
              </Link>
            </div>
          </div>
        )}
      </ClientOnly>
    </div>
  );
}
