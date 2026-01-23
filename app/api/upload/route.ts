import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { emailRecords } from '@/db/schema';
import { parse } from 'papaparse';
import { promises as dns } from 'dns';
import { eq, and } from 'drizzle-orm';
import { checkUserVerification } from '@/lib/auth';

export async function POST(request: NextRequest) {
  // Check if user is verified
  const verification = await checkUserVerification(request);
  if (!verification.verified) {
    return NextResponse.json(
      { error: 'Unauthorized. Please verify your email to access this tool.' },
      { status: 401 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Read and parse CSV
    const text = await file.text();
    const parseResult = parse(text, {
      header: true,
      skipEmptyLines: true,
    });

    if (parseResult.errors.length > 0) {
      return NextResponse.json(
        { error: 'CSV parsing failed', details: parseResult.errors },
        { status: 400 }
      );
    }

    const records = parseResult.data as Array<Record<string, string>>;

    if (records.length === 0) {
      return NextResponse.json({ error: 'CSV file is empty' }, { status: 400 });
    }

    // Validate CSV has required columns
    const firstRecord = records[0];
    if (!firstRecord.email && !firstRecord.domain) {
      return NextResponse.json(
        { error: 'CSV must contain "email" or "domain" column' },
        { status: 400 }
      );
    }

    // Process records and extract domains
    const recordsToInsert = records.map((record) => {
      let email = record.email || '';
      let domain = record.domain || '';

      // Extract domain from email if domain not provided
      if (!domain && email) {
        const emailMatch = email.match(/@([^\s]+)/);
        domain = emailMatch ? emailMatch[1] : '';
      }

      // Extract email if only domain provided (create placeholder)
      if (!email && domain) {
        email = `placeholder@${domain}`;
      }

      return {
        email: email.trim(),
        domain: domain.trim(),
      };
    }).filter((r) => r.domain && r.email);

    if (recordsToInsert.length === 0) {
      return NextResponse.json(
        { error: 'No valid records found in CSV' },
        { status: 400 }
      );
    }

    // Generate unique sessionId for this upload
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

    // Insert records into database with pending status and sessionId
    const insertedRecords = await db
      .insert(emailRecords)
      .values(
        recordsToInsert.map((r) => ({
          email: r.email,
          domain: r.domain,
          mxScanStatus: 'pending',
          sessionId: sessionId,
        }))
      )
      .returning();

    // Scan MX records for each unique domain
    const uniqueDomains = [...new Set(recordsToInsert.map((r) => r.domain))];
    
    for (const domain of uniqueDomains) {
      try {
        const mxRecords = await dns.resolveMx(domain);
        const mxRecordsString = mxRecords
          .sort((a, b) => a.priority - b.priority)
          .map((mx) => `${mx.priority} ${mx.exchange}`);

        // Update all records with this domain and sessionId
        await db
          .update(emailRecords)
          .set({
            mxRecords: mxRecordsString,
            mxScanStatus: 'completed',
          })
          .where(and(eq(emailRecords.domain, domain), eq(emailRecords.sessionId, sessionId)));
      } catch (error) {
        // Update status to failed for this domain and sessionId
        await db
          .update(emailRecords)
          .set({
            mxScanStatus: 'failed',
          })
          .where(and(eq(emailRecords.domain, domain), eq(emailRecords.sessionId, sessionId)));
      }
    }

    return NextResponse.json({
      message: 'File processed successfully',
      recordsProcessed: insertedRecords.length,
      sessionId: sessionId,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
