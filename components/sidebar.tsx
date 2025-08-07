'use client';

import React from 'react'
import { FaHome, FaImages, FaUpload, FaUser, FaLock, FaCrown, FaMoon, FaEye, FaUserCircle, FaSignOutAlt } from "react-icons/fa"
import { useAuth } from '../lib/auth-context'
import Link from 'next/link'
import ClientOnly from './client-only'

interface NavItem {
  label: string;
  icon: React.ReactElement;
  href: string;
  requiresAuth?: boolean;
  locked?: boolean;
  badge?: string;
}

const navItems: NavItem[] = [
  { label: "Home", icon: <FaHome />, href: "/" },
  { label: "Upload", icon: <FaUpload />, href: "/upload", requiresAuth: true },
  { label: "Profile", icon: <FaUser />, href: "/profile", requiresAuth: true },
  { label: "Darkroom", icon: <FaMoon />, locked: true, href: "/darkroom" },
  { label: "Admin Ritual", icon: <FaCrown />, locked: true, href: "/admin-ritual" },
]

export default function Sidebar() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <aside className="w-64 bg-[#18181b] flex flex-col justify-between min-h-screen p-4 border-r border-zinc-800">
      <div>
        <div className="flex items-center gap-2 mb-8">
          <span className="text-2xl"><FaEye /></span>
          <div>
            <div className="font-bold text-lg tracking-widest">GALLERY</div>
            <div className="text-xs text-zinc-400">of Shadows</div>
          </div>
        </div>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            // Hide auth-required items if user is not logged in
            if (item.requiresAuth && !user) {
              return null;
            }
            
            return (
              <Link key={item.label} href={item.href}>
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-zinc-400 hover:bg-zinc-800 hover:text-white"> 
                  <span>{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && <span className="bg-red-700 text-xs px-2 py-0.5 rounded-full font-bold">{item.badge}</span>}
                  {item.locked && <FaLock className="ml-2 text-zinc-600" />}
                </div>
              </Link>
            );
          })}
          
          {/* Show auth links for non-logged in users */}
          {!user && (
            <>
              <Link href="/login">
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-zinc-400 hover:bg-zinc-800 hover:text-white">
                  <FaUser />
                  <span className="flex-1">Sign In</span>
                </div>
              </Link>
              <Link href="/signup">
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-[#B2002D] hover:bg-zinc-800 hover:text-white">
                  <FaUserCircle />
                  <span className="flex-1">Join Gallery</span>
                </div>
              </Link>
            </>
          )}
        </nav>
        {user && (
          <div className="mt-8">
            <div className="text-xs text-zinc-400 mb-2">Your Darkness</div>
            <div className="flex items-center justify-between px-3 py-2">
              <span>Uploads</span>
              <span className="bg-zinc-800 px-2 py-0.5 rounded-full text-xs">0</span>
            </div>
            <div className="flex items-center justify-between px-3 py-2">
              <span>Fear Rating</span>
              <span className="flex gap-1">
                {[0,1,2,3,4].map((i) => (
                  <span key={i} className={`w-2 h-2 rounded-full ${i < 2 ? "bg-red-700" : "bg-zinc-700"}`}></span>
                ))}
              </span>
            </div>
          </div>
        )}
      </div>
      <ClientOnly>
        <div className="flex items-center gap-3 p-3 border-t border-zinc-800 mt-8">
          <FaUserCircle className="text-3xl text-zinc-400" />
          <div className="flex-1">
            <div className="font-semibold">{user?.username || 'Guest'}</div>
            <div className="text-xs text-zinc-500">{user?.email || 'Not signed in'}</div>
          </div>
          {user && (
            <button
              onClick={handleLogout}
              className="text-zinc-600 hover:text-red-500 cursor-pointer transition-colors"
              title="Logout"
            >
              <FaSignOutAlt />
            </button>
          )}
        </div>
      </ClientOnly>
    </aside>
  )
} 