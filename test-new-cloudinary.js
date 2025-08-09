// Test new Cloudinary credentials
const { v2: cloudinary } = require('cloudinary');

// Configure with new credentials
cloudinary.config({
  cloud_name: 'dianrf8ao',
  api_key: '987188299759584',
  api_secret: 'DrNX-mcm8ejSOsh_uVQOoddBVsYoY'
});

async function testNewCredentials() {
  try {
    console.log('🔄 Testing new Cloudinary credentials...');
    console.log('Cloud Name:', 'dianrf8ao');
    console.log('API Key:', '987188299759584');
    console.log('API Secret:', 'DrNX-mcm8ejSOsh_uVQOoddBVsYoY'.substring(0, 10) + '...');

    // Test with a simple ping
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary ping successful:', result);

    // Try to get account usage
    const usage = await cloudinary.api.usage();
    console.log('✅ Account usage retrieved:', {
      plan: usage.plan,
      credits: usage.credits,
      objects: usage.objects
    });

    // Try to list resources
    const resources = await cloudinary.api.resources({ max_results: 5 });
    console.log(`✅ Found ${resources.resources.length} resources in account`);

    if (resources.resources.length > 0) {
      console.log('Sample resources:');
      resources.resources.forEach((resource, index) => {
        console.log(`  ${index + 1}. ${resource.public_id} (${resource.format})`);
      });
    }

    // Test search for creepy-gallery folder
    const searchResult = await cloudinary.search
      .expression('folder:creepy-gallery')
      .sort_by('created_at', 'desc')
      .max_results(10)
      .execute();

    console.log(`🔍 Found ${searchResult.resources.length} images in creepy-gallery folder`);

  } catch (error) {
    console.error('❌ New credentials test failed:', error.message);
    console.error('HTTP code:', error.http_code);
  }
}

testNewCredentials();