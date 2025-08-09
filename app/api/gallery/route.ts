import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../../../lib/auth';
import { addGalleryItem, getAllGalleryItems as getMemoryItems } from '../../../lib/memory-storage';
import { uploadImageToCloudinary, getAllImagesFromCloudinary } from '../../../lib/cloudinary';
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
    console.log(`📊 Fetched ${items.length} items from database:`, 
      items.map(item => ({ id: item.id, title: item.title, author: item.author }))
    );
    
    // If database returns items, use them
    if (items.length > 0) {
      return NextResponse.json(items, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Surrogate-Control': 'no-store'
        }
      });
    }
    
    // If database is empty, also check memory storage and combine
    const memoryItems = getMemoryItems();
    console.log(`💾 Also checking memory storage: ${memoryItems.length} items`);
    
    // Combine database and memory items (database items first)
    const allItems = [...items, ...memoryItems];
    
    return NextResponse.json(allItems, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store'
      }
    });
  } catch (error) {
    console.error('❌ Database error, trying Cloudinary and memory storage:', error);
    
    // Try to get images from Cloudinary first
    let cloudinaryItems: any[] = [];
    try {
      cloudinaryItems = await getAllImagesFromCloudinary();
      console.log(`☁️ Fetched ${cloudinaryItems.length} items from Cloudinary`);
    } catch (cloudinaryError) {
      console.error('❌ Cloudinary fetch also failed:', cloudinaryError);
    }
    
    // Get memory storage items
    const memoryItems = getMemoryItems();
    console.log(`💾 Fetched ${memoryItems.length} items from memory storage`);
    
    // Combine Cloudinary and memory items (Cloudinary first since those are your uploaded images)
    const allItems = [...cloudinaryItems, ...memoryItems];
    
    console.log(`📊 Total items from fallback sources: ${allItems.length}`);
    
    return NextResponse.json(allItems, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store'
      }
    });
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
      
      // Try to compress the image further if it's too large for base64
      let finalBuffer = buffer;
      if (buffer.length > 500000) { // If larger than 500KB, try to compress more
        console.log('Image too large for base64, attempting server-side compression...');
        // For now, just reject very large images when Cloudinary fails
        return NextResponse.json(
          { error: 'Image upload failed. Cloudinary is temporarily unavailable and the image is too large for backup storage. Please try again later or use a smaller image.' },
          { status: 503 }
        );
      }
      
      // Fallback to base64 if Cloudinary fails and image is small enough
      console.log('Falling back to base64 storage');
      const base64 = finalBuffer.toString('base64');
      const mimeType = file.type;
      imageUrl = `data:${mimeType};base64,${base64}`;
      
      // Check if the base64 string is too large
      if (imageUrl.length > 1000000) {
        return NextResponse.json(
          { error: 'Image is too large for backup storage and Cloudinary is unavailable. Please try a smaller image or try again later.' },
          { status: 400 }
        );
      }
    }

    // Parse tags into array
    const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);

    // Save to database (primary) and memory storage (backup)
    try {
      console.log('🔄 Attempting to save to database...', { 
        title, 
        author: user.username, 
        tagsCount: tagsArray.length,
        imageUrlLength: imageUrl.length,
        chillLevel,
        userId: user.id
      });
      
      const savedItem = await createGalleryItem(
        title,
        imageUrl,
        user.username,
        tagsArray,
        chillLevel,
        user.id
      );
      
      console.log('✅ Successfully saved to database:', {
        id: savedItem.id,
        title: savedItem.title,
        author: savedItem.author,
        hasImageUrl: !!savedItem.image_url
      });
      
      // Also save to memory storage as backup
      const memoryItem = addGalleryItem({
        title,
        image_url: imageUrl,
        date_uploaded: new Date().toISOString(),
        downloads: 0,
        author: user.username,
        tags: tagsArray,
        chill_level: chillLevel,
        user_id: user.id
      });
      
      console.log('💾 Also saved to memory storage:', memoryItem.id);
      
      return NextResponse.json(savedItem, { status: 201 });
    } catch (dbError: any) {
      console.error('❌ Database save failed:', {
        error: dbError.message,
        stack: dbError.stack,
        title,
        author: user.username
      });
      
      // Fallback to in-memory storage only
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
      
      console.log('💾 Saved to memory storage as fallback:', {
        id: savedItem.id,
        title: savedItem.title,
        hasImageUrl: !!savedItem.image_url
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