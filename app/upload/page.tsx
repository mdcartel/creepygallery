import React from 'react';
import MainContent from '../../components/main-content';
import ProtectedRoute from '../../components/protected-route';

export default function UploadPage() {
  return (
    <ProtectedRoute>
      <MainContent>
        <div className="bg-black text-[#F8F8FF] flex flex-col items-center justify-center">
          <h1 className="text-4xl font-creepy mb-4">Upload Portal</h1>
          <p className="text-lg opacity-70">Summon your most cursed images here...</p>
        </div>
      </MainContent>
    </ProtectedRoute>
  );
} 