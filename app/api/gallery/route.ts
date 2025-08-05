import { NextRequest, NextResponse } from 'next/server';

// Temporary simple implementation for deployment
export async function GET() {
  // Return empty array for now - will be replaced with database call once DB is set up
  return NextResponse.json([]);
}

export async function POST(request: NextRequest) {
  try {
    // Parse multipart form data using Next.js built-in FormData
    const formData = await request.formData();
    
    // Extract form fields
    const title = formData.get('title') as string;
    const tags = formData.get('tags') as string;
    const chillLevel = parseInt(formData.get('chillLevel') as string || '1', 10);
    const file = formData.get('file') as File;

    // Validate required fields
    if (!title || !tags || !file) {
      return NextResponse.json(
        { error: 'Title, tags, and image file are required' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    // For now, just return success without actually storing
    // This will allow deployment to succeed
    return NextResponse.json({
      id: Date.now(),
      title,
      tags: tags.split(',').map(tag => tag.trim()),
      chillLevel,
      message: 'Upload functionality is being set up. Database integration coming soon!'
    }, { status: 201 });

  } catch (error) {
    console.error('Error processing upload:', error);
    return NextResponse.json(
      { error: 'Failed to process upload' },
      { status: 500 }
    );
  }
}