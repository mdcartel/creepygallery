import { NextResponse } from 'next/server';
import { sqlQuery } from '../../../../lib/db';

export async function DELETE() {
  try {
    console.log('🗑️ Admin: Clearing all gallery items...');
    
    // Delete all gallery items
    const result = await sqlQuery`
      DELETE FROM gallery_items
    `;
    
    console.log('✅ Admin: All gallery items cleared');
    
    return NextResponse.json({
      success: true,
      message: 'All gallery items have been cleared successfully'
    });
    
  } catch (error: any) {
    console.error('❌ Admin: Error clearing gallery:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}