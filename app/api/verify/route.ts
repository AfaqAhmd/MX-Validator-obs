import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be set');
}

const sql = neon(process.env.DATABASE_URL);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(new URL('/?error=invalid_token', request.url));
    }

    // Verify token and update user
    const result = await sql`
      UPDATE access_users
      SET is_verified = true, verified_at = now()
      WHERE verification_token = ${token} AND is_verified = false
      RETURNING id, email
    `;

    if (result.length === 0) {
      return NextResponse.redirect(new URL('/?error=invalid_or_expired_token', request.url));
    }

    // Redirect to main page with success
    return NextResponse.redirect(new URL('/?verified=true', request.url));
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.redirect(new URL('/?error=verification_failed', request.url));
  }
}
