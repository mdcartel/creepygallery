const { Pool } = require('pg');

const DATABASE_URL = "postgresql://neondb_owner:npg_igr5xsKVnWJ6@ep-cold-shape-acjv9ykg-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function testConnection() {
  console.log('🔍 Testing Neon database connection with multiple approaches...');
  
  // Test 1: Basic connection
  console.log('\n📡 Test 1: Basic connection...');
  const pool1 = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    const client = await pool1.connect();
    console.log('✅ Basic connection successful!');
    
    const result = await client.query('SELECT NOW() as current_time');
    console.log('✅ Query successful:', result.rows[0].current_time);
    
    client.release();
  } catch (error) {
    console.log('❌ Basic connection failed:', error.message);
  } finally {
    await pool1.end();
  }
  
  // Test 2: With different SSL settings
  console.log('\n🔒 Test 2: Different SSL settings...');
  const pool2 = new Pool({
    connectionString: DATABASE_URL,
    ssl: { 
      rejectUnauthorized: false,
      require: true,
      ca: false
    },
    connectionTimeoutMillis: 20000
  });
  
  try {
    const client = await pool2.connect();
    console.log('✅ SSL connection successful!');
    client.release();
  } catch (error) {
    console.log('❌ SSL connection failed:', error.message);
  } finally {
    await pool2.end();
  }
  
  // Test 3: Parse connection string manually
  console.log('\n🔧 Test 3: Manual connection parsing...');
  const url = new URL(DATABASE_URL);
  const pool3 = new Pool({
    host: url.hostname,
    port: parseInt(url.port) || 5432,
    database: url.pathname.slice(1),
    user: url.username,
    password: url.password,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 20000
  });
  
  try {
    const client = await pool3.connect();
    console.log('✅ Manual parsing connection successful!');
    
    // Try to get table info
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('📊 Tables found:', tables.rows.map(r => r.table_name));
    
    // Try to get photo count
    try {
      const photoCount = await client.query('SELECT COUNT(*) as count FROM gallery_items');
      console.log('📸 Photos in database:', photoCount.rows[0].count);
      
      // Get sample photo info
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
        LIMIT 5
      `);
      
      console.log('\n📋 Sample photos:');
      samplePhotos.rows.forEach((photo, i) => {
        console.log(`${i + 1}. "${photo.title}" by ${photo.author}`);
        console.log(`   Type: ${photo.image_type}, Size: ${photo.image_size} chars`);
      });
      
    } catch (tableError) {
      console.log('❌ Error querying gallery_items:', tableError.message);
    }
    
    client.release();
    return true;
  } catch (error) {
    console.log('❌ Manual parsing connection failed:', error.message);
    return false;
  } finally {
    await pool3.end();
  }
}

testConnection().then(success => {
  if (success) {
    console.log('\n🎉 Database connection successful! Ready for migration.');
  } else {
    console.log('\n😞 All connection attempts failed.');
    console.log('💡 Possible solutions:');
    console.log('1. Check if your Neon database is paused (go to console.neon.tech)');
    console.log('2. Get a fresh connection string from Neon dashboard');
    console.log('3. Check if your IP is whitelisted (if IP restrictions are enabled)');
    console.log('4. Try again in a few minutes (temporary network issue)');
  }
}).catch(console.error);