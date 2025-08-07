import { NextRequest, NextResponse } from 'next/server';
import { sqlQuery } from '../../../../lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid image ID' }, { status: 400 });
    }

    // Get the image details from database
    const result = await sqlQuery`
      SELECT id, title, image_url, downloads 
      FROM gallery_items 
      WHERE id = ${id}
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    const item = result[0];
    
    if (!item.image_url) {
      return NextResponse.json({ error: 'Image file not available' }, { status: 404 });
    }

    // Increment download count
    await sqlQuery`
      UPDATE gallery_items 
      SET downloads = downloads + 1 
      WHERE id = ${id}
    `;

    // Fetch the image from Cloudinary
    const imageResponse = await fetch(item.image_url);
    
    if (!imageResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: 500 });
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    
    // Create filename from title
    const filename = `${item.title.replace(/[^a-zA-Z0-9]/g, '_')}.jpg`;

    // Return the image with proper headers for download
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': imageBuffer.byteLength.toString(),
      },
    });

  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}