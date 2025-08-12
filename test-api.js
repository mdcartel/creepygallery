// Test the API directly
const fetch = require('node-fetch');

async function testAPI() {
  try {
    console.log('🧪 Testing gallery API...');
    
    const response = await fetch('http://localhost:3000/api/gallery');
    console.log('Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Success:', data);
    } else {
      const error = await response.text();
      console.log('❌ Error:', error);
    }
  } catch (error) {
    console.error('❌ Fetch failed:', error.message);
  }
}

testAPI();