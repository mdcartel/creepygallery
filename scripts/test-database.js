const { neon } = require('@neondatabase/serverless');

async function testDatabase() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not set');
    return;
  }

  const sql = neon(process.env.DATABASE_URL);
  
  try {
    console.log('🔄 Testing database connection...');
    
    // Test basic connection
    const result = await sql`SELECT NOW() as current_time`;
    console.log('✅ Database connected successfully!');
    console.log('📅 Current time:', result[0].current_time);
    
    // Check if tables exist
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    console.log('📊 Available tables:');
    tables.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });
    
    // Test user table
    const userCount = await sql`SELECT COUNT(*) as count FROM users`;
    console.log(`👥 Users in database: ${userCount[0].count}`);
    
    // Test gallery table
    const galleryCount = await sql`SELECT COUNT(*) as count FROM gallery_items`;
    console.log(`🖼️  Gallery items: ${galleryCount[0].count}`);
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  }
}

require('dotenv').config({ path: '.env.local' });
testDatabase();