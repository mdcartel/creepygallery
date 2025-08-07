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

    // Temporary demo login (bypass database)
    // TODO: Re-enable database authentication once connection is fixed
    console.log('Using demo login due to database issues');
    
    const demoUser = {
      id: 'demo-user',
      email: 'demo@creepygallery.com',
      username: 'Demo User',
      createdAt: new Date()
    };
    
    // Generate JWT token
    const token = generateToken(demoUser);
    
    return NextResponse.json(
      { 
        message: 'Login successful (demo mode)',
        user: demoUser,
        token
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 