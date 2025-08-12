// Persistent storage that works in both development and production
import { uploadImageToImageKit } from './imagekit';
import { createGalleryItem } from './gallery';
import { addGalleryItem } from './memory-storage';
// Import uploads backup conditionally
let uploadsBackup: any = null;
if (process.env.NODE_ENV === 'development') {
  try {
    uploadsBackup = require('./uploads-backup');
  } catch (error) {
    console.log('Uploads backup not available');
  }
}

interface GalleryItem {
  id?: number | string;
  title: string;
  image_url: string;
  date_uploaded: string;
  downloads: number;
  author: string;
  tags: string[];
  chill_level: number;
  user_id: string;
}

interface StorageResult {
  success: boolean;
  location: string;
  id?: string | number;
  error?: string;
  url?: string;
}

export async function saveImagePermanently(
  buffer: Buffer,
  filename: string,
  metadata: Omit<GalleryItem, 'id' | 'image_url'>
): Promise<{ success: boolean; results: StorageResult[]; finalItem: any }> {
  
  const results: StorageResult[] = [];
  let finalImageUrl = '';
  let finalItem: any = null;

  console.log('🔄 Starting bulletproof image save process...');

  // Step 1: Upload to ImageKit (PRIMARY STORAGE)
  try {
    console.log('📸 Uploading to ImageKit...');
    const uploadResult = await uploadImageToImageKit(buffer, filename);
    finalImageUrl = uploadResult.url;
    
    results.push({
      success: true,
      location: 'ImageKit',
      id: uploadResult.fileId,
      url: uploadResult.url
    });
    
    console.log('✅ ImageKit upload successful:', uploadResult.fileId);
    console.log('🔗 Image URL:', uploadResult.url);
    
  } catch (error: any) {
    console.error('❌ ImageKit upload failed:', error.message);
    results.push({
      success: false,
      location: 'ImageKit',
      error: error.message
    });
    
    // Fallback to base64 if ImageKit fails
    if (buffer.length <= 2000000) { // 2MB limit
      const base64 = buffer.toString('base64');
      const mimeType = filename.includes('.png') ? 'image/png' : 
                      filename.includes('.jpg') || filename.includes('.jpeg') ? 'image/jpeg' :
                      filename.includes('.gif') ? 'image/gif' : 'image/webp';
      finalImageUrl = `data:${mimeType};base64,${base64}`;
      console.log('💾 Using base64 fallback');
    } else {
      throw new Error('Image too large and ImageKit failed');
    }
  }

  // Create full item with image URL
  const fullItem: GalleryItem = {
    ...metadata,
    image_url: finalImageUrl
  };

  // Step 2: Save to Database (if available)
  try {
    console.log('🗄️ Attempting database save...');
    const dbItem = await createGalleryItem(
      fullItem.title,
      fullItem.image_url,
      fullItem.author,
      fullItem.tags,
      fullItem.chill_level,
      fullItem.user_id
    );
    
    results.push({
      success: true,
      location: 'Database',
      id: dbItem.id
    });
    
    finalItem = dbItem;
    console.log('✅ Database save successful:', dbItem.id);
    
  } catch (error: any) {
    console.error('❌ Database save failed:', error.message);
    results.push({
      success: false,
      location: 'Database',
      error: error.message
    });
  }

  // Step 3: ALWAYS save to Memory Storage (immediate backup)
  try {
    console.log('💾 Saving to memory storage...');
    const memoryItem = addGalleryItem(fullItem);
    
    results.push({
      success: true,
      location: 'Memory Storage',
      id: memoryItem.id
    });
    
    if (!finalItem) finalItem = memoryItem;
    console.log('✅ Memory storage save successful:', memoryItem.id);
    
  } catch (error: any) {
    console.error('❌ Memory storage save failed:', error.message);
    results.push({
      success: false,
      location: 'Memory Storage',
      error: error.message
    });
  }

  // Step 4: Save to hidden uploads folder (development only)
  if (uploadsBackup && process.env.NODE_ENV === 'development') {
    try {
      const uploadsResult = uploadsBackup.saveImageToUploads(buffer, filename, {
        title: fullItem.title,
        author: fullItem.author,
        tags: fullItem.tags,
        chill_level: fullItem.chill_level,
        user_id: fullItem.user_id
      });
      
      if (uploadsResult.success) {
        console.log('✅ Saved to uploads folder:', uploadsResult.filename);
        results.push({
          success: true,
          location: 'Uploads Folder',
          id: uploadsResult.id
        });
      } else {
        results.push({
          success: false,
          location: 'Uploads Folder',
          error: uploadsResult.error
        });
      }
    } catch (error: any) {
      console.error('❌ Uploads folder save failed:', error.message);
      results.push({
        success: false,
        location: 'Uploads Folder',
        error: error.message
      });
    }
  } else {
    console.log('📁 Uploads folder backup skipped (production environment)');
  }

  // Step 5: Save to localStorage (browser-side persistence)
  try {
    if (typeof window !== 'undefined') {
      const existingItems = JSON.parse(localStorage.getItem('gallery-backup') || '[]');
      existingItems.unshift(fullItem);
      
      // Keep only last 50 items
      if (existingItems.length > 50) {
        existingItems.splice(50);
      }
      
      localStorage.setItem('gallery-backup', JSON.stringify(existingItems));
      console.log('✅ Saved to localStorage backup');
      
      results.push({
        success: true,
        location: 'LocalStorage Backup',
        id: 'browser-storage'
      });
    }
  } catch (error: any) {
    console.error('❌ LocalStorage save failed:', error.message);
    results.push({
      success: false,
      location: 'LocalStorage Backup',
      error: error.message
    });
  }

  const successCount = results.filter(r => r.success).length;
  const totalAttempts = results.length;
  
  console.log(`📊 Storage results: ${successCount}/${totalAttempts} successful`);
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.location}: ${result.success ? 'Success' : result.error}`);
  });

  // Success if at least ImageKit OR Database worked
  const criticalSuccess = results.some(r => 
    (r.location === 'ImageKit' || r.location === 'Database') && r.success
  );

  return {
    success: criticalSuccess || successCount > 0,
    results,
    finalItem: finalItem || fullItem
  };
}

// Recovery function to get images from all sources
export async function recoverAllImages(): Promise<GalleryItem[]> {
  const allImages: GalleryItem[] = [];
  
  // Try ImageKit first
  try {
    const { getAllImagesFromImageKit } = await import('./imagekit');
    const imagekitItems = await getAllImagesFromImageKit();
    allImages.push(...imagekitItems);
    console.log(`📸 Recovered ${imagekitItems.length} images from ImageKit`);
  } catch (error) {
    console.error('❌ ImageKit recovery failed:', error);
  }
  
  // Try uploads folder (development only)
  if (uploadsBackup && process.env.NODE_ENV === 'development') {
    try {
      const uploadsItems = uploadsBackup.getAllImagesFromUploads();
      allImages.push(...uploadsItems);
      console.log(`📁 Recovered ${uploadsItems.length} images from uploads folder`);
    } catch (error) {
      console.error('❌ Uploads folder recovery failed:', error);
    }
  }
  
  // Try localStorage
  try {
    if (typeof window !== 'undefined') {
      const localItems = JSON.parse(localStorage.getItem('gallery-backup') || '[]');
      allImages.push(...localItems);
      console.log(`💾 Recovered ${localItems.length} images from localStorage`);
    }
  } catch (error) {
    console.error('❌ LocalStorage recovery failed:', error);
  }
  
  // Remove duplicates based on title and author
  const uniqueImages = allImages.filter((item, index, self) => 
    index === self.findIndex(i => i.title === item.title && i.author === item.author)
  );
  
  console.log(`📊 Total unique images recovered: ${uniqueImages.length}`);
  return uniqueImages;
}