import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail } from '../../../lib/auth';
import { getDatabaseStatus } from '../../../lib/db';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    const debug = {
      timestamp: new Date().toISOString(),
      email: email,
      databaseStatus: null as any,
      userFound: false,
      userDetails: null as any,
      error: null as any
    };

    // Check database status
    try {
      debug.databaseStatus = getDatabaseStatus();
    } catch (error: any) {
      debug.databaseStatus = { error: error.message };
    }

    // Try to find user
    try {
      const user = await findUserByEmail(email);
      debug.userFound = !!user;
      if (user) {
        debug.userDetails = {
          id: user.id,
          email: user.email,
          username: user.username,
          hasPassword: !!user.password,
          passwordLength: user.password?.length || 0
        };
      }
    } catch (error: any) {
      debug.error = error.message;
    }

    return NextResponse.json(debug);
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}