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
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950 text-[#F8F8FF]">
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
                  <span className="tracking-wide">SUMMON FIRST NIGHTMARE</span>
                </Link>
              ) : (
                <Link 
                  href="/signup" 
                  className="group relative bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-red-900/50 border border-red-500/30"
                >
                  <span className="tracking-wide">JOIN THE DARKNESS</span>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
              {galleryItems.map(item => (
                <div 
                  key={item.id} 
                  className="group relative"
                  onMouseEnter={(e) => {
                    const overlay = e.currentTarget.querySelector('.hover-overlay') as HTMLElement;
                    if (overlay) overlay.style.opacity = '1';
                  }}
                  onMouseLeave={(e) => {
                    const overlay = e.currentTarget.querySelector('.hover-overlay') as HTMLElement;
                    if (overlay) overlay.style.opacity = '0';
                  }}
                >
                  {/* Glowing border effect */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-red-800 rounded-2xl blur opacity-0 group-hover:opacity-75 transition duration-500"></div>
                  
                  <div className="relative bg-gradient-to-br from-gray-900 to-black border border-red-900/30 rounded-2xl overflow-hidden shadow-2xl hover:shadow-red-900/20 transition-all duration-500 group-hover:scale-[1.02]">
                    <div 
                      onClick={() => handleImageClick(item)}
                      style={{
                        width: '100%',
                        aspectRatio: '1',
                        position: 'relative',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        backgroundColor: '#1a1a1a'
                      }}
                    >
                    {item.image_url ? (
                      <img 
                        src={item.image_url} 
                        alt={item.title} 
                        style={{ 
                          position: 'absolute',
                          top: '0',
                          left: '0',
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                          zIndex: '1',
                          transition: 'transform 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      />
                    ) : (
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        height: '100%',
                        color: '#F8F8FF'
                      }}>
                        <FaArrowUp style={{ fontSize: '2rem', color: '#8B0000', marginBottom: '8px', transform: 'rotate(180deg)' }} />
                        <span style={{ fontSize: '0.875rem' }}>No Image</span>
                      </div>
                    )}
                    
                      {/* Hover overlay */}
                      <div 
                        style={{
                          position: 'absolute',
                          top: '0',
                          left: '0',
                          right: '0',
                          bottom: '0',
                          background: 'linear-gradient(45deg, rgba(139,0,0,0.8), rgba(0,0,0,0.9))',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: '0',
                          transition: 'opacity 0.3s ease',
                          zIndex: '10',
                          pointerEvents: 'none'
                        }}
                        className="hover-overlay"
                      >
                        <div style={{
                          color: 'white',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          backgroundColor: 'rgba(139,0,0,0.9)',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          border: '1px solid rgba(255,255,255,0.2)',
                          backdropFilter: 'blur(4px)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          👁️ View
                        </div>
                      </div>
                    </div>
                  
                    <div className="p-5 bg-gradient-to-t from-black/80 to-transparent">
                      <h3 className="text-lg font-bold text-white mb-3 truncate tracking-wide">{item.title}</h3>
                      
                      <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                        <span className="flex items-center gap-2 bg-red-900/20 px-2 py-1 rounded-full border border-red-800/30">
                          <FaUser className="w-3 h-3 text-red-400" />
                          <span className="text-gray-300">{item.author}</span>
                        </span>
                        <span className="flex items-center gap-1 text-gray-500">
                          <FaRegCalendarAlt className="w-3 h-3" />
                          {formatDate(item.date_uploaded)}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        {item.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="bg-gradient-to-r from-red-600 to-red-700 text-xs px-3 py-1 rounded-full text-white font-medium border border-red-500/30">
                            #{tag}
                          </span>
                        ))}
                        {item.tags.length > 3 && (
                          <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded-full">+{item.tags.length - 3}</span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 font-medium">FEAR:</span>
                          <SkullRating level={item.chill_level} />
                        </div>
                        <span className="text-xs text-gray-500 bg-gray-800/50 px-2 py-1 rounded-full">{item.downloads} views</span>
                      </div>
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
