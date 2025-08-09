import { NextResponse } from 'next/server';
import { getAllImagesFromCloudinary } from '../../../lib/cloudinary';

export async function GET() {
  try {
    console.log('🔄 Manual Cloudinary recovery triggered...');
    const items = await getAllImagesFromCloudinary();
    
    return NextResponse.json({
      success: true,
      message: `Found ${items.length} images in Cloudinary`,
      items: items.map(item => ({
        id: item.id,
        title: item.title,
        image_url: item.image_url,
        cloudinary_public_id: item.cloudinary_public_id,
        date_uploaded: item.date_uploaded,
        width: item.width,
        height: item.height,
        format: item.format,
        size_kb: Math.round(item.bytes / 1024)
      }))
    });
  } catch (error: any) {
    console.error('❌ Cloudinary recovery API error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}