import { NextResponse } from 'next/server';
import { addGalleryItem } from '../../../lib/memory-storage';
import { addGalleryItemToFile } from '../../../lib/file-storage';
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

  const results = {
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

  // Test file storage
  try {
    const fileItem = addGalleryItemToFile(testData);
    results.file = { success: true, id: fileItem.id };
  } catch (error: any) {
    results.file = { success: false, error: error.message };
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