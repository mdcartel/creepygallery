import { NextResponse } from 'next/server';
import { getAllImagesFromImageKit } from '../../../lib/imagekit';

export async function GET() {
  try {
    console.log('🔄 Manual ImageKit recovery triggered...');
    const items = await getAllImagesFromImageKit();
    
    return NextResponse.json({
      success: true,
      message: `Found ${items.length} images in ImageKit`,
      items: items.map(item => ({
        id: item.id,
        title: item.title,
        image_url: item.image_url,
        imagekit_file_id: item.imagekit_file_id,
        date_uploaded: item.date_uploaded,
        width: item.width,
        height: item.height,
        size_kb: Math.round(item.size / 1024)
      }))
    });
  } catch (error: any) {
    console.error('❌ ImageKit recovery API error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}