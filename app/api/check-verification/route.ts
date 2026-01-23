import { NextRequest, NextResponse } from 'next/server';
import { checkUserVerification } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const verification = await checkUserVerification(request);
  
  return NextResponse.json({
    verified: verification.verified,
  });
}
