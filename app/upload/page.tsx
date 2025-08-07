"use client";
import React from 'react';
import MainContent from '../../components/main-content';
import ProtectedRoute from '../../components/protected-route';
import { useAuth } from '../../lib/auth-context';

export default function UploadPage() {
  const { user } = useAuth();
  const [file, setFile] = React.useState<File | null>(null);
  const [title, setTitle] = React.useState("");
  const [tags, setTags] = React.useState("");
  const [chillLevel, setChillLevel] = React.useState(1);
  const [message, setMessage] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setMessage("Please select an image file.");
      return;
    }
    setLoading(true);
    setMessage("");
    
    // Get auth token from localStorage
    const token = localStorage.getItem('auth-token');
    if (!token || !user) {
      setMessage("You must be logged in to upload images.");
      setLoading(false);
      return;
    }

    // Basic file validation
    if (!file.type.startsWith('image/')) {
      setMessage("Please select a valid image file.");
      setLoading(false);
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setMessage("File size must be less than 10MB.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("tags", tags);
    formData.append("chillLevel", chillLevel.toString());

    try {
      const res = await fetch("/api/gallery", {
        method: "POST",
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      let data = null;
      try {
        data = await res.json();
      } catch (jsonErr) {
        setMessage(`Server returned non-JSON response. Status: ${res.status}`);
        setLoading(false);
        return;
      }
      if (res.ok) {
        setMessage("🎃 Image uploaded successfully! Your cursed creation is now live in the gallery.");
        // Reset form
        setFile(null);
        setTitle("");
        setTags("");
        setChillLevel(1);
        // Reset file input
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        setMessage(data?.error ? `Error: ${data.error}` : `Upload failed. Status: ${res.status}`);
      }
    } catch (err: any) {
      setMessage(`An error occurred during upload: ${err?.message || err}`);
    }
    setLoading(false);
  };

  return (
    <ProtectedRoute>
      <MainContent>
        <div className="bg-black text-[#F8F8FF] flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-4xl font-creepy mb-4">Upload Portal</h1>
          <p className="text-lg opacity-70 mb-6">Summon your most cursed images here...</p>
          <form className="flex flex-col gap-4 w-full max-w-md" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <label className="text-sm text-zinc-300">Select Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={e => setFile(e.target.files?.[0] || null)}
                className="bg-[#222] p-2 rounded border border-zinc-600 focus:border-[#B2002D] focus:outline-none"
                required
              />
              {file && (
                <div className="text-xs text-zinc-400">
                  Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </div>
              )}
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm text-zinc-300">Title</label>
              <input
                type="text"
                placeholder="Give your cursed image a title..."
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="bg-[#222] p-2 rounded border border-zinc-600 focus:border-[#B2002D] focus:outline-none"
                required
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm text-zinc-300">Tags</label>
              <input
                type="text"
                placeholder="horror, dark, creepy (comma separated)"
                value={tags}
                onChange={e => setTags(e.target.value)}
                className="bg-[#222] p-2 rounded border border-zinc-600 focus:border-[#B2002D] focus:outline-none"
                required
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm text-zinc-300">Chill Level: {chillLevel}/10</label>
              <input
                type="range"
                min={1}
                max={10}
                value={chillLevel}
                onChange={e => setChillLevel(Number(e.target.value))}
                className="accent-[#B2002D]"
              />
              <div className="text-xs text-zinc-400">
                {chillLevel <= 3 && "Mildly unsettling"}
                {chillLevel > 3 && chillLevel <= 6 && "Genuinely creepy"}
                {chillLevel > 6 && chillLevel <= 8 && "Nightmare fuel"}
                {chillLevel > 8 && "Absolutely terrifying"}
              </div>
            </div>
            
            <button
              type="submit"
              className="bg-[#B2002D] hover:bg-[#8B0000] text-[#F8F8FF] font-bold py-3 px-4 rounded transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Summoning..." : "Upload to Gallery"}
            </button>
            
            {message && (
              <div className={`text-center mt-2 p-3 rounded-lg ${
                message.includes('successfully') 
                  ? 'bg-green-900/20 text-green-400 border border-green-800' 
                  : 'bg-red-900/20 text-red-400 border border-red-800'
              }`}>
                {message}
                {message.includes('successfully') && (
                  <div className="mt-2">
                    <a href="/" className="text-green-300 hover:text-green-200 underline text-sm">
                      View in gallery →
                    </a>
                  </div>
                )}
              </div>
            )}
          </form>
        </div>
      </MainContent>
    </ProtectedRoute>
  );
}