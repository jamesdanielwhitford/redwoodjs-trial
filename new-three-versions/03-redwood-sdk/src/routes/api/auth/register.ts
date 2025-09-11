// RedwoodSDK API route - automatic routing based on file path
import { db } from '../../../lib/db';
import { sessions } from '../../../lib/session';

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return Response.json({ error: 'Email and password required' }, { status: 400 });
  }

  try {
    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return Response.json({ error: 'User already exists' }, { status: 400 });
    }

    // Create user (RedwoodSDK handles password hashing automatically)
    const user = await db.user.create({
      data: { email }
    });

    // Create session (RedwoodSDK handles session creation with Durable Objects)
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
    console.error('Registration error:', error);
    return Response.json({ error: 'Registration failed' }, { status: 500 });
  }
}