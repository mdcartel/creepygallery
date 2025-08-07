import { NextResponse } from 'next/server';
import { sqlQuery } from '../../../lib/db';

export async function GET() {
  try {
    // Test basic database connection
    const result = await sqlQuery`SELECT COUNT(*) as count FROM gallery_items`;
    
    // Test inserting a simple item
    const testInsert = await sqlQuery`
      INSERT INTO gallery_items (title, image_url, author, tags, chill_level, user_id) 
      VALUES ('Test Item', 'test-url', 'Test User', ARRAY['test'], 1, 'test-user-id') 
      RETURNING *
    `;
    
    // Clean up test item
    await sqlQuery`DELETE FROM gallery_items WHERE title = 'Test Item'`;
    
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