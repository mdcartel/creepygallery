import { NextResponse } from 'next/server';
import { getAllGalleryItems } from '../../../lib/gallery';
import { getAllGalleryItems as getMemoryItems } from '../../../lib/memory-storage';
import { loadGalleryItems as getFileItems } from '../../../lib/file-storage';
import { getDatabaseStatus } from '../../../lib/db';

export async function GET() {
  const debug = {
    timestamp: new Date().toISOString(),
    sources: {
      database: { items: 0, error: null },
      memory: { items: 0 },
      file: { items: 0 },
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
    debug.sources.memory = { items: 0, error: error.message };
  }

  // Check file items
  try {
    const fileItems = getFileItems();
    debug.sources.file.items = fileItems.length;
  } catch (error: any) {
    debug.sources.file = { items: 0, error: error.message };
  }

  return NextResponse.json(debug);
}