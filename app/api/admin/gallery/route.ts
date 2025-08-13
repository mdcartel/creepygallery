import { NextRequest, NextResponse } from 'next/server';
import { sqlQuery } from '../../../../lib/db';

// Get all gallery items
export async function GET() {
  try {
    console.log('🔍 Admin: Fetching all gallery items...');
    
    const items = await sqlQuery`
      SELECT 
        id, title, image_url, author, user_id, 
        date_uploaded, downloads, tags, chill_level
      FROM gallery_items 
      ORDER BY date_uploaded DESC
    `;
    
    console.log(`✅ Admin: Found ${items.length} gallery items`);
    
    return NextResponse.json({
      success: true,
      items: items
    });
    
  } catch (error: any) {
    console.error('❌ Admin: Error fetching gallery items:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      items: []
    });
  }
}

// Delete gallery item
export async function DELETE(request: NextRequest) {
  try {
    const { itemId } = await request.json();
    
    if (!itemId) {
      return NextResponse.json(
        { success: false, error: 'Item ID is required' },
        { status: 400 }
      );
    }
    
    console.log('🗑️ Admin: Deleting gallery item:', itemId);
    
    const result = await sqlQuery`
      DELETE FROM gallery_items WHERE id = ${itemId}
    `;
    
    console.log('✅ Admin: Gallery item deleted');
    
    return NextResponse.json({
      success: true,
      message: 'Gallery item deleted successfully'
    });
    
  } catch (error: any) {
    console.error('❌ Admin: Error deleting gallery item:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}