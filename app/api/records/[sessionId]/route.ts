import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { emailRecords } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const records = await db
      .select()
      .from(emailRecords)
      .where(eq(emailRecords.sessionId, sessionId))
      .orderBy(desc(emailRecords.createdAt));
    
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
