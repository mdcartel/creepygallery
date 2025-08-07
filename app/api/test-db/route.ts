import { NextResponse } from 'next/server';
import { sqlQuery } from '../../../lib/db';

export async function GET() {
  try {
    // Test basic database connection
    const result = await sqlQuery`SELECT COUNT(*) as count FROM gallery_items`;
    
    // Test inserting a user first
    await sqlQuery`
      INSERT INTO users (id, email, username, password) 
      VALUES ('test-user-id', 'test@creepygallery.com', 'Test User', 'temp-password')
      ON CONFLICT (id) DO NOTHING
    `;
    
    // Test inserting a simple item
    const testInsert = await sqlQuery`
      INSERT INTO gallery_items (title, image_url, author, tags, chill_level, user_id) 
      VALUES ('Test Item', 'test-url', 'Test User', ARRAY['test'], 1, 'test-user-id') 
      RETURNING *
    `;
    
    // Clean up test item and user
    await sqlQuery`DELETE FROM gallery_items WHERE title = 'Test Item'`;
    await sqlQuery`DELETE FROM users WHERE id = 'test-user-id'`;
    
    return NextResponse.json({
      success: true,
      totalItems: result[0]?.count || 0,
      testInsert: testInsert[0] ? 'SUCCESS' : 'FAILED',
      message: 'Database connection is working'
    });
  } catch (error: any) {
    console.error('Database test failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}