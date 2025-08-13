import { NextResponse } from 'next/server';
import { sqlQuery } from '../../../../lib/db';

export async function DELETE() {
  try {
    console.log('🗑️ Admin: Clearing all users and their data...');
    
    // First delete all gallery items (foreign key constraint)
    await sqlQuery`DELETE FROM gallery_items`;
    console.log('✅ Admin: All gallery items cleared');
    
    // Then delete all users
    await sqlQuery`DELETE FROM users`;
    console.log('✅ Admin: All users cleared');
    
    return NextResponse.json({
      success: true,
      message: 'All users and gallery items have been cleared successfully. Fresh start ready!'
    });
    
  } catch (error: any) {
    console.error('❌ Admin: Error clearing users:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}