import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../../../lib/auth';

export async function POST(request: NextRequest) {
  const debug = {
    timestamp: new Date().toISOString(),
    headers: {},
    auth: {},
    formData: {},
    error: null
  };

  try {
    // Check headers
    debug.headers = {
      authorization: request.headers.get('authorization') ? 'present' : 'missing',
      contentType: request.headers.get('content-type') || 'missing'
    };

    // Check auth
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const user = verifyToken(token);
        debug.auth = {
          tokenPresent: true,
          tokenValid: !!user,
          user: user ? { id: user.id, username: user.username } : null
        };
      } catch (error: any) {
        debug.auth = {
          tokenPresent: true,
          tokenValid: false,
          error: error.message
        };
      }
    } else {
      debug.auth = {
        tokenPresent: false,
        tokenValid: false
      };
    }

    // Check form data
    try {
      const formData = await request.formData();
      debug.formData = {
        title: formData.get('title') ? 'present' : 'missing',
        tags: formData.get('tags') ? 'present' : 'missing',
        chillLevel: formData.get('chillLevel') ? 'present' : 'missing',
        file: formData.get('file') ? 'present' : 'missing'
      };
    } catch (error: any) {
      debug.formData = { error: error.message };
    }

  } catch (error: any) {
    debug.error = error.message;
  }

  return NextResponse.json(debug);
}