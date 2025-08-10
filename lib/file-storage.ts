// Simple file-based storage for persistence
// Only import fs in development
let fs: any = null;
let path: any = null;

if (process.env.NODE_ENV === 'development') {
  try {
    fs = require('fs');
    path = require('path');
  } catch (error) {
    console.log('File system not available in production');
  }
}

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

// Ensure data directory exists (development only)
function ensureDataDir() {
  if (!fs || !path || process.env.NODE_ENV !== 'development') {
    return;
  }
  
  try {
    const dataDir = path.dirname(STORAGE_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  } catch (error) {
    console.log('❌ Cannot create data directory in production');
  }
}

export function saveGalleryItems(items: StoredImage[]): void {
  if (!fs || !path || process.env.NODE_ENV !== 'development') {
    console.log('💾 File storage save skipped (production environment)');
    return;
  }
  
  try {
    ensureDataDir();
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(items, null, 2));
    console.log(`💾 Saved ${items.length} items to file storage`);
  } catch (error) {
    console.error('❌ Error saving to file storage:', error);
  }
}

export function loadGalleryItems(): StoredImage[] {
  if (!fs || !path || process.env.NODE_ENV !== 'development') {
    console.log('📁 File storage not available in production');
    return [];
  }
  
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