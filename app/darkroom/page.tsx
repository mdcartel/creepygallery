import React from 'react';
import MainContent from '../../components/main-content';

export default function DarkroomPage() {
  return (
    <MainContent>
      <div className="bg-black text-[#F8F8FF] flex flex-col items-center justify-center">
        <h1 className="text-4xl font-creepy mb-4">The Darkroom</h1>
        <p className="text-lg opacity-70">A forbidden zone, shrouded in mystery...</p>
      </div>
    </MainContent>
  );
} 