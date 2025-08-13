import { NextResponse } from 'next/server';
import { sqlQuery } from '../../../lib/db';

export async function GET() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Try a simple query to test the connection
    const result = await sqlQuery`SELECT 1 as test`;
    
    console.log('✅ Database query successful:', result);
    
    return NextResponse.json({
      success: true,
      message: 'Database connection working',
      result: result
    });
    
  } catch (error: any) {
    console.error('❌ Database connection failed:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Database connection failed - using fallback storage',
      error: error.message
    });
  }
}