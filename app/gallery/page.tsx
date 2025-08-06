'use client';
import React, { useState, useEffect } from 'react'
import { FaArrowUp, FaRegCalendarAlt } from 'react-icons/fa'
import { FaSkull } from 'react-icons/fa6'
import Image from 'next/image'
import MainContent from '../../components/main-content'

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
        <FaSkull key={i} className={`w-5 h-5 ${i < level ? 'text-[#8B0000] drop-shadow-glow' : 'text-zinc-700'}`} />
      ))}
    </span>
  )
}

export default function GalleryPage() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  const fetchGalleryItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/gallery');
      
      if (!response.ok) {
        throw new Error('Failed to fetch gallery items');
      }
      
      const items = await response.json();
      setGalleryItems(items);
    } catch (err) {
      console.error('Error fetching gallery items:', err);
      setError('Failed to load gallery items');
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

  if (loading) {
    return (
      <MainContent>
        <div className="flex flex-col items-center justify-center w-full bg-black text-[#F8F8FF] px-8 pb-12 min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B2002D] mb-4"></div>
          <p className="text-zinc-400">Loading cursed images...</p>
        </div>
      </MainContent>
    );
  }

  if (error) {
    return (
      <MainContent>
        <div className="flex flex-col items-center justify-center w-full bg-black text-[#F8F8FF] px-8 pb-12 min-h-screen">
          <div className="text-center">
            <FaArrowUp className="text-5xl text-[#8B0000] mb-4 mx-auto rotate-180" />
            <h2 className="text-2xl font-creepy mb-2">Gallery Unavailable</h2>
            <p className="text-zinc-400 mb-4">{error}</p>
            <button 
              onClick={fetchGalleryItems}
              className="bg-[#B2002D] hover:bg-[#8B0000] text-[#F8F8FF] px-4 py-2 rounded transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </MainContent>
    );
  }

  return (
    <MainContent>
      <div className="flex flex-col items-center w-full bg-black text-[#F8F8FF] px-8 pb-12">
        <h1 className="font-creepy text-5xl mt-8 mb-2 text-center">GALLERY OF SHADOWS</h1>
        <p className="text-zinc-300 text-lg mb-10 text-center max-w-2xl">
          Explore the darkest corners of imagination. Each image tells a story of fear, mystery, and the supernatural.
        </p>
        
        {galleryItems.length === 0 ? (
          <div className="text-center py-12">
            <FaArrowUp className="text-5xl text-[#8B0000] mb-4 mx-auto rotate-180" />
            <h2 className="text-2xl font-creepy mb-2">No Images Found</h2>
            <p className="text-zinc-400">The gallery awaits your cursed creations...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 w-full max-w-7xl">
            {galleryItems.map(item => (
              <div key={item.id} className="bg-[#1A1A1A] border border-[#8B0000] rounded-xl flex flex-col overflow-hidden shadow-lg min-h-[400px]">
                <div className="flex-1 flex items-center justify-center bg-zinc-800 min-h-[250px]">
                  {item.image_url ? (
                    <Image 
                      src={item.image_url} 
                      alt={item.title} 
                      width={400} 
                      height={250} 
                      className="object-cover w-full h-full" 
                      onError={(e) => {
                        // Handle image load error
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = `
                          <div class="flex flex-col items-center justify-center w-full h-full py-12">
                            <div class="text-5xl text-[#8B0000] mb-2">⚠</div>
                            <div class="w-10 h-10 bg-[#8B0000] rounded-full mb-2"></div>
                            <span class="text-[#F8F8FF]">Image Failed to Load</span>
                          </div>
                        `;
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center w-full h-full py-12">
                      <FaArrowUp className="text-5xl text-[#8B0000] mb-2 rotate-180" />
                      <div className="w-10 h-10 bg-[#8B0000] rounded-full mb-2" />
                      <span className="text-[#F8F8FF]">No Image</span>
                    </div>
                  )}
                </div>
                <div className="p-4 flex flex-col gap-2">
                  <h3 className="text-lg font-semibold text-[#F8F8FF] truncate">{item.title}</h3>
                  <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                    <span className="flex items-center gap-1">
                      <FaRegCalendarAlt /> {formatDate(item.date_uploaded)}
                    </span>
                    <span>{item.downloads} downloads</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-1">
                    {item.tags.map((tag, index) => (
                      <span key={index} className="bg-[#B2002D] text-xs px-2 py-0.5 rounded-full text-[#F8F8FF]">#{tag}</span>
                    ))}
                  </div>
                  <div className="text-sm">
                    <span className="text-zinc-400">by </span>
                    <span className="text-[#B2002D] font-semibold">{item.author}</span>
                  </div>
                  <SkullRating level={item.chill_level} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainContent>
  )
} 