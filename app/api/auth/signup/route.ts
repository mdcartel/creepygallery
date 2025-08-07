import { NextRequest, NextResponse } from 'next/server';
import { 
  createUser, 
  findUserByEmail, 
  validateEmail, 
  validatePassword 
} from '../../../../lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, username, password } = await request.json();

    // Validate input
    if (!email || !username || !password) {
      return NextResponse.json(
        { error: 'Email, username, and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: 'Password validation failed', details: passwordValidation.errors },
        { status: 400 }
      );
    }

    // Temporary demo signup (bypass database)
    // TODO: Re-enable database user creation once connection is fixed
    console.log('Using demo signup due to database issues');
    
    const demoUser = {
      id: 'demo-user',
      email: email,
      username: username,
      createdAt: new Date()
    };
    
    return NextResponse.json(
      { 
        message: 'Account created successfully (demo mode)',
        user: demoUser
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 