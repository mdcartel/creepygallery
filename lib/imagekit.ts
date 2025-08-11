import ImageKit from 'imagekit';

// Configure ImageKit - lazy initialization to avoid build-time issues
let imagekit: ImageKit | null = null;

function getImageKit(): ImageKit {
  if (!imagekit) {
    const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;
    
    if (!publicKey || !privateKey || !urlEndpoint) {
      throw new Error('ImageKit credentials not configured. Please set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and IMAGEKIT_URL_ENDPOINT environment variables.');
    }
    
    imagekit = new ImageKit({
      publicKey,
      privateKey,
      urlEndpoint
    });
  }
  
  return imagekit;
}

export interface ImageKitUploadResult {
  fileId: string;
  name: string;
  url: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  size: number;
  filePath: string;
}

export async function uploadImageToImageKit(
  buffer: Buffer,
  filename: string
): Promise<ImageKitUploadResult> {
  try {
    console.log('🔄 Uploading to ImageKit...');
    
    const result = await getImageKit().upload({
      file: buffer,
      fileName: `${Date.now()}_${filename}`,
      folder: '/creepy-gallery', // Organize images in a folder
      useUniqueFileName: true,
      tags: ['creepy-gallery', 'upload'],
      transformation: {
        pre: 'q-auto,f-auto', // Auto quality and format
      }
    });

    console.log('✅ ImageKit upload successful:', result.fileId);

    return {
      fileId: result.fileId,
      name: result.name,
      url: result.url,
      thumbnailUrl: result.thumbnailUrl || result.url,
      width: result.width || 0,
      height: result.height || 0,
      size: result.size,
      filePath: result.filePath
    };
  } catch (error: any) {
    console.error('❌ ImageKit upload failed:', error);
    throw new Error(`ImageKit upload failed: ${error.message}`);
  }
}

export function generateImageKitThumbnail(url: string, width = 300, height = 300): string {
  // ImageKit URL transformation
  const transformationParams = `tr:w-${width},h-${height},c-maintain_ratio,q-auto,f-auto`;
  
  // Insert transformation parameters into the URL
  if (url.includes('/tr:')) {
    // URL already has transformations, replace them
    return url.replace(/\/tr:[^/]+/, `/${transformationParams}`);
  } else {
    // Add transformations to the URL
    const urlParts = url.split('/');
    const endpointIndex = urlParts.findIndex(part => part.includes('ik.imagekit.io'));
    if (endpointIndex !== -1 && endpointIndex + 1 < urlParts.length) {
      urlParts.splice(endpointIndex + 1, 0, transformationParams);
      return urlParts.join('/');
    }
  }
  
  return url; // Return original if transformation fails
}

export async function deleteImageFromImageKit(fileId: string): Promise<void> {
  try {
    await getImageKit().deleteFile(fileId);
    console.log('✅ Image deleted from ImageKit:', fileId);
  } catch (error: any) {
    console.error('❌ Error deleting image from ImageKit:', error);
    throw error;
  }
}

export async function getAllImagesFromImageKit(): Promise<any[]> {
  try {
    console.log('🔄 Fetching images from ImageKit...');
    
    const result = await getImageKit().listFiles({
      path: '/creepy-gallery',
      limit: 50,
      sort: 'DESC_CREATED'
    });
    
    console.log(`📸 Found ${result.length} images in ImageKit`);
    
    return result.map((file: any) => ({
      id: file.fileId,
      title: file.name.split('_').slice(1).join('_').replace(/\.[^/.]+$/, '') || 'Untitled',
      image_url: file.url,
      date_uploaded: file.createdAt,
      downloads: 0, // Default since we can't get this from ImageKit
      author: 'Unknown', // Default since we can't get this from ImageKit
      tags: ['recovered'], // Tag to indicate these are recovered images
      chill_level: 3, // Default chill level
      user_id: 'recovered-user',
      imagekit_file_id: file.fileId,
      width: file.width,
      height: file.height,
      size: file.size,
      filePath: file.filePath
    }));
  } catch (error: any) {
    console.error('❌ Error fetching images from ImageKit:', error);
    return [];
  }
}