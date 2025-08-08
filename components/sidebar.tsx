'use client';

import React from 'react'
import { FaHome, FaImages, FaUpload, FaUser, FaEye, FaUserCircle, FaSignOutAlt, FaChartBar } from "react-icons/fa"
import { useAuth } from '../lib/auth-context'
import Link from 'next/link'
import ClientOnly from './client-only'

interface NavItem {
  label: string;
  icon: React.ReactElement;
  href: string;
  requiresAuth?: boolean;
  badge?: string;
}

const navItems: NavItem[] = [
  { label: "Gallery", icon: <FaHome />, href: "/" },
  { label: "Upload", icon: <FaUpload />, href: "/upload", requiresAuth: true },
  { label: "My Profile", icon: <FaUser />, href: "/profile", requiresAuth: true },
]

export default function Sidebar() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <aside className="w-64 bg-[#18181b] flex flex-col justify-between min-h-screen p-4 border-r border-zinc-800">
      <div>
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-[#B2002D] rounded-lg flex items-center justify-center">
            <FaImages className="text-white text-xl" />
          </div>
          <div>
            <div className="font-bold text-xl text-white">CreepyGallery</div>
            <div className="text-sm text-zinc-400">Image Sharing Platform</div>
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
                <div className="flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer text-zinc-300 hover:bg-[#B2002D] hover:text-white transition-all duration-200"> 
                  <span className="text-lg">{item.icon}</span>
                  <span className="flex-1 font-medium">{item.label}</span>
                  {item.badge && <span className="bg-[#B2002D] text-xs px-2 py-1 rounded-full font-bold">{item.badge}</span>}
                </div>
              </Link>
            );
          })}
          
          {/* Show auth links for non-logged in users */}
          {!user && (
            <div className="mt-6 pt-6 border-t border-zinc-700">
              <Link href="/login">
                <div className="flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer text-zinc-300 hover:bg-zinc-700 hover:text-white transition-all duration-200 mb-2">
                  <FaUser className="text-lg" />
                  <span className="flex-1 font-medium">Sign In</span>
                </div>
              </Link>
              <Link href="/signup">
                <div className="flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer bg-[#B2002D] text-white hover:bg-[#8B0000] transition-all duration-200">
                  <FaUserCircle className="text-lg" />
                  <span className="flex-1 font-medium">Create Account</span>
                </div>
              </Link>
            </div>
          )}
        </nav>
        {user && (
          <div className="mt-8 pt-6 border-t border-zinc-700">
            <div className="text-sm text-zinc-400 mb-4 font-medium">Statistics</div>
            <div className="space-y-3">
              <div className="flex items-center justify-between px-4 py-2 bg-zinc-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <FaUpload className="text-[#B2002D]" />
                  <span className="text-sm">My Uploads</span>
                </div>
                <span className="bg-[#B2002D] px-2 py-1 rounded-full text-xs font-bold">0</span>
              </div>
              <div className="flex items-center justify-between px-4 py-2 bg-zinc-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <FaChartBar className="text-[#B2002D]" />
                  <span className="text-sm">Total Views</span>
                </div>
                <span className="bg-[#B2002D] px-2 py-1 rounded-full text-xs font-bold">0</span>
              </div>
            </div>
          </div>
        )}
      </div>
      <ClientOnly>
        <div className="flex items-center gap-3 p-4 border-t border-zinc-700 mt-6 bg-zinc-800 rounded-lg">
          <div className="w-10 h-10 bg-[#B2002D] rounded-full flex items-center justify-center">
            <FaUserCircle className="text-white text-xl" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-white">{user?.username || 'Guest'}</div>
            <div className="text-xs text-zinc-400">{user?.email || 'Not signed in'}</div>
          </div>
          {user && (
            <button
              onClick={handleLogout}
              className="text-zinc-400 hover:text-[#B2002D] cursor-pointer transition-colors p-2"
              title="Sign Out"
            >
              <FaSignOutAlt className="text-lg" />
            </button>
          )}
        </div>
      </ClientOnly>
    </aside>
  )
} 