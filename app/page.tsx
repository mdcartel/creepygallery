'use client';

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FaArrowUp, FaRegCalendarAlt, FaUpload, FaUser } from 'react-icons/fa'
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
      {[0,1,2,3,4].map(i => (
        <FaSkull key={i} className={`w-4 h-4 ${i < level ? 'text-[#8B0000] drop-shadow-glow' : 'text-zinc-700'}`} />
      ))}
    </span>
  )
}

export default function Home() {
  const { user } = useAuth();
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
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const fetchGalleryItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/gallery');
      if (response.ok) {
        const items = await response.json();
        console.log('Gallery items fetched:', items);
        setGalleryItems(items);
      }
    } catch (error) {
      console.error('Error fetching gallery items:', error);
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
    <div className="min-h-screen bg-black text-[#F8F8FF]">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-black/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="font-creepy text-2xl md:text-3xl text-[#B2002D]">CREEPYGALLERY</h1>
            <p className="hidden md:block text-zinc-400 text-sm">Discover cursed images from the shadows</p>
          </div>
          
          <ClientOnly>
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <span className="text-sm text-zinc-300">Welcome, {user.username}</span>
                  <Link 
                    href="/upload" 
                    className="bg-[#B2002D] hover:bg-[#8B0000] text-[#F8F8FF] px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <FaUpload className="w-4 h-4" />
                    Upload
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-zinc-300 hover:text-[#F8F8FF] text-sm">Sign In</Link>
                  <Link 
                    href="/signup" 
                    className="bg-[#B2002D] hover:bg-[#8B0000] text-[#F8F8FF] px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Join
                  </Link>
                </>
              )}
            </div>
          </ClientOnly>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B2002D] mb-4"></div>
            <p className="text-zinc-400">Loading cursed images...</p>
          </div>
        ) : galleryItems.length === 0 ? (
          <div className="text-center py-20">
            <FaArrowUp className="text-6xl text-[#8B0000] mb-6 mx-auto rotate-180" />
            <h2 className="text-3xl font-creepy mb-4">The Gallery Awaits</h2>
            <p className="text-zinc-400 mb-8 max-w-md mx-auto">
              No cursed images have been summoned yet. Be the first to share your dark creations.
            </p>
            <ClientOnly>
              {user ? (
                <Link 
                  href="/upload" 
                  className="bg-[#B2002D] hover:bg-[#8B0000] text-[#F8F8FF] px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
                >
                  <FaUpload className="w-4 h-4" />
                  Upload First Image
                </Link>
              ) : (
                <Link 
                  href="/signup" 
                  className="bg-[#B2002D] hover:bg-[#8B0000] text-[#F8F8FF] px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Join to Upload
                </Link>
              )}
            </ClientOnly>
          </div>
        ) : (
          <>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-creepy mb-4">Gallery of Shadows</h2>
              <p className="text-zinc-300 max-w-2xl mx-auto mb-4">
                Explore the darkest corners of imagination. Each image tells a story of fear, mystery, and the supernatural.
              </p>
              <button 
                onClick={fetchGalleryItems}
                className="text-zinc-400 hover:text-[#B2002D] text-sm transition-colors"
              >
                🔄 Refresh Gallery
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {galleryItems.map(item => (
                <div key={item.id} className="bg-[#1A1A1A] border border-[#8B0000] rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow group">
                  <div 
                    className="aspect-square bg-zinc-800 relative overflow-hidden cursor-pointer"
                    onClick={() => handleImageClick(item)}
                  >
                    {item.image_url ? (
                      <img 
                        src={item.image_url} 
                        alt={item.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        style={{ 
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          zIndex: 1,
                          display: 'block'
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center w-full h-full">
                        <FaArrowUp className="text-4xl text-[#8B0000] mb-2 rotate-180" />
                        <span className="text-[#F8F8FF] text-sm">No Image</span>
                      </div>
                    )}
                    
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center pointer-events-none z-10">
                      <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm font-medium bg-black bg-opacity-60 px-3 py-1 rounded-full">
                        Click to view
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-[#F8F8FF] mb-2 truncate">{item.title}</h3>
                    
                    <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                      <span className="flex items-center gap-1">
                        <FaUser className="w-3 h-3" />
                        {item.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaRegCalendarAlt className="w-3 h-3" />
                        {formatDate(item.date_uploaded)}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mb-2">
                      {item.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="bg-[#B2002D] text-xs px-2 py-1 rounded-full text-[#F8F8FF]">
                          #{tag}
                        </span>
                      ))}
                      {item.tags.length > 3 && (
                        <span className="text-xs text-zinc-400">+{item.tags.length - 3}</span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <SkullRating level={item.chill_level} />
                      <span className="text-xs text-zinc-400">{item.downloads} views</span>
                    </div>
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
