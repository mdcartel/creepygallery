// Simple in-memory storage for demo mode
// Note: This will reset when the server restarts

interface StoredImage {
  id: number;
  title: string;
  image_url: string;
  date_uploaded: string;
  downloads: number;
  author: string;
  tags: string[];
  chill_level: number;
  user_id: string;
}

// In-memory storage
let galleryItems: StoredImage[] = [];

export function addGalleryItem(item: Omit<StoredImage, 'id'>): StoredImage {
  const newItem: StoredImage = {
    ...item,
    id: Date.now() + Math.random() // Ensure unique ID
  };
  
  galleryItems.unshift(newItem); // Add to beginning (newest first)
  
  // Keep only last 50 items to prevent memory issues
  if (galleryItems.length > 50) {
    galleryItems = galleryItems.slice(0, 50);
  }
  
  return newItem;
}

export function getAllGalleryItems(): StoredImage[] {
  return [...galleryItems]; // Return copy to prevent mutation
}

export function clearGalleryItems(): void {
  galleryItems = [];
}