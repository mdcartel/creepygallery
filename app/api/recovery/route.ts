import { NextResponse } from 'next/server';
import { attemptDatabaseRecovery } from '../../../lib/db-recovery';

export async function GET() {
  try {
    console.log('🔄 Manual database recovery triggered...');
    const items = await attemptDatabaseRecovery();
    
    return NextResponse.json({
      success: true,
      message: `Found ${items.length} items in database`,
      items: items.map(item => ({
        id: item.id,
        title: item.title,
        author: item.author,
        date_uploaded: item.date_uploaded,
        hasImage: !!item.image_url
      }))
    });
  } catch (error: any) {
    console.error('❌ Recovery API error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}