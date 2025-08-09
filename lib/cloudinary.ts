import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export async function uploadImageToCloudinary(
  buffer: Buffer,
  filename: string
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    // Set a timeout for the upload
    const timeout = setTimeout(() => {
      reject(new Error('Cloudinary upload timeout after 30 seconds'));
    }, 30000);

    cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        folder: 'creepy-gallery', // Organize images in a folder
        public_id: `${Date.now()}_${filename}`, // Unique filename
        transformation: [
          { quality: 'auto' }, // Automatic quality optimization
          { fetch_format: 'auto' }, // Automatic format selection (WebP, etc.)
        ],
        timeout: 60000, // 60 second timeout
      },
      (error, result) => {
        clearTimeout(timeout);
        
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(error);
        } else if (result) {
          resolve({
            public_id: result.public_id,
            secure_url: result.secure_url,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
          });
        } else {
          reject(new Error('Upload failed - no result'));
        }
      }
    ).end(buffer);
  });
}

export function generateThumbnailUrl(publicId: string, width = 300, height = 300): string {
  return cloudinary.url(publicId, {
    width,
    height,
    crop: 'fill',
    quality: 'auto',
    fetch_format: 'auto',
  });
}

export async function deleteImageFromCloudinary(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
}

export async function getAllImagesFromCloudinary(): Promise<any[]> {
  try {
    console.log('🔄 Fetching images from Cloudinary...');
    
    // Search for all images in the creepy-gallery folder
    const result = await cloudinary.search
      .expression('folder:creepy-gallery')
      .sort_by([['created_at', 'desc']])
      .max_results(50)
      .execute();
    
    console.log(`📸 Found ${result.resources.length} images in Cloudinary`);
    
    return result.resources.map((resource: any) => ({
      id: resource.public_id.split('_')[0], // Extract timestamp from public_id
      title: resource.public_id.split('_').slice(1).join('_') || 'Untitled',
      image_url: resource.secure_url,
      date_uploaded: resource.created_at,
      downloads: 0, // Default since we can't get this from Cloudinary
      author: 'Unknown', // Default since we can't get this from Cloudinary
      tags: ['recovered'], // Tag to indicate these are recovered images
      chill_level: 3, // Default chill level
      user_id: 'recovered-user',
      cloudinary_public_id: resource.public_id,
      width: resource.width,
      height: resource.height,
      format: resource.format,
      bytes: resource.bytes
    }));
  } catch (error) {
    console.error('❌ Error fetching images from Cloudinary:', error);
    return [];
  }
}