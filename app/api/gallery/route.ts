import { NextRequest, NextResponse } from 'next/server';
import { getAllGalleryItems, createGalleryItem } from '../../../lib/gallery';
import { verifyToken } from '../../../lib/auth';

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
    const { title, imageUrl, tags, chillLevel } = await request.json();
    
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
    
    // Validate input
    if (!title || !tags || !chillLevel) {
      return NextResponse.json(
        { error: 'Title, tags, and chill level are required' },
        { status: 400 }
      );
    }
    
    if (chillLevel < 1 || chillLevel > 5) {
      return NextResponse.json(
        { error: 'Chill level must be between 1 and 5' },
        { status: 400 }
      );
    }
    
    // Create gallery item
    const item = await createGalleryItem(
      title,
      imageUrl || null,
      user.username,
      tags,
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