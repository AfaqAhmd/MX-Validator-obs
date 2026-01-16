import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be set');
}

const sql = neon(process.env.DATABASE_URL);

export async function POST() {
  try {
    // Add session_id column if it doesn't exist
    await sql`
      ALTER TABLE "email_records" 
      ADD COLUMN IF NOT EXISTS "session_id" text NOT NULL DEFAULT ''
    `;
    
    return NextResponse.json({ 
      message: 'Migration completed successfully',
      success: true 
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      {
        error: 'Migration failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
