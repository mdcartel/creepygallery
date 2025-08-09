// Simple file-based storage for persistence
import fs from 'fs';
import path from 'path';

const STORAGE_FILE = path.join(process.cwd(), 'data', 'gallery-items.json');

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

// Ensure data directory exists
function ensureDataDir() {
  const dataDir = path.dirname(STORAGE_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

export function saveGalleryItems(items: StoredImage[]): void {
  try {
    ensureDataDir();
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(items, null, 2));
    console.log(`💾 Saved ${items.length} items to file storage`);
  } catch (error) {
    console.error('❌ Error saving to file storage:', error);
  }
}

export function loadGalleryItems(): StoredImage[] {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const data = fs.readFileSync(STORAGE_FILE, 'utf8');
      const items = JSON.parse(data);
      console.log(`📁 Loaded ${items.length} items from file storage`);
      return items;
    }
  } catch (error) {
    console.error('❌ Error loading from file storage:', error);
  }
  return [];
}

export function addGalleryItemToFile(item: Omit<StoredImage, 'id'>): StoredImage {
  const items = loadGalleryItems();
  const newItem: StoredImage = {
    ...item,
    id: Date.now() + Math.random()
  };
  
  items.unshift(newItem);
  
  // Keep only last 100 items
  if (items.length > 100) {
    items.splice(100);
  }
  
  saveGalleryItems(items);
  return newItem;
}