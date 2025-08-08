'use client';

import React, { useState, useEffect } from 'react';
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
        <div className="bg-black text-[#F8F8FF] min-h-screen p-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Info */}
              <div className="lg:col-span-2">
                <div className="bg-[#1A1A1A] border border-zinc-800 rounded-xl p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-[#B2002D] rounded-full flex items-center justify-center">
                        <FaUser className="text-3xl text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">{user?.username}</h2>
                        <p className="text-zinc-400 mb-2">Gallery Member</p>
                        <div className="flex items-center gap-4 text-sm text-zinc-500">
                          <div className="flex items-center gap-1">
                            <FaEnvelope className="w-4 h-4" />
                            <span>{user?.email}</span>
                          </div>
                          <ClientOnly>
                            <div className="flex items-center gap-1">
                              <FaCalendar className="w-4 h-4" />
                              <span>
                                Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}
                              </span>
                            </div>
                          </ClientOnly>
                        </div>
                      </div>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#B2002D] hover:bg-[#8B0000] text-white rounded-lg transition-colors">
                      <FaEdit className="w-4 h-4" />
                      Edit Profile
                    </button>
                  </div>

                  {/* Account Details */}
                  <div className="border-t border-zinc-800 pt-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Account Information</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-3 border-b border-zinc-800">
                        <span className="text-zinc-300">Username</span>
                        <span className="text-white font-medium">{user?.username}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-zinc-800">
                        <span className="text-zinc-300">Email Address</span>
                        <span className="text-white font-medium">{user?.email}</span>
                      </div>
                      <div className="flex justify-between items-center py-3">
                        <span className="text-zinc-300">Account Status</span>
                        <span className="px-3 py-1 bg-green-900 text-green-300 rounded-full text-sm">Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Sidebar */}
              <div className="space-y-6">
                {/* Quick Stats */}
                <div className="bg-[#1A1A1A] border border-zinc-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Statistics</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#B2002D] rounded-lg flex items-center justify-center">
                          <FaUpload className="text-white" />
                        </div>
                        <div>
                          <div className="text-white font-semibold">{stats.totalUploads}</div>
                          <div className="text-xs text-zinc-400">Total Uploads</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                          <FaEye className="text-white" />
                        </div>
                        <div>
                          <div className="text-white font-semibold">{stats.totalViews}</div>
                          <div className="text-xs text-zinc-400">Total Views</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                          <FaDownload className="text-white" />
                        </div>
                        <div>
                          <div className="text-white font-semibold">{stats.totalDownloads}</div>
                          <div className="text-xs text-zinc-400">Downloads</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-[#1A1A1A] border border-zinc-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button className="w-full flex items-center gap-3 p-3 bg-[#B2002D] hover:bg-[#8B0000] text-white rounded-lg transition-colors">
                      <FaUpload />
                      <span>Upload New Image</span>
                    </button>
                    <button className="w-full flex items-center gap-3 p-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors">
                      <FaUser />
                      <span>View My Uploads</span>
                    </button>
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