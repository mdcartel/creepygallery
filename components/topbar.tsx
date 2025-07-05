'use client';

import React from 'react'
import { FaEye, FaUserCircle } from "react-icons/fa"
import { useAuth } from '../lib/auth-context'
import Link from 'next/link'
import ClientOnly from './client-only'

export default function Topbar() {
  const { user } = useAuth();

  return (
    <header className="flex items-center justify-between px-8 py-4 bg-[#18181b] border-b border-zinc-800">
      <div className="flex items-center gap-4">
        <span className="text-3xl text-red-700"><FaEye /></span>
        <span className="font-creepy text-3xl tracking-widest">CREEPYGALLERY</span>
        <nav className="flex gap-6 ml-8">
          <Link href="/" className="hover:text-red-700">Home</Link>
          <Link href="/gallery" className="hover:text-red-700">Gallery</Link>
          <Link href="/upload" className="hover:text-red-700">Upload</Link>
          <Link href="/profile" className="hover:text-red-700">Profile</Link>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex gap-1 items-center text-red-700">
          {[0,1,2,3,4].map((i) => (
            <span key={i} className={`w-2 h-2 rounded-full ${i < 4 ? "bg-red-700" : "bg-zinc-700"}`}></span>
          ))}
        </div>
        <span className="bg-zinc-800 px-2 py-0.5 rounded-full text-xs">13 uploads</span>
        <ClientOnly>
          {user ? (
            <div className="flex items-center gap-2">
              <FaUserCircle className="text-2xl text-zinc-400" />
              <span className="text-sm text-zinc-300">{user.username}</span>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-zinc-400 hover:text-red-700 text-sm">
                Sign In
              </Link>
              <Link href="/signup" className="bg-red-700 hover:bg-red-800 text-white px-3 py-1 rounded text-sm">
                Sign Up
              </Link>
            </div>
          )}
        </ClientOnly>
      </div>
    </header>
  )
} 