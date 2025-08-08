'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import MainContent from '../../components/main-content';
import ProtectedRoute from '../../components/protected-route';
import { useAuth } from '../../lib/auth-context';
import { FaUser, FaEnvelope, FaCalendar, FaUpload, FaEye, FaDownload, FaEdit } from 'react-icons/fa';
import ClientOnly from '../../components/client-only';

interface UserStats {
  totalUploads: number;
  totalViews: number;
  totalDownloads: number;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats>({
    totalUploads: 0,
    totalViews: 0,
    totalDownloads: 0
  });

  useEffect(() => {
    // TODO: Fetch real user stats from API
    // For now, using placeholder data
    setStats({
      totalUploads: 0,
      totalViews: 0,
      totalDownloads: 0
    });
  }, []);

  return (
    <ProtectedRoute>
      <MainContent>
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950 text-[#F8F8FF]">
          {/* Atmospheric Header */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50"></div>
            <div className="relative z-10 text-center py-16 px-4">
              <h1 className="font-creepy text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-600 to-red-800 mb-4 tracking-wider">
                SHADOW PROFILE
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-8 font-light tracking-wide">
                Your dark domain awaits
              </p>
              <div className="flex justify-center items-center gap-4 text-red-400">
                <div className="w-16 h-px bg-gradient-to-r from-transparent to-red-500"></div>
                <FaUser className="text-2xl animate-pulse" />
                <div className="w-16 h-px bg-gradient-to-l from-transparent to-red-500"></div>
              </div>
            </div>
          </div>

          <div className="max-w-6xl mx-auto px-6 pb-16">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Info */}
              <div className="lg:col-span-2">
                <div className="group relative">
                  {/* Glowing border effect */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-red-800 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                  
                  <div className="relative bg-gradient-to-br from-gray-900 to-black border border-red-900/30 rounded-2xl p-8 shadow-2xl">
                    <div className="flex items-start justify-between mb-8">
                      <div className="flex items-center gap-6">
                        <div className="relative">
                          <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-red-800 rounded-full blur opacity-75"></div>
                          <div className="relative w-24 h-24 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center border-2 border-red-500/30">
                            <FaUser className="text-4xl text-white" />
                          </div>
                        </div>
                        <div>
                          <h2 className="font-creepy text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600 mb-2">
                            {user?.username}
                          </h2>
                          <p className="text-gray-300 mb-3 text-lg font-medium">Shadow Walker</p>
                          <div className="flex items-center gap-6 text-sm text-gray-400">
                            <div className="flex items-center gap-2 bg-red-900/20 px-3 py-1 rounded-full border border-red-800/30">
                              <FaEnvelope className="w-4 h-4 text-red-400" />
                              <span className="text-gray-300">{user?.email}</span>
                            </div>
                            <ClientOnly>
                              <div className="flex items-center gap-2 bg-gray-800/50 px-3 py-1 rounded-full border border-gray-700/30">
                                <FaCalendar className="w-4 h-4 text-gray-400" />
                                <span>
                                  Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}
                                </span>
                              </div>
                            </ClientOnly>
                          </div>
                        </div>
                      </div>
                      <button className="group relative bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-red-900/50 border border-red-500/30">
                        <FaEdit className="w-4 h-4 inline mr-2 group-hover:animate-pulse" />
                        <span className="tracking-wide">EDIT PROFILE</span>
                      </button>
                    </div>

                    {/* Account Details */}
                    <div className="border-t border-red-900/30 pt-8">
                      <div className="space-y-6">
                        <div className="flex justify-between items-center py-4 px-4 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/30">
                          <span className="text-gray-300 font-medium">Username</span>
                          <span className="text-white font-bold tracking-wide">{user?.username}</span>
                        </div>
                        <div className="flex justify-between items-center py-4 px-4 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/30">
                          <span className="text-gray-300 font-medium">Email Address</span>
                          <span className="text-white font-bold">{user?.email}</span>
                        </div>
                        <div className="flex justify-between items-center py-4 px-4 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/30">
                          <span className="text-gray-300 font-medium">Account Status</span>
                          <span className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-full text-sm font-bold border border-green-500/30">
                            ✓ ACTIVE
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Sidebar */}
              <div className="space-y-8">
                {/* Quick Stats */}
                <div className="group relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-red-800 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                  
                  <div className="relative bg-gradient-to-br from-gray-900 to-black border border-red-900/30 rounded-2xl p-6 shadow-2xl">
                    <div className="text-center mb-6">
                      <h3 className="font-creepy text-2xl text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600 mb-2">
                        DARK STATISTICS
                      </h3>
                      <div className="w-16 h-px bg-gradient-to-r from-transparent via-red-500 to-transparent mx-auto"></div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="group relative bg-gradient-to-r from-red-900/20 to-red-800/20 p-4 rounded-xl border border-red-800/30 hover:border-red-600/50 transition-all duration-300">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-red-800 rounded-lg blur opacity-75"></div>
                            <div className="relative w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center">
                              <FaUpload className="text-white text-lg" />
                            </div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-white">{stats.totalUploads}</div>
                            <div className="text-sm text-gray-400 font-medium">NIGHTMARES SHARED</div>
                          </div>
                        </div>
                      </div>

                      <div className="group relative bg-gradient-to-r from-blue-900/20 to-blue-800/20 p-4 rounded-xl border border-blue-800/30 hover:border-blue-600/50 transition-all duration-300">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg blur opacity-75"></div>
                            <div className="relative w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                              <FaEye className="text-white text-lg" />
                            </div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-white">{stats.totalViews}</div>
                            <div className="text-sm text-gray-400 font-medium">SOULS TERRIFIED</div>
                          </div>
                        </div>
                      </div>

                      <div className="group relative bg-gradient-to-r from-green-900/20 to-green-800/20 p-4 rounded-xl border border-green-800/30 hover:border-green-600/50 transition-all duration-300">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-green-800 rounded-lg blur opacity-75"></div>
                            <div className="relative w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-lg flex items-center justify-center">
                              <FaDownload className="text-white text-lg" />
                            </div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-white">{stats.totalDownloads}</div>
                            <div className="text-sm text-gray-400 font-medium">HORRORS CAPTURED</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="group relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-red-800 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                  
                  <div className="relative bg-gradient-to-br from-gray-900 to-black border border-red-900/30 rounded-2xl p-6 shadow-2xl">
                    <div className="text-center mb-6">
                      <h3 className="font-creepy text-2xl text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600 mb-2">
                        DARK ACTIONS
                      </h3>
                      <div className="w-16 h-px bg-gradient-to-r from-transparent via-red-500 to-transparent mx-auto"></div>
                    </div>
                    
                    <div className="space-y-4">
                      <Link href="/upload" className="group w-full relative bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white p-4 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-red-900/50 border border-red-500/30 block">
                        <div className="flex items-center justify-center gap-3">
                          <FaUpload className="text-lg group-hover:animate-bounce" />
                          <span className="tracking-wide">SUMMON NEW IMAGE</span>
                        </div>
                      </Link>
                      
                      <Link href="/" className="group w-full relative bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white p-4 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-gray-900/50 border border-gray-600/30 block">
                        <div className="flex items-center justify-center gap-3">
                          <FaUser className="text-lg group-hover:animate-pulse" />
                          <span className="tracking-wide">VIEW GALLERY</span>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MainContent>
    </ProtectedRoute>
  );
} 