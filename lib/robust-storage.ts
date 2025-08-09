import fs from 'fs';
import path from 'path';
import { uploadImageToImageKit } from './imagekit';
import { createGalleryItem } from './gallery';
import { addGalleryItem } from './memory-storage';
import { addGalleryItemToFile } from './file-storage';

interface GalleryItem {
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
}

// Create permanent backup directory
const BACKUP_DIR = path.join(process.cwd(), 'permanent-backups');

function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
}

// Save individual photo as separate file for maximum safety
function savePhotoBackup(item: GalleryItem, id: string | number): void {
  try {
    ensureBackupDir();
    const filename = `photo_${id}_${Date.now()}.json`;
    const filepath = path.join(BACKUP_DIR, filename);
    
    const backupData = {
      ...item,
      id,
      backup_timestamp: new Date().toISOString(),
      backup_type: 'individual_photo'
    };
    
    fs.writeFileSync(filepath, JSON.stringify(backupData, null, 2));
    console.log(`💾 Individual photo backup saved: ${filename}`);
  } catch (error) {
    console.error('❌ Failed to save individual photo backup:', error);
  }
}

// Save master backup file
function saveMasterBackup(items: any[]): void {
  try {
    ensureBackupDir();
    const filename = `master_backup_${Date.now()}.json`;
    const filepath = path.join(BACKUP_DIR, filename);
    
    const backupData = {
      timestamp: new Date().toISOString(),
      total_items: items.length,
      items: items,
      backup_type: 'master_backup'
    };
    
    fs.writeFileSync(filepath, JSON.stringify(backupData, null, 2));
    console.log(`💾 Master backup saved: ${filename}`);
  } catch (error) {
    console.error('❌ Failed to save master backup:', error);
  }
}

export async function saveToAllStorageSystems(
  buffer: Buffer,
  filename: string,
  item: Omit<GalleryItem, 'image_url'>
): Promise<{ success: boolean; results: StorageResult[]; finalItem: any }> {
  
  const results: StorageResult[] = [];
  let finalImageUrl = '';
  let finalItem: any = null;

  console.log('🔄 Starting robust multi-storage save process...');

  // 1. Try ImageKit first (best option)
  try {
    console.log('📸 Attempting ImageKit upload...');
    const uploadResult = await uploadImageToImageKit(buffer, filename);
    finalImageUrl = uploadResult.url;
    results.push({
      success: true,
      location: 'ImageKit',
      id: uploadResult.fileId
    });
    console.log('✅ ImageKit upload successful');
  } catch (error: any) {
    console.error('❌ ImageKit upload failed:', error.message);
    results.push({
      success: false,
      location: 'ImageKit',
      error: error.message
    });
    
    // Fallback to base64
    if (buffer.length <= 2000000) { // 2MB limit
      const base64 = buffer.toString('base64');
      const mimeType = filename.includes('.png') ? 'image/png' : 
                      filename.includes('.jpg') || filename.includes('.jpeg') ? 'image/jpeg' :
                      filename.includes('.gif') ? 'image/gif' : 'image/webp';
      finalImageUrl = `data:${mimeType};base64,${base64}`;
      console.log('💾 Using base64 fallback');
    } else {
      throw new Error('Image too large for base64 storage');
    }
  }

  const fullItem: GalleryItem = {
    ...item,
    image_url: finalImageUrl
  };

  // 2. Try database storage
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
    console.log('✅ Database save successful');
    
    // Save individual backup
    savePhotoBackup(fullItem, dbItem.id);
    
  } catch (error: any) {
    console.error('❌ Database save failed:', error.message);
    results.push({
      success: false,
      location: 'Database',
      error: error.message
    });
  }

  // 3. File storage (always do this as backup)
  try {
    console.log('📁 Saving to file storage...');
    const fileItem = addGalleryItemToFile(fullItem);
    results.push({
      success: true,
      location: 'File Storage',
      id: fileItem.id
    });
    if (!finalItem) finalItem = fileItem;
    console.log('✅ File storage save successful');
    
    // Save individual backup
    savePhotoBackup(fullItem, fileItem.id);
    
  } catch (error: any) {
    console.error('❌ File storage save failed:', error.message);
    results.push({
      success: false,
      location: 'File Storage',
      error: error.message
    });
  }

  // 4. Memory storage (always do this as backup)
  try {
    console.log('💾 Saving to memory storage...');
    const memoryItem = addGalleryItem(fullItem);
    results.push({
      success: true,
      location: 'Memory Storage',
      id: memoryItem.id
    });
    if (!finalItem) finalItem = memoryItem;
    console.log('✅ Memory storage save successful');
    
    // Save individual backup
    savePhotoBackup(fullItem, memoryItem.id);
    
  } catch (error: any) {
    console.error('❌ Memory storage save failed:', error.message);
    results.push({
      success: false,
      location: 'Memory Storage',
      error: error.message
    });
  }

  // 5. Always save permanent backup files
  try {
    ensureBackupDir();
    
    // Save as individual JSON file
    const timestamp = Date.now();
    const individualFile = path.join(BACKUP_DIR, `upload_${timestamp}.json`);
    fs.writeFileSync(individualFile, JSON.stringify({
      ...fullItem,
      upload_timestamp: new Date().toISOString(),
      storage_results: results
    }, null, 2));
    
    // Also save the raw image data
    const imageFile = path.join(BACKUP_DIR, `image_${timestamp}.dat`);
    fs.writeFileSync(imageFile, buffer);
    
    console.log('💾 Permanent backup files created');
    results.push({
      success: true,
      location: 'Permanent Backup Files',
      id: timestamp
    });
    
  } catch (error: any) {
    console.error('❌ Permanent backup failed:', error.message);
    results.push({
      success: false,
      location: 'Permanent Backup Files',
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

  return {
    success: successCount > 0,
    results,
    finalItem: finalItem || fullItem
  };
}

// Recovery function to load from all backup sources
export function recoverFromBackups(): GalleryItem[] {
  const recoveredItems: GalleryItem[] = [];
  
  try {
    ensureBackupDir();
    
    if (fs.existsSync(BACKUP_DIR)) {
      const files = fs.readdirSync(BACKUP_DIR);
      
      files.forEach(file => {
        if (file.endsWith('.json') && (file.startsWith('photo_') || file.startsWith('upload_'))) {
          try {
            const filepath = path.join(BACKUP_DIR, file);
            const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
            
            if (data.title && data.image_url) {
              recoveredItems.push(data);
              console.log(`📸 Recovered photo: ${data.title}`);
            }
          } catch (error) {
            console.error(`❌ Error reading backup file ${file}:`, error);
          }
        }
      });
    }
  } catch (error) {
    console.error('❌ Error during backup recovery:', error);
  }
  
  console.log(`📊 Recovered ${recoveredItems.length} photos from backups`);
  return recoveredItems;
}