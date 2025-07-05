'use client';

import React from 'react';
import MainContent from '../../components/main-content';
import ProtectedRoute from '../../components/protected-route';
import { useAuth } from '../../lib/auth-context';
import { FaUser, FaEnvelope, FaCalendar } from 'react-icons/fa';
import ClientOnly from '../../components/client-only';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <MainContent>
        <div className="bg-black text-[#F8F8FF] flex flex-col items-center justify-center max-w-2xl mx-auto">
          <h1 className="text-4xl font-creepy mb-8">Your Cursed Profile</h1>
          
          <div className="bg-[#1A1A1A] border border-[#8B0000] rounded-xl p-8 w-full">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-[#8B0000] rounded-full flex items-center justify-center">
                <FaUser className="text-2xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{user?.username}</h2>
                <p className="text-zinc-400">Shadow Walker</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <FaEnvelope className="text-zinc-400" />
                <span className="text-zinc-300">{user?.email}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <FaCalendar className="text-zinc-400" />
                <ClientOnly>
                  <span className="text-zinc-300">
                    Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                  </span>
                </ClientOnly>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-zinc-800">
              <h3 className="text-lg font-semibold mb-4">Your Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-800 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-[#B2002D]">13</div>
                  <div className="text-sm text-zinc-400">Uploads</div>
                </div>
                <div className="bg-zinc-800 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-[#B2002D]">4</div>
                  <div className="text-sm text-zinc-400">Fear Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MainContent>
    </ProtectedRoute>
  );
} 