const https = require('https');
const { Pool } = require('pg');

const DATABASE_URL = "postgresql://neondb_owner:npg_igr5xsKVnWJ6@ep-cold-shape-acjv9ykg-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function checkDatabaseStatus() {
  console.log('🔍 Checking Neon database status...\n');
  
  // Extract connection details
  const url = new URL(DATABASE_URL);
  console.log('📊 Connection Details:');
  console.log(`   Host: ${url.hostname}`);
  console.log(`   Database: ${url.pathname.slice(1)}`);
  console.log(`   User: ${url.username}`);
  console.log('');
  
  // Test 1: Quick connection test
  console.log('⚡ Quick Connection Test:');
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 90000, // 90 second timeout for auto-activation
    max: 1
  });
  
  try {
    console.log('⏳ Attempting to wake up database (this may take 30-60 seconds)...');
    const client = await pool.connect();
    console.log('✅ Database is now ACTIVE and responding!');
    
    // Get basic info
    const result = await client.query('SELECT NOW() as current_time, version() as db_version');
    console.log(`   Current time: ${result.rows[0].current_time}`);
    console.log(`   PostgreSQL version: ${result.rows[0].db_version.split(' ')[0]} ${result.rows[0].db_version.split(' ')[1]}`);
    
    client.release();
    await pool.end();
    
    return 'ACTIVE';
  } catch (error) {
    await pool.end();
    
    if (error.message.includes('timeout') || error.message.includes('ECONNRESET')) {
      console.log('😴 Database appears to be PAUSED or SLEEPING');
      console.log('   Error:', error.message);
      return 'PAUSED';
    } else if (error.message.includes('authentication')) {
      console.log('🔐 Database is active but authentication failed');
      console.log('   Error:', error.message);
      return 'AUTH_ERROR';
    } else {
      console.log('❌ Database connection failed');
      console.log('   Error:', error.message);
      return 'ERROR';
    }
  }
}

async function main() {
  const status = await checkDatabaseStatus();
  
  console.log('\n📋 Status Summary:');
  console.log(`   Database Status: ${status}`);
  
  if (status === 'PAUSED') {
    console.log('\n💡 Next Steps:');
    console.log('1. Go to https://console.neon.tech');
    console.log('2. Sign in to your account');
    console.log('3. Find your project');
    console.log('4. Look for a "Resume" or "Wake up" button');
    console.log('5. Click it and wait 30-60 seconds');
    console.log('6. Run this script again to verify');
  } else if (status === 'ACTIVE') {
    console.log('\n🎉 Database is ready! You can now:');
    console.log('1. Run the migration: node migrate-to-imagekit.js migrate');
    console.log('2. Or restart your app to reconnect');
  } else if (status === 'AUTH_ERROR') {
    console.log('\n🔑 Authentication issue:');
    console.log('1. Get a fresh connection string from Neon console');
    console.log('2. Update your .env.local file');
  } else {
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check Neon console for database status');
    console.log('2. Verify connection string is correct');
    console.log('3. Check if IP restrictions are enabled');
  }
}

main().catch(console.error);