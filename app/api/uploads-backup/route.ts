import { NextResponse } from 'next/server';
import { getAllImagesFromUploads, getUploadsStats } from '../../../lib/uploads-backup';

export async function GET() {
  // Only work in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({
      success: false,
      message: 'Uploads backup not available in production',
      stats: { totalUploads: 0, totalSize: 0 },
      images: []
    });
  }

  try {
    const images = getAllImagesFromUploads();
    const stats = getUploadsStats();
    
    return NextResponse.json({
      success: true,
      message: `Found ${images.length} images in uploads backup`,
      stats,
      images: images.map(img => ({
        id: img.id,
        title: img.title,
        author: img.author,
        date_uploaded: img.date_uploaded,
        size: img.size,
        tags: img.tags
      }))
    });
  } catch (error: any) {
    console.error('❌ Uploads backup API error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}