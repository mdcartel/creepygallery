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

  // Image compression function
  const compressImage = (file: File, maxWidth: number = 1920, maxHeight: number = 1080, quality: number = 0.8): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file); // Fallback to original if compression fails
            }
          },
          'image/jpeg',
          quality
        );
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

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

    // Compress image if it's too large or if it's from mobile
    let fileToUpload = file;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (file.size > 2 * 1024 * 1024 || isMobile) { // Compress if > 2MB or on mobile
      setMessage("Compressing image for optimal upload...");
      try {
        fileToUpload = await compressImage(file, 1920, 1080, 0.8);
        console.log(`Compressed from ${(file.size / 1024 / 1024).toFixed(2)}MB to ${(fileToUpload.size / 1024 / 1024).toFixed(2)}MB`);
      } catch (error) {
        console.error('Compression failed, using original:', error);
        fileToUpload = file;
      }
    }

    // Final size check after compression
    if (fileToUpload.size > 10 * 1024 * 1024) { // 10MB limit
      setMessage("Image is still too large after compression. Please try a smaller image.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("file", fileToUpload);
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
        
        // Trigger a gallery refresh by posting a message to parent window
        if (window.opener) {
          window.opener.postMessage('gallery-refresh', '*');
        }
        // Also trigger storage event for same-origin refresh
        window.localStorage.setItem('gallery-refresh', Date.now().toString());
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
        <div className="bg-black text-[#F8F8FF] flex flex-col items-center justify-center min-h-screen p-4">
          <div className="w-full max-w-md mb-6 text-center">
            <h1 className="font-creepy text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600 mb-2">
              UPLOAD NIGHTMARE
            </h1>
            <p className="text-gray-400 text-sm">
              Share your darkest visions with the world
            </p>
          </div>
          
          <form className="flex flex-col gap-6 w-full max-w-md bg-gray-900/30 p-6 rounded-2xl border border-red-900/30" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <label className="text-sm text-zinc-300 font-medium">Image Title *</label>
              <input
                type="text"
                placeholder="Give your cursed image a unique title..."
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="bg-[#222] p-3 rounded border border-zinc-600 focus:border-[#B2002D] focus:outline-none text-lg"
                required
              />
              <div className="text-xs text-zinc-500">
                This will be the name displayed in the gallery (not your device filename)
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-zinc-300">Select Image File</label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setFile(e.target.files?.[0] || null)}
                  className="bg-[#222] p-2 rounded border border-zinc-600 focus:border-[#B2002D] focus:outline-none w-full file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#B2002D] file:text-white hover:file:bg-[#8B0000]"
                  required
                />
              </div>
              {file && (
                <div className="flex items-center gap-2 text-xs text-green-400 bg-green-900/20 p-2 rounded border border-green-800">
                  <span>✅</span>
                  <span>Image selected ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
              )}
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
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-red-900/50 border border-red-500/30"
              disabled={loading}
            >
              {loading ? "🔮 Summoning..." : "💀 UNLEASH TO GALLERY"}
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
          
          <div className="mt-6 text-center text-xs text-gray-500 max-w-md">
            <p>💡 Your custom title will be displayed in the gallery, not your device filename</p>
            <p>🔒 Images are stored securely and permanently on our servers</p>
          </div>
        </div>
      </MainContent>
    </ProtectedRoute>
  );
}