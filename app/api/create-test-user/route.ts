import { NextResponse } from 'next/server';
import { createUser } from '../../../lib/auth';

export async function POST() {
  try {
    console.log('🧪 Creating test user...');
    
    const testEmail = 'test@creepygallery.com';
    const testUsername = 'TestUser';
    const testPassword = 'Test123!';
    
    const user = await createUser(testEmail, testUsername, testPassword);
    
    console.log('✅ Test user created successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Test user created successfully',
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      },
      credentials: {
        email: testEmail,
        password: testPassword
      }
    });
    
  } catch (error: any) {
    console.error('❌ Error creating test user:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message
    });
  }
}