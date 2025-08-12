// Hidden uploads folder backup system
import fs from 'fs';
import path from 'path';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
const METADATA_FILE = path.join(UPLOADS_DIR, '.metadata.json');

interface UploadMetadata {
  id: string;
  filename: string;
  originalName: string;
  title: string;
  author: string;
  tags: string[];
  chill_level: number;
  user_id: string;
  date_uploaded: string;
  size: number;
  mimeType: string;
}

// Ensure uploads directory exists
function ensureUploadsDir() {
  if (process.env.NODE_ENV !== 'development') {
    return false; // Only work in development
  }
  
  try {
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
      console.log('📁 Created uploads directory');
    }
    return true;
  } catch (error) {
    console.error('❌ Cannot create uploads directory:', error);
    return false;
  }
}

// Load metadata from file
function loadMetadata(): UploadMetadata[] {
  try {
    if (fs.existsSync(METADATA_FILE)) {
      const data = fs.readFileSync(METADATA_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('❌ Error loading metadata:', error);
  }
  return [];
}

// Save metadata to file
function saveMetadata(metadata: UploadMetadata[]) {
  try {
    fs.writeFileSync(METADATA_FILE, JSON.stringify(metadata, null, 2));
    console.log(`💾 Saved metadata for ${metadata.length} uploads`);
  } catch (error) {
    console.error('❌ Error saving metadata:', error);
  }
}

// Save image to uploads folder
export function saveImageToUploads(
  buffer: Buffer,
  originalFilename: string,
  metadata: {
    title: string;
    author: string;
    tags: string[];
    chill_level: number;
    user_id: string;
  }
): { success: boolean; id?: string; filename?: string; error?: string } {
  
  if (!ensureUploadsDir()) {
    return { success: false, error: 'Uploads directory not available' };
  }

  try {
    // Generate unique filename
    const timestamp = Date.now();
    const ext = path.extname(originalFilename) || '.jpg';
    const filename = `${timestamp}_${metadata.title.replace(/[^a-zA-Z0-9]/g, '_')}${ext}`;
    const filepath = path.join(UPLOADS_DIR, filename);
    
    // Save image file
    fs.writeFileSync(filepath, buffer);
    console.log(`💾 Saved image to uploads: ${filename}`);
    
    // Load existing metadata
    const allMetadata = loadMetadata();
    
    // Add new metadata
    const newMetadata: UploadMetadata = {
      id: timestamp.toString(),
      filename,
      originalName: originalFilename,
      title: metadata.title,
      author: metadata.author,
      tags: metadata.tags,
      chill_level: metadata.chill_level,
      user_id: metadata.user_id,
      date_uploaded: new Date().toISOString(),
      size: buffer.length,
      mimeType: getMimeType(ext)
    };
    
    allMetadata.unshift(newMetadata);
    
    // Keep only last 100 uploads
    if (allMetadata.length > 100) {
      // Delete old files
      const toDelete = allMetadata.slice(100);
      toDelete.forEach(item => {
        try {
          const oldFile = path.join(UPLOADS_DIR, item.filename);
          if (fs.existsSync(oldFile)) {
            fs.unlinkSync(oldFile);
            console.log(`🗑️ Deleted old upload: ${item.filename}`);
          }
        } catch (error) {
          console.error('❌ Error deleting old file:', error);
        }
      });
      
      allMetadata.splice(100);
    }
    
    // Save updated metadata
    saveMetadata(allMetadata);
    
    return {
      success: true,
      id: newMetadata.id,
      filename: filename
    };
    
  } catch (error: any) {
    console.error('❌ Error saving to uploads:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Get all images from uploads folder
export function getAllImagesFromUploads(): any[] {
  if (!ensureUploadsDir()) {
    return [];
  }

  try {
    const metadata = loadMetadata();
    
    return metadata.map(item => ({
      id: parseInt(item.id),
      title: item.title,
      image_url: `/uploads/${item.filename}`,
      date_uploaded: item.date_uploaded,
      downloads: 0,
      author: item.author,
      tags: [...item.tags, 'local-backup'],
      chill_level: item.chill_level,
      user_id: item.user_id,
      size: item.size,
      mimeType: item.mimeType,
      source: 'uploads-backup'
    }));
    
  } catch (error) {
    console.error('❌ Error loading from uploads:', error);
    return [];
  }
}

// Get upload statistics
export function getUploadsStats() {
  if (!ensureUploadsDir()) {
    return { totalUploads: 0, totalSize: 0 };
  }

  try {
    const metadata = loadMetadata();
    const totalSize = metadata.reduce((sum, item) => sum + item.size, 0);
    
    return {
      totalUploads: metadata.length,
      totalSize,
      totalSizeMB: Math.round(totalSize / (1024 * 1024) * 100) / 100,
      oldestUpload: metadata.length > 0 ? metadata[metadata.length - 1].date_uploaded : null,
      newestUpload: metadata.length > 0 ? metadata[0].date_uploaded : null
    };
  } catch (error) {
    console.error('❌ Error getting uploads stats:', error);
    return { totalUploads: 0, totalSize: 0 };
  }
}

// Clean up old uploads
export function cleanupOldUploads(maxAge: number = 30) {
  if (!ensureUploadsDir()) {
    return { cleaned: 0 };
  }

  try {
    const metadata = loadMetadata();
    const cutoffDate = new Date(Date.now() - maxAge * 24 * 60 * 60 * 1000);
    
    const toKeep = metadata.filter(item => new Date(item.date_uploaded) > cutoffDate);
    const toDelete = metadata.filter(item => new Date(item.date_uploaded) <= cutoffDate);
    
    // Delete old files
    toDelete.forEach(item => {
      try {
        const filepath = path.join(UPLOADS_DIR, item.filename);
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath);
          console.log(`🗑️ Cleaned up old upload: ${item.filename}`);
        }
      } catch (error) {
        console.error('❌ Error deleting file:', error);
      }
    });
    
    // Save updated metadata
    saveMetadata(toKeep);
    
    console.log(`🧹 Cleaned up ${toDelete.length} old uploads`);
    return { cleaned: toDelete.length };
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    return { cleaned: 0 };
  }
}

// Helper function to get MIME type
function getMimeType(ext: string): string {
  const mimeTypes: { [key: string]: string } = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp'
  };
  
  return mimeTypes[ext.toLowerCase()] || 'image/jpeg';
}