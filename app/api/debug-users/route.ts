import { NextResponse } from 'next/server';
import { sqlQuery } from '../../../lib/db';

export async function GET() {
  try {
    console.log('🔍 Checking users in database...');
    
    // Try to get all users (without passwords)
    const users = await sqlQuery`
      SELECT id, email, username, created_at 
      FROM users 
      ORDER BY created_at DESC
    `;
    
    console.log(`Found ${users.length} users in database`);
    
    return NextResponse.json({
      success: true,
      userCount: users.length,
      users: users.map(user => ({
        id: user.id,
        email: user.email,
        username: user.username,
        created_at: user.created_at
      }))
    });
    
  } catch (error: any) {
    console.error('❌ Error checking users:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      fallbackMode: true
    });
  }
}