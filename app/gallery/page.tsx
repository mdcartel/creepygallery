'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function GalleryPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home page since gallery is now on the homepage
    router.replace('/');
  }, [router]);

  return (
    <div className="min-h-screen bg-black text-[#F8F8FF] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B2002D] mb-4 mx-auto"></div>
        <p className="text-zinc-400">Redirecting to gallery...</p>
      </div>
    </div>
  );
} 