import { NextResponse } from 'next/server';
import { createUser, findUserByEmail } from '../../../lib/auth';

export async function POST() {
  try {
    const testEmail = 'test@creepygallery.com';
    const testUsername = 'TestUser';
    const testPassword = 'password123';

    // Check if user already exists
    try {
      const existingUser = await findUserByEmail(testEmail);
      if (existingUser) {
        return NextResponse.json({
          success: true,
          message: 'Test user already exists',
          credentials: {
            email: testEmail,
            password: testPassword,
            username: testUsername
          }
        });
      }
    } catch (error) {
      console.log('User lookup failed, proceeding to create user');
    }

    // Create test user
    try {
      const user = await createUser(testEmail, testUsername, testPassword);
      return NextResponse.json({
        success: true,
        message: 'Test user created successfully',
        credentials: {
          email: testEmail,
          password: testPassword,
          username: testUsername
        },
        user: {
          id: user.id,
          email: user.email,
          username: user.username
        }
      });
    } catch (createError: any) {
      return NextResponse.json({
        success: false,
        message: 'Failed to create test user',
        error: createError.message,
        fallbackCredentials: {
          email: testEmail,
          password: testPassword,
          note: 'Try using these credentials anyway - demo mode might work'
        }
      });
    }

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}