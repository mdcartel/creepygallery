import { NextResponse } from 'next/server';
import { sqlQuery, getDatabaseStatus } from '../../../../lib/db';

export async function GET() {
  try {
    console.log('🔍 Admin Debug: Checking database status...');
    
    // Check database status
    const dbStatus = getDatabaseStatus();
    console.log('📊 Database status:', dbStatus);
    
    // Test connection
    const connectionTest = await sqlQuery`SELECT 1 as test`;
    console.log('✅ Connection test:', connectionTest);
    
    // Check users table
    const userCount = await sqlQuery`SELECT COUNT(*) as count FROM users`;
    console.log('👥 User count in DB:', userCount);
    
    // Check if table exists
    const tableCheck = await sqlQuery`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'users'
    `;
    console.log('🗃️ Users table exists:', tableCheck);
    
    // Try to get all users
    const allUsers = await sqlQuery`SELECT id, email, username, created_at FROM users`;
    console.log('📋 All users:', allUsers);
    
    return NextResponse.json({
      success: true,
      debug: {
        databaseStatus: dbStatus,
        connectionTest: connectionTest,
        userCount: userCount[0]?.count || 0,
        tableExists: tableCheck.length > 0,
        allUsers: allUsers
      }
    });
    
  } catch (error: any) {
    console.error('❌ Admin Debug error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message
    });
  }
}