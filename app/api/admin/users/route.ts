import { NextRequest, NextResponse } from 'next/server';
import { sqlQuery } from '../../../../lib/db';

// Get all users
export async function GET() {
  try {
    console.log('🔍 Admin: Fetching all users...');
    
    const users = await sqlQuery`
      SELECT id, email, username, created_at 
      FROM users 
      ORDER BY created_at DESC
    `;
    
    console.log(`✅ Admin: Found ${users.length} users`);
    
    return NextResponse.json({
      success: true,
      users: users
    });
    
  } catch (error: any) {
    console.error('❌ Admin: Error fetching users:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      users: []
    });
  }
}

// Delete user
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    console.log('🗑️ Admin: Deleting user:', userId);
    
    // First delete all gallery items by this user
    await sqlQuery`
      DELETE FROM gallery_items WHERE user_id = ${userId}
    `;
    
    // Then delete the user
    const result = await sqlQuery`
      DELETE FROM users WHERE id = ${userId}
    `;
    
    console.log('✅ Admin: User and their gallery items deleted');
    
    return NextResponse.json({
      success: true,
      message: 'User and their gallery items deleted successfully'
    });
    
  } catch (error: any) {
    console.error('❌ Admin: Error deleting user:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}