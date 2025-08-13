'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { FaTimes, FaDownload, FaChevronLeft, FaChevronRight, FaUser, FaCalendarAlt } from 'react-icons/fa';
import { FaSkull } from 'react-icons/fa6';

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

interface FullscreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentItem: GalleryItem | null;
  allItems: GalleryItem[];
  onNavigate: (direction: 'prev' | 'next') => void;
}

function SkullRating({ level }: { level: number }) {
  return (
    <span className="flex gap-1">
      {[0,1,2,3,4].map(i => (
        <FaSkull key={i} className={`w-4 h-4 ${i < level ? 'text-[#8B0000] drop-shadow-glow' : 'text-zinc-700'}`} />
      ))}
    </span>
  );
}

export default function FullscreenModal({ isOpen, onClose, currentItem, allItems, onNavigate }: FullscreenModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [showMetadata, setShowMetadata] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          onNavigate('prev');
          break;
        case 'ArrowRight':
          onNavigate('next');
          break;
        case 'i':
        case 'I':
          setShowMetadata(!showMetadata);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, onNavigate, showMetadata]);

  const handleDownload = async () => {
    if (!currentItem || !currentItem.image_url) return;

    setIsDownloading(true);
    try {
      // Call download API to increment counter and get the image
      const response = await fetch(`/api/download/${currentItem.id}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentItem.title.replace(/[^a-zA-Z0-9]/g, '_')}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
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

  if (!isOpen || !currentItem) return null;

  const currentIndex = allItems.findIndex(item => item.id === currentItem.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < allItems.length - 1;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center">
      {/* Top controls */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <button
          onClick={() => setShowMetadata(!showMetadata)}
          className="text-white hover:text-[#B2002D] transition-colors p-2 bg-black/50 rounded-lg"
          aria-label="Toggle image info"
          title="Press 'i' to toggle info"
        >
          <span className="text-sm font-bold">i</span>
        </button>
        <button
          onClick={onClose}
          className="text-white hover:text-[#B2002D] transition-colors p-2 bg-black/50 rounded-lg"
          aria-label="Close fullscreen view"
        >
          <FaTimes className="w-6 h-6" />
        </button>
      </div>

      {/* Navigation buttons */}
      {hasPrev && (
        <button
          onClick={() => onNavigate('prev')}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-[#B2002D] transition-colors p-3 bg-black/50 rounded-lg"
          aria-label="Previous image"
        >
          <FaChevronLeft className="w-6 h-6" />
        </button>
      )}

      {hasNext && (
        <button
          onClick={() => onNavigate('next')}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-[#B2002D] transition-colors p-3 bg-black/50 rounded-lg"
          aria-label="Next image"
        >
          <FaChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Main image container */}
      <div className="absolute inset-0 flex items-center justify-center p-4" style={{ paddingBottom: showMetadata ? '200px' : '16px' }}>
        {currentItem.image_url ? (
          <img
            src={currentItem.image_url}
            alt={currentItem.title}
            className="max-w-full max-h-full object-contain"
            style={{ 
              maxWidth: '100%', 
              maxHeight: '100%',
              width: 'auto',
              height: 'auto'
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-white">
            <FaSkull className="text-6xl text-[#8B0000] mb-4" />
            <p className="text-xl">Image not found</p>
          </div>
        )}
      </div>

      {/* Metadata overlay */}
      {showMetadata && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">{currentItem.title}</h2>
                <div className="flex items-center gap-4 text-sm text-zinc-300 mb-3">
                  <span className="flex items-center gap-1">
                    <FaUser className="w-4 h-4" />
                    {currentItem.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <FaCalendarAlt className="w-4 h-4" />
                    {formatDate(currentItem.date_uploaded)}
                  </span>
                  <span>{currentItem.downloads} downloads</span>
                </div>
                
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-zinc-400">Chill Level:</span>
                    <SkullRating level={currentItem.chill_level} />
                  </div>
                </div>

                {currentItem.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {currentItem.tags.map((tag, index) => (
                      <span key={index} className="bg-[#B2002D] text-xs px-2 py-1 rounded-full text-white">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={handleDownload}
                  disabled={isDownloading || !currentItem.image_url}
                  className="bg-[#B2002D] hover:bg-[#8B0000] disabled:bg-zinc-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <FaDownload className="w-4 h-4" />
                  {isDownloading ? 'Downloading...' : 'Download'}
                </button>
              </div>
            </div>


          </div>
        </div>
      )}

      {/* Image counter */}
      <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-2 rounded-lg text-sm font-medium">
        {currentIndex + 1} / {allItems.length}
      </div>
    </div>
  );
}