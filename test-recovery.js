// Test the recovery function directly
const { recoverAllImages } = require('./lib/persistent-storage.ts');

async function testRecovery() {
  console.log('🧪 Testing image recovery...');
  
  try {
    const images = await recoverAllImages();
    console.log(`📸 Recovered ${images.length} images:`);
    
    images.forEach((img, i) => {
      console.log(`${i + 1}. ${img.title}`);
      console.log(`   URL: ${img.image_url}`);
      console.log(`   Author: ${img.author}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Recovery test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testRecovery();