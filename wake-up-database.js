const { Pool } = require('pg');

const DATABASE_URL = "postgresql://neondb_owner:npg_igr5xsKVnWJ6@ep-cold-shape-acjv9ykg-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function wakeUpDatabase() {
  console.log('🌅 Waking up Neon database...');
  console.log('⏳ This may take up to 2 minutes for auto-activation...\n');
  
  // Create pool with very long timeout for auto-activation
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { 
      rejectUnauthorized: false,
      require: true 
    },
    connectionTimeoutMillis: 120000, // 2 minutes
    idleTimeoutMillis: 30000,
    max: 1,
    min: 0
  });

  let attempt = 1;
  const maxAttempts = 3;
  
  while (attempt <= maxAttempts) {
    try {
      console.log(`🔄 Attempt ${attempt}/${maxAttempts}: Connecting to database...`);
      
      const client = await pool.connect();
      console.log('✅ Database connection successful!');
      
      // Test with a simple query
      console.log('🔍 Testing database functionality...');
      const timeResult = await client.query('SELECT NOW() as current_time');
      console.log(`   Current time: ${timeResult.rows[0].current_time}`);
      
      // Check if our tables exist and get counts
      try {
        const photoCount = await client.query('SELECT COUNT(*) as count FROM gallery_items');
        const userCount = await client.query('SELECT COUNT(*) as count FROM users');
        
        console.log(`📸 Photos in database: ${photoCount.rows[0].count}`);
        console.log(`👥 Users in database: ${userCount.rows[0].count}`);
        
        // Get sample photo info to verify data
        if (parseInt(photoCount.rows[0].count) > 0) {
          const samplePhotos = await client.query(`
            SELECT id, title, author, 
                   CASE 
                     WHEN image_url LIKE 'data:image%' THEN 'base64'
                     WHEN image_url LIKE 'http%' THEN 'url'
                     ELSE 'other'
                   END as image_type,
                   LENGTH(image_url) as image_size
            FROM gallery_items 
            ORDER BY date_uploaded DESC 
            LIMIT 3
          `);
          
          console.log('\n📋 Sample photos found:');
          samplePhotos.rows.forEach((photo, i) => {
            console.log(`${i + 1}. "${photo.title}" by ${photo.author}`);
            console.log(`   Type: ${photo.image_type}, Size: ${photo.image_size} chars`);
          });
        }
        
      } catch (tableError) {
        console.log('⚠️ Tables might not exist yet:', tableError.message);
      }
      
      client.release();
      await pool.end();
      
      console.log('\n🎉 Database is fully active and ready!');
      console.log('✅ You can now run the migration: node migrate-to-imagekit.js migrate');
      return true;
      
    } catch (error) {
      console.log(`❌ Attempt ${attempt} failed:`, error.message);
      
      if (attempt < maxAttempts) {
        console.log(`⏳ Waiting 30 seconds before retry...`);
        await new Promise(resolve => setTimeout(resolve, 30000));
      }
      
      attempt++;
    }
  }
  
  await pool.end();
  console.log('\n😞 Failed to wake up database after all attempts.');
  console.log('💡 Try manually activating it in the Neon console:');
  console.log('   1. Go to https://console.neon.tech');
  console.log('   2. Find your project');
  console.log('   3. Look for "Resume" or "Activate" button');
  console.log('   4. Click it and wait');
  
  return false;
}

wakeUpDatabase().catch(console.error);