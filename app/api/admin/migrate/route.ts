import { NextResponse } from 'next/server';
import { sqlQuery, getDatabaseStatus } from '../../../../lib/db';

export async function POST() {
  try {
    console.log('🔄 Admin: Starting migration from fallback to database...');
    
    // Check current database status
    const dbStatus = getDatabaseStatus();
    console.log('📊 Current status:', dbStatus);
    
    if (dbStatus.fallbackUsers === 0) {
      return NextResponse.json({
        success: false,
        message: 'No users in fallback storage to migrate'
      });
    }
    
    // Force database reconnection and table creation
    try {
      await sqlQuery`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(255) PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          username VARCHAR(255) NOT NULL,
          password VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      
      await sqlQuery`
        CREATE TABLE IF NOT EXISTS gallery_items (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          image_url TEXT,
          date_uploaded TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          downloads INTEGER DEFAULT 0,
          author VARCHAR(255) NOT NULL,
          tags TEXT[] DEFAULT '{}',
          chill_level INTEGER DEFAULT 1,
          user_id VARCHAR(255) REFERENCES users(id)
        )
      `;
      
      console.log('✅ Database tables created/verified');
      
      return NextResponse.json({
        success: true,
        message: 'Database tables created. Please create new accounts - they will now be stored in the database.',
        fallbackUsers: dbStatus.fallbackUsers
      });
      
    } catch (error: any) {
      console.error('❌ Migration failed:', error);
      
      return NextResponse.json({
        success: false,
        error: error.message
      });
    }
    
  } catch (error: any) {
    console.error('❌ Migration error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message
    });
  }
}