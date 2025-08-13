'use client';

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { FaArrowUp, FaRegCalendarAlt, FaUpload, FaUser, FaSignInAlt, FaUserPlus, FaSignOutAlt } from 'react-icons/fa'
import { FaSkull } from 'react-icons/fa6'
import { useAuth } from '../lib/auth-context'
import ClientOnly from '../components/client-only'
import FullscreenModal from '../components/fullscreen-modal'

interface GalleryItem {
  id: number;
  title: string;
  image_url: string | null;
  date_uploaded: string;
  downloads: number;
  author: string;
  tags: string[];
  chill_level: number;
}

function SkullRating({ level }: { level: number }) {
  return (
    <span className="flex gap-1">
      {[0, 1, 2, 3, 4].map(i => (
        <FaSkull key={i} className={`w-4 h-4 ${i < level ? 'text-[#8B0000] drop-shadow-glow' : 'text-zinc-700'}`} />
      ))}
    </span>
  )
}

export default function Home() {
  const { user, logout } = useAuth();
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);



  useEffect(() => {
    fetchGalleryItems();

    // Auto-refresh when user returns to page (e.g., after upload)
    const handleFocus = () => {
      fetchGalleryItems();
    };

    // Listen for storage events to refresh gallery after upload
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'gallery-refresh') {
        console.log('Gallery refresh triggered by upload');
        fetchGalleryItems();
      }
    };

    // Listen for messages from upload page
    const handleMessage = (e: MessageEvent) => {
      if (e.data === 'gallery-refresh') {
        console.log('Gallery refresh triggered by message');
        fetchGalleryItems();
      }
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const fetchGalleryItems = async () => {
    try {
      setLoading(true);
      // Add cache-busting timestamp to ensure fresh data
      const response = await fetch(`/api/gallery?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (response.ok) {
        const items = await response.json();
        console.log('Gallery items fetched:', items);
        setGalleryItems(items);
      }
    } catch (error) {
      console.error('❌ Error fetching gallery items:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const handleImageClick = (item: GalleryItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    if (!selectedItem) return;

    const currentIndex = galleryItems.findIndex(item => item.id === selectedItem.id);
    let newIndex;

    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : galleryItems.length - 1;
    } else {
      newIndex = currentIndex < galleryItems.length - 1 ? currentIndex + 1 : 0;
    }

    setSelectedItem(galleryItems[newIndex]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950 text-[#F8F8FF]">
      {/* Navigation Header */}
      <nav className="relative z-20 bg-black/20 backdrop-blur-sm border-b border-red-900/30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <FaSkull className="text-2xl text-red-500 group-hover:animate-pulse" />
              <span className="font-creepy text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">
                CREEPY GALLERY
              </span>
            </Link>

            {/* Navigation Links */}
            <ClientOnly>
              <div className="flex items-center gap-4">
                {user ? (
                  <>
                    <Link
                      href="/upload"
                      className="group flex items-center gap-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 px-4 py-2 rounded-lg transition-all duration-300 border border-red-600/30 hover:border-red-500/50"
                    >
                      <FaUpload className="w-4 h-4 group-hover:animate-bounce" />
                      <span className="font-medium">Upload</span>
                    </Link>
                    <Link
                      href="/profile"
                      className="group flex items-center gap-2 bg-gray-700/20 hover:bg-gray-600/30 text-gray-300 hover:text-white px-4 py-2 rounded-lg transition-all duration-300 border border-gray-600/30 hover:border-gray-500/50"
                    >
                      <FaUser className="w-4 h-4 group-hover:animate-pulse" />
                      <span className="font-medium">{user.username}</span>
                    </Link>
                    <button
                      onClick={logout}
                      className="group flex items-center gap-2 bg-gray-800/20 hover:bg-red-600/20 text-gray-400 hover:text-red-400 px-4 py-2 rounded-lg transition-all duration-300 border border-gray-700/30 hover:border-red-600/50"
                    >
                      <FaSignOutAlt className="w-4 h-4" />
                      <span className="font-medium">Logout</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="group flex items-center gap-2 bg-gray-700/20 hover:bg-gray-600/30 text-gray-300 hover:text-white px-4 py-2 rounded-lg transition-all duration-300 border border-gray-600/30 hover:border-gray-500/50"
                    >
                      <FaSignInAlt className="w-4 h-4" />
                      <span className="font-medium">Login</span>
                    </Link>
                    <Link
                      href="/signup"
                      className="group flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-2 rounded-lg transition-all duration-300 shadow-lg hover:shadow-red-900/50 border border-red-500/30"
                    >
                      <FaUserPlus className="w-4 h-4" />
                      <span className="font-medium">Sign Up</span>
                    </Link>
                  </>
                )}
              </div>
            </ClientOnly>
          </div>
        </div>
      </nav>

      {/* Atmospheric Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50"></div>
        <div className="relative z-10 text-center py-16 px-4">
          <h1 className="font-creepy text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-600 to-red-800 mb-4 tracking-wider">
            CREEPY GALLERY
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 font-light tracking-wide">
            Where nightmares become art
          </p>
          <div className="flex justify-center items-center gap-4 text-red-400">
            <div className="w-16 h-px bg-gradient-to-r from-transparent to-red-500"></div>
            <FaSkull className="text-2xl animate-pulse" />
            <div className="w-16 h-px bg-gradient-to-l from-transparent to-red-500"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 pb-16">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-900/30 border-t-red-500"></div>
              <FaSkull className="absolute inset-0 m-auto text-red-500 text-xl animate-pulse" />
            </div>
            <p className="text-gray-300 mt-6 text-lg tracking-wide">Summoning dark visions...</p>
          </div>
        ) : galleryItems.length === 0 ? (
          <div className="text-center py-32">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full"></div>
              <FaSkull className="relative text-8xl text-red-500 mx-auto animate-pulse" />
            </div>
            <h2 className="font-creepy text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">
              The Void Awaits
            </h2>
            <p className="text-gray-400 mb-12 max-w-lg mx-auto text-lg leading-relaxed">
              No nightmares have been captured yet. Be the first to unleash your darkest visions upon this realm.
            </p>
            <ClientOnly>
              {user ? (
                <Link
                  href="/upload"
                  className="group relative bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 inline-flex items-center gap-3 shadow-lg hover:shadow-red-900/50 border border-red-500/30"
                >
                  <FaUpload className="w-5 h-5 group-hover:animate-bounce" />
                  <span className="tracking-wide">UPLOAD FIRST IMAGE</span>
                </Link>
              ) : (
                <Link
                  href="/signup"
                  className="group relative bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-red-900/50 border border-red-500/30"
                >
                  <span className="tracking-wide">GET STARTED</span>
                </Link>
              )}
            </ClientOnly>
          </div>
        ) : (
          <>
            <div className="text-center mb-16">
              <div className="relative mb-6">
                <h2 className="font-creepy text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-red-500 to-red-600 mb-4 tracking-wider">
                  GALLERY OF NIGHTMARES
                </h2>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent"></div>
              </div>
              <p className="text-gray-300 max-w-3xl mx-auto mb-8 text-lg leading-relaxed">
                Venture into the abyss of human imagination. Each cursed image harbors secrets of terror,
                mystery, and the supernatural realm beyond mortal comprehension.
              </p>
              <button
                onClick={fetchGalleryItems}
                className="group bg-gray-800/50 hover:bg-red-900/30 border border-red-800/30 hover:border-red-600/50 text-gray-300 hover:text-red-400 px-6 py-3 rounded-xl transition-all duration-300 inline-flex items-center gap-2 backdrop-blur-sm"
              >
                <span className="group-hover:animate-spin">🔄</span>
                <span className="font-medium tracking-wide">REFRESH VISIONS</span>
              </button>
            </div>

            {/* Pinterest-style Masonry Grid */}
            <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
              {galleryItems.map(item => (
                <div
                  key={item.id}
                  className="break-inside-avoid mb-4 group cursor-pointer"
                  onClick={() => handleImageClick(item)}
                >
                  <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-red-900/20 transition-all duration-300 hover:scale-[1.02] border border-white/10 hover:border-red-500/30">
                    {item.image_url ? (
                      <div className="relative">
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                        
                        {/* Subtle hover overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute bottom-4 left-4 right-4">
                            <h3 className="text-white font-bold text-lg mb-1 truncate">{item.title}</h3>
                            <p className="text-white/80 text-sm">by {item.author}</p>
                          </div>
                          
                          {/* View indicator */}
                          <div className="absolute top-4 right-4">
                            <div className="bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                              👁️ View
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-square flex flex-col items-center justify-center text-gray-400 bg-gray-800/30">
                        <FaSkull className="text-4xl text-red-500 mb-2" />
                        <span className="text-sm">No Image</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Fullscreen Modal */}
      <FullscreenModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        currentItem={selectedItem}
        allItems={galleryItems}
        onNavigate={handleNavigate}
      />
    </div>
  );
}
