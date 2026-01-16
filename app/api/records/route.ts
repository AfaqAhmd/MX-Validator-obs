import { NextResponse } from 'next/server';
import { db } from '@/db';
import { emailRecords } from '@/db/schema';
import { desc } from 'drizzle-orm';

export async function GET() {
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
