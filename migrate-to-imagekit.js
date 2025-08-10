const { Pool } = require('pg');
const ImageKit = require('imagekit');
const fs = require('fs');
const path = require('path');

// Database configuration - using exact connection string
const DATABASE_URL = "postgresql://neondb_owner:npg_igr5xsKVnWJ6@ep-cold-shape-acjv9ykg-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

// ImageKit configuration
const imagekit = new ImageKit({
  publicKey: 'public_36wl7ohZQLlNE7OVDXuNUu4fOWU=',
  privateKey: 'private_jNHUPkbt/6tSUumZJPNYdb7KTE8=',
  urlEndpoint: 'https://ik.imagekit.io/0hvylfp3d'
});

async function migratePhotosToImageKit() {
  console.log('🚀 Starting migration from Neon database to ImageKit...');
  
  // Create connection pool with better settings
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 30000,
    idleTimeoutMillis: 60000,
    max: 1, // Use single connection for migration
    statement_timeout: 60000,
    query_timeout: 60000
  });

  let client;
  let migratedCount = 0;
  let errorCount = 0;
  const migrationLog = [];

  try {
    console.log('🔄 Connecting to Neon database...');
    client = await pool.connect();
    console.log('✅ Connected to Neon database successfully!');

    // Get all gallery items from database
    console.log('📊 Fetching all photos from database...');
    const result = await client.query('SELECT * FROM gallery_items ORDER BY date_uploaded DESC');
    const photos = result.rows;
    
    console.log(`📸 Found ${photos.length} photos in database`);
    
    if (photos.length === 0) {
      console.log('❌ No photos found in database. Migration not needed.');
      return;
    }

    // Create migration backup directory
    const backupDir = path.join(process.cwd(), 'migration-backup');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Save original data as backup
    fs.writeFileSync(
      path.join(backupDir, `pre-migration-backup-${Date.now()}.json`),
      JSON.stringify(photos, null, 2)
    );

    console.log('\n🔄 Starting photo migration...');
    
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      console.log(`\n📸 Processing photo ${i + 1}/${photos.length}: "${photo.title}"`);
      
      try {
        // Check if image_url is base64 data
        if (photo.image_url && photo.image_url.startsWith('data:image/')) {
          console.log('   📦 Found base64 image, uploading to ImageKit...');
          
          // Extract base64 data and mime type
          const matches = photo.image_url.match(/^data:image\/([^;]+);base64,(.+)$/);
          if (!matches) {
            throw new Error('Invalid base64 format');
          }
          
          const [, mimeType, base64Data] = matches;
          const buffer = Buffer.from(base64Data, 'base64');
          
          // Generate filename
          const extension = mimeType === 'jpeg' ? 'jpg' : mimeType;
          const filename = `migrated_${photo.id}_${photo.title.replace(/[^a-zA-Z0-9]/g, '_')}.${extension}`;
          
          // Upload to ImageKit
          const uploadResult = await imagekit.upload({
            file: buffer,
            fileName: filename,
            folder: '/creepy-gallery',
            useUniqueFileName: true,
            tags: ['migrated', 'creepy-gallery', ...(photo.tags || [])],
            transformation: {
              pre: 'q-auto,f-auto'
            }
          });
          
          console.log(`   ✅ Uploaded to ImageKit: ${uploadResult.fileId}`);
          
          // Update database with new ImageKit URL
          await client.query(
            'UPDATE gallery_items SET image_url = $1, imagekit_file_id = $2 WHERE id = $3',
            [uploadResult.url, uploadResult.fileId, photo.id]
          );
          
          console.log('   ✅ Updated database with ImageKit URL');
          
          migratedCount++;
          migrationLog.push({
            id: photo.id,
            title: photo.title,
            status: 'success',
            imagekit_file_id: uploadResult.fileId,
            imagekit_url: uploadResult.url,
            original_size: buffer.length,
            new_size: uploadResult.size
          });
          
        } else if (photo.image_url && photo.image_url.startsWith('http')) {
          console.log('   ℹ️ Already has URL, skipping...');
          migrationLog.push({
            id: photo.id,
            title: photo.title,
            status: 'skipped',
            reason: 'Already has URL'
          });
        } else {
          console.log('   ⚠️ No valid image data found');
          migrationLog.push({
            id: photo.id,
            title: photo.title,
            status: 'skipped',
            reason: 'No valid image data'
          });
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`   ❌ Error migrating photo "${photo.title}":`, error.message);
        errorCount++;
        migrationLog.push({
          id: photo.id,
          title: photo.title,
          status: 'error',
          error: error.message
        });
      }
    }

    // Save migration log
    fs.writeFileSync(
      path.join(backupDir, `migration-log-${Date.now()}.json`),
      JSON.stringify({
        timestamp: new Date().toISOString(),
        total_photos: photos.length,
        migrated_count: migratedCount,
        error_count: errorCount,
        details: migrationLog
      }, null, 2)
    );

    console.log('\n🎉 Migration completed!');
    console.log(`✅ Successfully migrated: ${migratedCount} photos`);
    console.log(`❌ Errors: ${errorCount} photos`);
    console.log(`📁 Backup and logs saved to: ${backupDir}`);

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

// Also create a function to test database connection
async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...');
  
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { 
      rejectUnauthorized: false,
      require: true 
    },
    connectionTimeoutMillis: 30000,
    idleTimeoutMillis: 30000,
    max: 1
  });

  try {
    const client = await pool.connect();
    console.log('✅ Database connection successful!');
    
    // Test query
    const result = await client.query('SELECT COUNT(*) as photo_count FROM gallery_items');
    console.log(`📸 Found ${result.rows[0].photo_count} photos in database`);
    
    const userResult = await client.query('SELECT COUNT(*) as user_count FROM users');
    console.log(`👥 Found ${userResult.rows[0].user_count} users in database`);
    
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  } finally {
    await pool.end();
  }
}

// Run based on command line argument
const command = process.argv[2];

if (command === 'test') {
  testDatabaseConnection();
} else if (command === 'migrate') {
  migratePhotosToImageKit();
} else {
  console.log('Usage:');
  console.log('  node migrate-to-imagekit.js test     - Test database connection');
  console.log('  node migrate-to-imagekit.js migrate - Migrate photos to ImageKit');
}