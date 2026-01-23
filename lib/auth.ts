import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { accessUsers } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Check if the current user is verified
 * Returns the user's email if verified, null otherwise
 */
export async function checkUserVerification(request: NextRequest): Promise<{ verified: boolean; email?: string }> {
  try {
    // Check for verification cookie
    const verifiedEmail = request.cookies.get('mx_validator_verified_email')?.value;
    
    if (!verifiedEmail) {
      return { verified: false };
    }

    // Verify the email exists and is verified in the database
    const user = await db
      .select()
      .from(accessUsers)
      .where(eq(accessUsers.email, verifiedEmail))
      .limit(1);

    if (user.length === 0 || !user[0].isVerified) {
      return { verified: false };
    }

    return { verified: true, email: verifiedEmail };
  } catch (error) {
    console.error('Verification check error:', error);
    return { verified: false };
  }
}

/**
 * Set verification cookie after successful email verification
 */
export function setVerificationCookie(response: NextResponse, email: string) {
  response.cookies.set('mx_validator_verified_email', email, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: '/',
  });
}
