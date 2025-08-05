import { NextRequest, NextResponse } from 'next/server';
import { getAllGalleryItems, createGalleryItem } from '../../../lib/gallery';
import { verifyToken } from '../../../lib/auth';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const items = await getAllGalleryItems();
    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching gallery items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gallery items' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse multipart form data using Next.js built-in FormData
    const formData = await request.formData();
    
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }
    
    const token = authHeader.substring(7);
    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Extract form fields
    const title = formData.get('title') as string;
    const tags = formData.get('tags') as string;
    const chillLevel = parseInt(formData.get('chillLevel') as string || '1', 10);
    const file = formData.get('file') as File;

    // Validate required fields
    if (!title || !tags || !chillLevel || !file) {
      return NextResponse.json(
        { error: 'Title, tags, chill level, and image file are required' },
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

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate secure filename
    const fileExt = path.extname(file.name);
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}${fileExt}`;
    const filePath = path.join(uploadsDir, fileName);

    // Save file to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    fs.writeFileSync(filePath, buffer);

    const imageUrl = `/uploads/${fileName}`;

    // Parse tags into array
    const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);

    // Create gallery item
    const item = await createGalleryItem(
      title,
      imageUrl,
      user.username,
      tagsArray,
      chillLevel,
      user.id
    );

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Error creating gallery item:', error);
    return NextResponse.json(
      { error: 'Failed to create gallery item' },
      { status: 500 }
    );
  }
}