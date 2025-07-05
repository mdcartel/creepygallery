import React from 'react'
import { FaArrowUp, FaRegCalendarAlt } from 'react-icons/fa'
import { FaSkull } from 'react-icons/fa6'
import Image from 'next/image'
import MainContent from '../../components/main-content'

const galleryItems = [
  {
    id: 1,
    image: null,
    title: 'Image Not Found',
    date: '1/15/2024',
    downloads: 666,
    author: 'The Curator',
    tags: ['ritual', 'fog'],
    chill: 5,
  },
  {
    id: 2,
    image: null,
    title: 'Image Not Found',
    date: '1/14/2024',
    downloads: 432,
    author: 'Shadow Walker',
    tags: ['shadow', 'entity'],
    chill: 4,
  },
  {
    id: 3,
    image: '/placeholder.jpg',
    title: 'Witch Ritual',
    date: '1/13/2024',
    downloads: 789,
    author: 'Dark Mystic',
    tags: ['witch', 'candle'],
    chill: 5,
  },
  {
    id: 4,
    image: null,
    title: 'Image Not Found',
    date: '1/12/2024',
    downloads: 543,
    author: 'Night Wanderer',
    tags: ['dark', 'unknown'],
    chill: 4,
  },
]

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
  return (
    <MainContent>
      <div className="flex flex-col items-center w-full bg-black text-[#F8F8FF] px-8 pb-12">
        <h1 className="font-creepy text-5xl mt-8 mb-2 text-center">GALLERY OF SHADOWS</h1>
        <p className="text-zinc-300 text-lg mb-10 text-center max-w-2xl">
          Explore the darkest corners of imagination. Each image tells a story of fear, mystery, and the supernatural.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 w-full max-w-7xl">
          {galleryItems.map(item => (
            <div key={item.id} className="bg-[#1A1A1A] border border-[#8B0000] rounded-xl flex flex-col overflow-hidden shadow-lg min-h-[400px]">
              <div className="flex-1 flex items-center justify-center bg-zinc-800 min-h-[250px]">
                {item.image ? (
                  <Image src={item.image} alt={item.title} width={400} height={250} className="object-cover w-full h-full" />
                ) : (
                  <div className="flex flex-col items-center justify-center w-full h-full py-12">
                    <FaArrowUp className="text-5xl text-[#8B0000] mb-2 rotate-180" />
                    <div className="w-10 h-10 bg-[#8B0000] rounded-full mb-2" />
                    <span className="text-[#F8F8FF]">Image Not Found</span>
                  </div>
                )}
              </div>
              <div className="p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                  <span className="flex items-center gap-1"><FaRegCalendarAlt /> {item.date}</span>
                  <span>{item.downloads} downloads</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-1">
                  {item.tags.map(tag => (
                    <span key={tag} className="bg-[#B2002D] text-xs px-2 py-0.5 rounded-full text-[#F8F8FF]">#{tag}</span>
                  ))}
                </div>
                <div className="text-sm">
                  <span className="text-zinc-400">by </span>
                  <span className="text-[#B2002D] font-semibold">{item.author}</span>
                </div>
                <SkullRating level={item.chill} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainContent>
  )
} 