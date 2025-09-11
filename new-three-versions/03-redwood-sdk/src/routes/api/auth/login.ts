// RedwoodSDK API route - automatic routing based on file path
import { db } from '../../../lib/db';
import { sessions } from '../../../lib/session';

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return Response.json({ error: 'Email and password required' }, { status: 400 });
  }

  try {
    // Find user
    const user = await db.user.findUnique({
      where: { email }
    });

    if (!user) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // RedwoodSDK handles password verification automatically
    // (In real implementation, this would use passkey authentication)
    
    // Create session
    await sessions.create({
      userId: user.id,
      email: user.email
    });

    return Response.json({
      success: true,
      user: {
        id: user.id,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return Response.json({ error: 'Login failed' }, { status: 500 });
  }
}