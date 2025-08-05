"use client";
import React from 'react';
import MainContent from '../../components/main-content';
import ProtectedRoute from '../../components/protected-route';

export default function UploadPage() {
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
          // Authorization header if needed
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
        setMessage("Image uploaded successfully!");
        setFile(null);
        setTitle("");
        setTags("");
        setChillLevel(1);
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
            <input
              type="file"
              accept="image/*"
              onChange={e => setFile(e.target.files?.[0] || null)}
              className="bg-[#222] p-2 rounded"
              required
            />
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="bg-[#222] p-2 rounded"
              required
            />
            <input
              type="text"
              placeholder="Tags (comma separated)"
              value={tags}
              onChange={e => setTags(e.target.value)}
              className="bg-[#222] p-2 rounded"
            />
            <label className="flex flex-col">
              Chill Level
              <input
                type="range"
                min={1}
                max={10}
                value={chillLevel}
                onChange={e => setChillLevel(Number(e.target.value))}
                className="accent-pink-500"
              />
              <span>{chillLevel}</span>
            </label>
            <button
              type="submit"
              className="bg-pink-700 hover:bg-pink-800 text-white font-bold py-2 px-4 rounded"
              disabled={loading}
            >
              {loading ? "Uploading..." : "Upload Image"}
            </button>
            {message && <div className="text-center mt-2">{message}</div>}
          </form>
        </div>
      </MainContent>
    </ProtectedRoute>
  );
}