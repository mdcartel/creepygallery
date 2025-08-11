const fs = require('fs');

// Create a test image buffer (1x1 pixel PNG)
const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77yQAAAABJRU5ErkJggg==';
const testImageBuffer = Buffer.from(testImageBase64, 'base64');

async function testPersistentUpload() {
  console.log('🧪 Testing persistent storage upload...');
  
  // Create form data
  const FormData = require('form-data');
  const form = new FormData();
  
  form.append('title', 'Test Persistent Image');
  form.append('tags', 'test, persistent, storage');
  form.append('chillLevel', '3');
  form.append('file', testImageBuffer, {
    filename: 'test.png',
    contentType: 'image/png'
  });
  
  try {
    const response = await fetch('http://localhost:3000/api/gallery', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer demo-token',
        ...form.getHeaders()
      },
      body: form
    });
    
    const result = await response.json();
    console.log('📤 Upload result:', result);
    
    if (response.ok) {
      console.log('✅ Upload successful!');
      console.log('📊 Storage locations:', result.storage_info?.storage_locations);
      
      // Now test retrieval
      console.log('\n🔍 Testing image retrieval...');
      const getResponse = await fetch('http://localhost:3000/api/gallery');
      const images = await getResponse.json();
      
      console.log(`📸 Retrieved ${images.length} images`);
      if (images.length > 0) {
        console.log('✅ Image persistence working!');
        images.forEach((img, i) => {
          console.log(`${i + 1}. "${img.title}" by ${img.author}`);
        });
      } else {
        console.log('❌ No images retrieved - persistence failed');
      }
      
    } else {
      console.log('❌ Upload failed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testPersistentUpload();