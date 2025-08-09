// Database recovery utilities to retrieve uploaded images
import { Pool } from 'pg';

export async function attemptDatabaseRecovery() {
  console.log('🔄 Attempting database recovery...');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });

  try {
    const client = await pool.connect();
    console.log('✅ Recovery connection successful!');
    
    // Try to fetch existing gallery items
    const result = await client.query('SELECT * FROM gallery_items ORDER BY date_uploaded DESC');
    console.log(`📊 Found ${result.rows.length} items in database`);
    
    if (result.rows.length > 0) {
      console.log('🎉 Your uploaded images found:', 
        result.rows.map(item => ({ id: item.id, title: item.title, author: item.author }))
      );
    }
    
    client.release();
    await pool.end();
    
    return result.rows;
  } catch (error: any) {
    console.error('❌ Database recovery failed:', error.message);
    await pool.end();
    return [];
  }
}

export async function forceReconnectDatabase() {
  console.log('🔄 Forcing database reconnection...');
  
  try {
    const items = await attemptDatabaseRecovery();
    return items;
  } catch (error) {
    console.error('❌ Force reconnect failed:', error);
    return [];
  }
}