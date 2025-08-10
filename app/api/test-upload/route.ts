import { NextResponse } from 'next/server';
import { addGalleryItem } from '../../../lib/memory-storage';
// Import file storage conditionally
let fileStorage: any = null;
if (process.env.NODE_ENV === 'development') {
  try {
    fileStorage = require('../../../lib/file-storage');
  } catch (error) {
    console.log('File storage not available');
  }
}
import { createGalleryItem } from '../../../lib/gallery';

export async function POST() {
  const testData = {
    title: 'Debug Test Image',
    image_url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77yQAAAABJRU5ErkJggg==',
    date_uploaded: new Date().toISOString(),
    downloads: 0,
    author: 'Debug User',
    tags: ['debug', 'test'],
    chill_level: 1,
    user_id: 'debug-user'
  };

  const results: any = {
    memory: null,
    file: null,
    database: null
  };

  // Test memory storage
  try {
    const memoryItem = addGalleryItem(testData);
    results.memory = { success: true, id: memoryItem.id };
  } catch (error: any) {
    results.memory = { success: false, error: error.message };
  }

  // Test file storage (development only)
  if (fileStorage && process.env.NODE_ENV === 'development') {
    try {
      const fileItem = fileStorage.addGalleryItemToFile(testData);
      results.file = { success: true, id: fileItem.id };
    } catch (error: any) {
      results.file = { success: false, error: error.message };
    }
  } else {
    results.file = { success: false, error: 'File storage not available in production' };
  }

  // Test database storage
  try {
    const dbItem = await createGalleryItem(
      testData.title,
      testData.image_url,
      testData.author,
      testData.tags,
      testData.chill_level,
      testData.user_id
    );
    results.database = { success: true, id: dbItem.id };
  } catch (error: any) {
    results.database = { success: false, error: error.message };
  }

  return NextResponse.json({
    message: 'Test upload completed',
    results,
    testData: {
      title: testData.title,
      author: testData.author,
      hasImage: !!testData.image_url
    }
  });
}