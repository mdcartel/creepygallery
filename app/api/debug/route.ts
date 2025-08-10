import { NextResponse } from 'next/server';
import { getAllGalleryItems } from '../../../lib/gallery';
import { getAllGalleryItems as getMemoryItems } from '../../../lib/memory-storage';
// Import file storage conditionally
let fileStorage: any = null;
if (process.env.NODE_ENV === 'development') {
  try {
    fileStorage = require('../../../lib/file-storage');
  } catch (error) {
    console.log('File storage not available');
  }
}
import { getDatabaseStatus } from '../../../lib/db';

export async function GET() {
  const debug: any = {
    timestamp: new Date().toISOString(),
    sources: {
      database: { items: 0, error: null },
      memory: { items: 0, error: null },
      file: { items: 0, error: null },
      databaseStatus: null
    }
  };

  // Check database status
  try {
    debug.sources.databaseStatus = getDatabaseStatus();
  } catch (error: any) {
    debug.sources.databaseStatus = { error: error.message };
  }

  // Check database items
  try {
    const dbItems = await getAllGalleryItems();
    debug.sources.database.items = dbItems.length;
  } catch (error: any) {
    debug.sources.database.error = error.message;
  }

  // Check memory items
  try {
    const memoryItems = getMemoryItems();
    debug.sources.memory.items = memoryItems.length;
  } catch (error: any) {
    debug.sources.memory.error = error.message;
  }

  // Check file items (development only)
  if (fileStorage && process.env.NODE_ENV === 'development') {
    try {
      const fileItems = fileStorage.loadGalleryItems();
      debug.sources.file.items = fileItems.length;
    } catch (error: any) {
      debug.sources.file.error = error.message;
    }
  } else {
    debug.sources.file.error = 'File storage not available in production';
  }

  return NextResponse.json(debug);
}