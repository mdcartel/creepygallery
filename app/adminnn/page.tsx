'use client';

import React, { useState, useEffect } from 'react';
import { FaSkull, FaUser, FaTrash, FaEye, FaSignOutAlt, FaUserShield } from 'react-icons/fa';

interface User {
  id: string;
  email: string;
  username: string;
  created_at: string;
}

interface GalleryItem {
  id: number;
  title: string;
  image_url: string;
  author: string;
  user_id: string;
  date_uploaded: string;
  downloads: number;
}

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'gallery'>('users');
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'mdcartel' && password === 'markd1') {
      setIsAuthenticated(true);
      setError('');
      fetchUsers();
      fetchGalleryItems();
    } else {
      setError('Invalid admin credentials');
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGalleryItems = async () => {
    try {
      const response = await fetch('/api/admin/gallery');
      if (response.ok) {
        const data = await response.json();
        setGalleryItems(data.items || []);
      }
    } catch (error) {
      console.error('Error fetching gallery items:', error);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This will also delete all their gallery items.')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (response.ok) {
        fetchUsers();
        fetchGalleryItems();
      } else {
        alert('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user');
    }
  };

  const deleteGalleryItem = async (itemId: number) => {
    if (!confirm('Are you sure you want to delete this gallery item?')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/gallery', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId })
      });

      if (response.ok) {
        fetchGalleryItems();
      } else {
        alert('Failed to delete gallery item');
      }
    } catch (error) {
      console.error('Error deleting gallery item:', error);
      alert('Error deleting gallery item');
    }
  };

  const clearAllGallery = async () => {
    if (!confirm('⚠️ WARNING: This will delete ALL gallery items from ALL users. This action cannot be undone. Are you absolutely sure?')) {
      return;
    }

    if (!confirm('🚨 FINAL WARNING: You are about to permanently delete the entire gallery. Type YES in the next dialog to confirm.')) {
      return;
    }

    const confirmation = prompt('Type "DELETE ALL" to confirm you want to clear the entire gallery:');
    if (confirmation !== 'DELETE ALL') {
      alert('Gallery clear cancelled - confirmation text did not match.');
      return;
    }

    try {
      const response = await fetch('/api/admin/clear-gallery', {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (response.ok) {
        alert('✅ ' + data.message);
        fetchGalleryItems();
      } else {
        alert('❌ Failed to clear gallery: ' + data.error);
      }
    } catch (error) {
      console.error('Error clearing gallery:', error);
      alert('❌ Error clearing gallery');
    }
  };

  const clearAllUsers = async () => {
    if (!confirm('🚨 EXTREME WARNING: This will delete ALL USERS and ALL GALLERY ITEMS. This is a complete system reset. This action cannot be undone. Are you absolutely sure?')) {
      return;
    }

    if (!confirm('💀 FINAL WARNING: You are about to permanently delete EVERYTHING - all users, all gallery items, all data. This will reset the entire system to empty. Continue?')) {
      return;
    }

    const confirmation = prompt('Type "RESET EVERYTHING" to confirm you want to clear all users and data:');
    if (confirmation !== 'RESET EVERYTHING') {
      alert('System reset cancelled - confirmation text did not match.');
      return;
    }

    try {
      const response = await fetch('/api/admin/clear-users', {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (response.ok) {
        alert('✅ ' + data.message);
        fetchUsers();
        fetchGalleryItems();
      } else {
        alert('❌ Failed to clear users: ' + data.error);
      }
    } catch (error) {
      console.error('Error clearing users:', error);
      alert('❌ Error clearing users');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950 flex items-center justify-center">
        <div className="bg-black/50 backdrop-blur-sm border border-red-900/30 rounded-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <FaUserShield className="text-6xl text-red-500 mx-auto mb-4" />
            <h1 className="font-creepy text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600 mb-2">
              ADMIN ACCESS
            </h1>
            <p className="text-gray-400">Enter admin credentials to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-gray-300 mb-2 font-medium">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-gray-800/50 border border-red-900/30 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2 font-medium">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-800/50 border border-red-900/30 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none"
                required
              />
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 text-red-400 text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 rounded-lg font-bold transition-all duration-300 shadow-lg hover:shadow-red-900/50"
            >
              ACCESS ADMIN PANEL
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950 text-white">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-red-900/30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FaSkull className="text-2xl text-red-500" />
              <h1 className="font-creepy text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">
                ADMIN PANEL
              </h1>
            </div>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="flex items-center gap-2 bg-gray-800/50 hover:bg-red-900/30 text-gray-300 hover:text-red-400 px-4 py-2 rounded-lg transition-all duration-300"
            >
              <FaSignOutAlt className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>



      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
              activeTab === 'users'
                ? 'bg-red-600 text-white'
                : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
            }`}
          >
            <FaUser className="w-4 h-4" />
            Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('gallery')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
              activeTab === 'gallery'
                ? 'bg-red-600 text-white'
                : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
            }`}
          >
            <FaEye className="w-4 h-4" />
            Gallery ({galleryItems.length})
          </button>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-red-400">User Management</h2>
              <div className="flex gap-3">
                <button
                  onClick={fetchUsers}
                  className="bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 px-4 py-2 rounded-lg transition-all duration-300"
                >
                  Refresh
                </button>
                {users.length > 0 && (
                  <button
                    onClick={clearAllUsers}
                    className="bg-red-800/30 hover:bg-red-800/50 text-red-300 hover:text-red-200 px-4 py-2 rounded-lg transition-all duration-300 border border-red-700/50 flex items-center gap-2"
                  >
                    <FaTrash className="w-4 h-4" />
                    Clear All Users
                  </button>
                )}
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-900/30 border-t-red-500 mx-auto mb-4"></div>
                <p className="text-gray-400">Loading users...</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {users.map((user) => (
                  <div key={user.id} className="bg-black/30 border border-red-900/30 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-white mb-1">{user.username}</h3>
                        <p className="text-gray-400 mb-2">{user.email}</p>
                        <p className="text-sm text-gray-500">
                          Joined: {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 p-3 rounded-lg transition-all duration-300 border border-red-600/30"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {users.length === 0 && (
                  <div className="text-center py-12">
                    <FaUser className="text-6xl text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No users found</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Gallery Tab */}
        {activeTab === 'gallery' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-red-400">Gallery Management</h2>
              <div className="flex gap-3">
                <button
                  onClick={fetchGalleryItems}
                  className="bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 px-4 py-2 rounded-lg transition-all duration-300"
                >
                  Refresh
                </button>
                {galleryItems.length > 0 && (
                  <button
                    onClick={clearAllGallery}
                    className="bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 px-4 py-2 rounded-lg transition-all duration-300 border border-red-600/30 flex items-center gap-2"
                  >
                    <FaTrash className="w-4 h-4" />
                    Clear All Gallery
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryItems.map((item) => (
                <div key={item.id} className="bg-black/30 border border-red-900/30 rounded-lg overflow-hidden">
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-white mb-2 truncate">{item.title}</h3>
                    <p className="text-gray-400 mb-1">By: {item.author}</p>
                    <p className="text-sm text-gray-500 mb-3">
                      {new Date(item.date_uploaded).toLocaleDateString()} • {item.downloads} views
                    </p>
                    <button
                      onClick={() => deleteGalleryItem(item.id)}
                      className="w-full bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 py-2 rounded-lg transition-all duration-300 border border-red-600/30 flex items-center justify-center gap-2"
                    >
                      <FaTrash className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {galleryItems.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <FaEye className="text-6xl text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No gallery items found</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}