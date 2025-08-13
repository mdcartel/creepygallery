import { NextResponse } from 'next/server';
import { sqlQuery } from '../../../lib/db';

export async function GET() {
  try {
    console.log('🔍 Testing database connection and user queries...');
    
    // Test 1: Simple connection test
    const connectionTest = await sqlQuery`SELECT 1 as test`;
    console.log('✅ Database connection test:', connectionTest);
    
    // Test 2: Check if users table exists and get count
    const userCount = await sqlQuery`SELECT COUNT(*) as count FROM users`;
    console.log('✅ User count query:', userCount);
    
    // Test 3: Try to get all users (without passwords)
    const users = await sqlQuery`SELECT id, email, username, created_at FROM users ORDER BY created_at DESC LIMIT 5`;
    console.log('✅ Users query:', users);
    
    return NextResponse.json({
      success: true,
      message: 'Database tests completed',
      tests: {
        connection: connectionTest,
        userCount: userCount[0]?.count || 0,
        recentUsers: users
      }
    });
    
  } catch (error: any) {
    console.error('❌ Database test failed:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Database test failed',
      error: error.message
    });
  }
}