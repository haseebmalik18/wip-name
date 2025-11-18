import { NextRequest, NextResponse } from 'next/server';
import { createUser } from '@/lib/users';
import { hashPassword, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, fullName } = body;

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Email, password, and full name are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const user = await createUser({
      email,
      fullName,
      password: hashedPassword,
    });

    const token = generateToken({
      userId: user._id!,
      email: user.email,
      fullName: user.fullName,
    });

    return NextResponse.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
      },
    });
  } catch (error: any) {
    if (error.message === 'User with this email already exists') {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    );
  }
}
