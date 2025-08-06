const { neon } = require('@neondatabase/serverless');

async function setupDatabase() {
  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set');
    console.log('Please add your Neon connection string to .env.local');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);
  
  try {
    console.log('🔄 Setting up database...');
    
    // Create users table
    console.log('Creating users table...');
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Create gallery_items table
    console.log('Creating gallery_items table...');
    await sql`
      CREATE TABLE IF NOT EXISTS gallery_items (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        image_url TEXT,
        date_uploaded TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        downloads INTEGER DEFAULT 0,
        author VARCHAR(255) NOT NULL,
        tags TEXT[],
        chill_level INTEGER CHECK (chill_level >= 1 AND chill_level <= 10),
        user_id VARCHAR(255) REFERENCES users(id)
      )
    `;
    
    // Create indexes
    console.log('Creating indexes...');
    await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_gallery_items_user_id ON gallery_items(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_gallery_items_date ON gallery_items(date_uploaded)`;
    
    console.log('✅ Database setup completed successfully!');
    console.log('📊 Tables created:');
    console.log('  - users (for authentication)');
    console.log('  - gallery_items (for image posts)');
    console.log('  - indexes for better performance');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

setupDatabase();