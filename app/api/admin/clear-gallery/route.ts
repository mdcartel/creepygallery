import { NextResponse } from 'next/server';
import { sqlQuery } from '../../../../lib/db';

export async function DELETE() {
  try {
    console.log('🗑️ Admin: Clearing all gallery items from all sources...');
    
    // Clear database gallery items
    try {
      await sqlQuery`DELETE FROM gallery_items`;
      console.log('✅ Admin: Database gallery items cleared');
    } catch (dbError) {
      console.error('❌ Database clear failed:', dbError);
    }
    
    // Clear ImageKit items
    try {
      const ImageKit = require('imagekit');
      const imagekit = new ImageKit({
        publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
        privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
        urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
      });
      
      // List all files in the creepy-gallery folder
      const files = await imagekit.listFiles({
        path: '/creepy-gallery/',
        includeFolder: false
      });
      
      console.log(`🔍 Found ${files.length} files in ImageKit to delete`);
      
      // Delete each file
      for (const file of files) {
        try {
          await imagekit.deleteFile(file.fileId);
          console.log(`✅ Deleted ImageKit file: ${file.name}`);
        } catch (deleteError) {
          console.error(`❌ Failed to delete ImageKit file ${file.name}:`, deleteError);
        }
      }
      
      console.log('✅ Admin: ImageKit gallery items cleared');
    } catch (imagekitError) {
      console.error('❌ ImageKit clear failed:', imagekitError);
    }
    
    // Clear memory storage
    try {
      const { clearAllGalleryItems } = require('../../../../lib/memory-storage');
      clearAllGalleryItems();
      console.log('✅ Admin: Memory storage cleared');
    } catch (memoryError) {
      console.error('❌ Memory storage clear failed:', memoryError);
    }
    
    return NextResponse.json({
      success: true,
      message: 'All gallery items have been cleared from database, ImageKit, and memory storage'
    });
    
  } catch (error: any) {
    console.error('❌ Admin: Error clearing gallery:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}