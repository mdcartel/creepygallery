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

// In-memory storage - starts with sample data
let galleryItems: StoredImage[] = [
  {
    id: 1,
    title: "Midnight Shadows",
    image_url: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=400&fit=crop&crop=center",
    date_uploaded: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    downloads: 15,
    author: "ShadowWalker",
    tags: ["dark", "mysterious", "night"],
    chill_level: 4,
    user_id: "demo-user-1"
  },
  {
    id: 2,
    title: "Haunted Forest",
    image_url: "https://images.unsplash.com/photo-1520637836862-4d197d17c90a?w=400&h=400&fit=crop&crop=center",
    date_uploaded: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    downloads: 23,
    author: "GhostHunter",
    tags: ["forest", "spooky", "trees"],
    chill_level: 3,
    user_id: "demo-user-2"
  },
  {
    id: 3,
    title: "Abandoned Manor",
    image_url: "https://images.unsplash.com/photo-1520637836862-4d197d17c90a?w=400&h=400&fit=crop&crop=center",
    date_uploaded: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    downloads: 31,
    author: "DarkExplorer",
    tags: ["abandoned", "gothic", "architecture"],
    chill_level: 5,
    user_id: "demo-user-3"
  },
  {
    id: 4,
    title: "Misty Graveyard",
    image_url: "https://images.unsplash.com/photo-1509909756405-be0199881695?w=400&h=400&fit=crop&crop=center",
    date_uploaded: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
    downloads: 18,
    author: "NightCrawler",
    tags: ["graveyard", "mist", "cemetery"],
    chill_level: 4,
    user_id: "demo-user-4"
  }
];

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