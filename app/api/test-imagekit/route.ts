import { NextResponse } from 'next/server';
import { uploadImageToImageKit } from '../../../lib/imagekit';

export async function GET() {
  try {
    console.log('🧪 Testing ImageKit in production...');
    
    // Check if environment variables are set
    const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;
    
    if (!publicKey || !privateKey || !urlEndpoint) {
      return NextResponse.json({
        success: false,
        error: 'ImageKit credentials not configured',
        env: {
          publicKey: !!publicKey,
          privateKey: !!privateKey,
          urlEndpoint: !!urlEndpoint
        }
      });
    }
    
    // Test upload with a tiny image
    const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77yQAAAABJRU5ErkJggg==';
    const buffer = Buffer.from(testImageBase64, 'base64');
    
    console.log('📤 Attempting test upload to ImageKit...');
    const result = await uploadImageToImageKit(buffer, 'production_test');
    
    return NextResponse.json({
      success: true,
      message: 'ImageKit working in production!',
      result: {
        fileId: result.fileId,
        url: result.url,
        size: result.size
      },
      env: {
        publicKey: !!publicKey,
        privateKey: !!privateKey,
        urlEndpoint: !!urlEndpoint
      }
    });
    
  } catch (error: any) {
    console.error('❌ ImageKit test failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}