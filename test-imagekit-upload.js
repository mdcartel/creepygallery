const ImageKit = require('imagekit');
const fs = require('fs');

const imagekit = new ImageKit({
  publicKey: 'public_36wl7ohZQLlNE7OVDXuNUu4fOWU=',
  privateKey: 'private_jNHUPkbt/6tSUumZJPNYdb7KTE8=',
  urlEndpoint: 'https://ik.imagekit.io/0hvylfp3d'
});

async function testImageKitUpload() {
  console.log('🧪 Testing ImageKit upload...');
  
  try {
    // Create a simple test image (1x1 pixel PNG)
    const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77yQAAAABJRU5ErkJggg==';
    const buffer = Buffer.from(testImageBase64, 'base64');
    
    console.log('📤 Uploading test image to ImageKit...');
    
    const result = await imagekit.upload({
      file: buffer,
      fileName: `test_upload_${Date.now()}.png`,
      folder: '/creepy-gallery',
      useUniqueFileName: true,
      tags: ['test', 'creepy-gallery']
    });
    
    console.log('✅ Upload successful!');
    console.log('📸 File ID:', result.fileId);
    console.log('🔗 URL:', result.url);
    console.log('📏 Size:', result.size, 'bytes');
    
    // Now try to list files to verify it's there
    console.log('\n🔍 Checking if file appears in gallery...');
    const files = await imagekit.listFiles({
      path: '/creepy-gallery',
      limit: 10,
      sort: 'DESC_CREATED'
    });
    
    console.log(`📋 Found ${files.length} files in gallery:`);
    files.forEach((file, i) => {
      console.log(`${i + 1}. ${file.name} (${file.fileId})`);
    });
    
    return true;
    
  } catch (error) {
    console.error('❌ ImageKit test failed:', error.message);
    return false;
  }
}

testImageKitUpload();