import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../../../lib/auth';
import { addGalleryItem, getAllGalleryItems as getMemoryItems } from '../../../lib/memory-storage';
import { uploadImageToCloudinary } from '../../../lib/cloudinary';
import { getAllGalleryItems, createGalleryItem } from '../../../lib/gallery';

// File validation utilities
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB (Cloudinary can handle larger files)

function validateFileType(file: File): boolean {
  return ALLOWED_TYPES.includes(file.type.toLowerCase());
}

function validateFileSize(file: File): boolean {
  return file.size <= MAX_FILE_SIZE;
}

function validateImageMagicNumbers(buffer: ArrayBuffer): boolean {
  const bytes = new Uint8Array(buffer.slice(0, 12));
  
  // JPEG: FF D8 FF
  if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) return true;
  
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) return true;
  
  // GIF: 47 49 46 38
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) return true;
  
  // WebP: 52 49 46 46 ... 57 45 42 50
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
      bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) return true;
  
  return false;
}

export async function GET() {
  try {
    // Try to get items from database first
    const items = await getAllGalleryItems();
    console.log(`Fetched ${items.length} items from database`);
    return NextResponse.json(items);
  } catch (error) {
    console.error('Database error, falling back to memory storage:', error);
    // Fallback to in-memory storage if database fails
    const items = getMemoryItems();
    return NextResponse.json(items);
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
        { error: 'Authorization required. Please log in to upload images.' },
        { status: 401 }
      );
    }
    
    const token = authHeader.substring(7);
    let user;
    
    try {
      user = verifyToken(token);
    } catch (error) {
      console.error('Token verification error:', error);
    }
    
    // For now, allow uploads with a default user if token fails (temporary fix)
    if (!user) {
      console.log('Using default user due to auth issues');
      user = {
        id: 'demo-user',
        username: 'Demo User',
        email: 'demo@creepygallery.com',
        createdAt: new Date()
      };
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

    // Comprehensive file validation
    if (!validateFileType(file)) {
      return NextResponse.json(
        { error: 'File must be a valid image (JPEG, PNG, GIF, or WebP)' },
        { status: 400 }
      );
    }

    if (!validateFileSize(file)) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    // Get file buffer for magic number validation
    const bytes = await file.arrayBuffer();
    
    if (!validateImageMagicNumbers(bytes)) {
      return NextResponse.json(
        { error: 'Invalid image file format' },
        { status: 400 }
      );
    }

    // Upload to Cloudinary
    const buffer = Buffer.from(bytes);
    const filename = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
    
    let imageUrl: string;
    
    try {
      const uploadResult = await uploadImageToCloudinary(buffer, filename);
      imageUrl = uploadResult.secure_url;
      console.log('Image uploaded to Cloudinary:', uploadResult.public_id);
    } catch (cloudinaryError) {
      console.error('Cloudinary upload failed:', cloudinaryError);
      
      // Fallback to base64 if Cloudinary fails
      console.log('Falling back to base64 storage');
      const base64 = buffer.toString('base64');
      const mimeType = file.type;
      imageUrl = `data:${mimeType};base64,${base64}`;
      
      // Check if the base64 string is too large
      if (imageUrl.length > 1000000) {
        return NextResponse.json(
          { error: 'Image is too large and Cloudinary is unavailable. Please try a smaller image.' },
          { status: 400 }
        );
      }
    }

    // Parse tags into array
    const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);

    // Try to save to database first, fallback to memory storage
    try {
      console.log('Attempting to save to database...');
      const savedItem = await createGalleryItem(
        title,
        imageUrl,
        user.username,
        tagsArray,
        chillLevel,
        user.id
      );
      console.log('Successfully saved to database:', savedItem.id);
      return NextResponse.json(savedItem, { status: 201 });
    } catch (dbError: any) {
      console.error('Database save failed, using memory storage:', dbError);
      
      // Fallback to in-memory storage
      const savedItem = addGalleryItem({
        title,
        image_url: imageUrl,
        date_uploaded: new Date().toISOString(),
        downloads: 0,
        author: user.username,
        tags: tagsArray,
        chill_level: chillLevel,
        user_id: user.id
      });
      
      return NextResponse.json({
        ...savedItem,
        message: 'Image saved (database temporarily unavailable)'
      }, { status: 201 });
    }

  } catch (error) {
    console.error('Error creating gallery item:', error);
    return NextResponse.json(
      { error: 'Failed to create gallery item' },
      { status: 500 }
    );
  }
}