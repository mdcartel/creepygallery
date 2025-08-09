import { NextResponse } from 'next/server';
import { getAllGalleryItems, addGalleryItem } from '../../../lib/memory-storage';

export async function GET() {
  const items = getAllGalleryItems();
  return NextResponse.json({
    success: true,
    count: items.length,
    items: items.map(item => ({
      id: item.id,
      title: item.title,
      author: item.author,
      hasImage: !!item.image_url
    }))
  });
}

export async function POST() {
  // Add a test item
  const testItem = addGalleryItem({
    title: 'Test Item',
    image_url: 'data:image/png;base64,test',
    date_uploaded: new Date().toISOString(),
    downloads: 0,
    author: 'Test User',
    tags: ['test'],
    chill_level: 1,
    user_id: 'test-user'
  });
  
  return NextResponse.json({
    success: true,
    message: 'Test item added',
    item: testItem
  });
}