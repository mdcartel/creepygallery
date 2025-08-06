import { NextRequest, NextResponse } from 'next/server';
import { 
  findUserByEmail, 
  verifyPassword, 
  generateToken 
} from '../../../../lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    try {
      // Find user by email
      const user = await findUserByEmail(email);
      if (!user) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }

      // Verify password
      const isValidPassword = await verifyPassword(password, user.password);
      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }

      // Generate JWT token
      const token = generateToken(user);

      // Return success with token
      const { password: _, ...userWithoutPassword } = user;
      
      return NextResponse.json(
        { 
          message: 'Login successful',
          user: userWithoutPassword,
          token
        },
        { status: 200 }
      );
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Authentication service temporarily unavailable' },
        { status: 503 }
      );
    }

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 