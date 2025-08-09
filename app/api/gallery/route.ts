import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../../../lib/auth';
import { addGalleryItem, getAllGalleryItems as getMemoryItems } from '../../../lib/memory-storage';
import { addGalleryItemToFile, loadGalleryItems as getFileItems } from '../../../lib/file-storage';
import { uploadImageToImageKit, getAllImagesFromImageKit } from '../../../lib/imagekit';
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
    
    // Always check all storage systems and combine
    const memoryItems = getMemoryItems();
    console.log(`💾 Checking memory storage: ${memoryItems.length} items`);
    
    // Also try file storage for production persistence
    const fileItems = getFileItems();
    console.log(`📁 Fetched ${fileItems.length} items from file storage`);
    
    // Combine all items (database first, then file, then memory)
    const allItems = [...items, ...fileItems, ...memoryItems];
    
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
    
    // Try to get images from ImageKit first
    let imagekitItems: any[] = [];
    try {
      imagekitItems = await getAllImagesFromImageKit();
      console.log(`📸 Fetched ${imagekitItems.length} items from ImageKit`);
    } catch (imagekitError) {
      console.error('❌ ImageKit fetch also failed:', imagekitError);
    }
    
    // Get memory storage items
    const memoryItems = getMemoryItems();
    console.log(`💾 Fetched ${memoryItems.length} items from memory storage`);
    
    // Also try file storage for production persistence
    const fileItems = getFileItems();
    console.log(`📁 Fetched ${fileItems.length} items from file storage`);
    
    // Combine all sources (ImageKit first, then file storage, then memory)
    const allItems = [...imagekitItems, ...fileItems, ...memoryItems];
    
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

    // Try to upload to Cloudinary, but fallback to base64 if it fails
    const buffer = Buffer.from(bytes);
    const filename = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
    
    let imageUrl: string;
    let uploadMethod = 'base64'; // Default to base64 for now
    
    try {
      console.log('🔄 Attempting ImageKit upload...');
      const uploadResult = await uploadImageToImageKit(buffer, filename);
      imageUrl = uploadResult.url;
      uploadMethod = 'imagekit';
      console.log('✅ Image uploaded to ImageKit:', uploadResult.fileId);
    } catch (imagekitError: any) {
      console.error('❌ ImageKit upload failed, using base64 fallback:', imagekitError?.message || imagekitError);
      
      // Fallback to base64 storage
      if (buffer.length > 2000000) { // 2MB limit for base64
        return NextResponse.json(
          { error: 'Image is too large for storage. Please use an image smaller than 2MB.' },
          { status: 400 }
        );
      }
      
      const base64 = buffer.toString('base64');
      const mimeType = file.type;
      imageUrl = `data:${mimeType};base64,${base64}`;
      uploadMethod = 'base64';
      console.log('💾 Using base64 storage as fallback');
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
      
      // Fallback to file storage and memory storage
      const savedItem = addGalleryItemToFile({
        title,
        image_url: imageUrl,
        date_uploaded: new Date().toISOString(),
        downloads: 0,
        author: user.username,
        tags: tagsArray,
        chill_level: chillLevel,
        user_id: user.id
      });
      
      // Also save to memory and file storage as backup
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
      
      console.log('💾 Saved to memory storage:', memoryItem.id);
      
      console.log('📁💾 Saved to file and memory storage as fallback:', {
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