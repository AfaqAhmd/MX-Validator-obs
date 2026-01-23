import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { emailRecords } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { checkUserVerification } from '@/lib/auth';

export async function GET(request: NextRequest) {
  // Check if user is verified
  const verification = await checkUserVerification(request);
  if (!verification.verified) {
    return NextResponse.json(
      { error: 'Unauthorized. Please verify your email to access this tool.' },
      { status: 401 }
    );
  }

  try {
    const records = await db.select().from(emailRecords).orderBy(desc(emailRecords.createdAt));
    
    return NextResponse.json(records);
  } catch (error) {
    console.error('Error fetching records:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
