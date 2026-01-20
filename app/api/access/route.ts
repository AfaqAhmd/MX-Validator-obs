import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { promises as dns } from 'dns';
import { randomBytes } from 'crypto';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be set');
}

const sql = neon(process.env.DATABASE_URL);

// Email sending function using Resend
async function sendVerificationEmail(email: string, name: string, token: string, request?: NextRequest) {
  // Get base URL from request headers, environment variables, or default to localhost
  let baseUrl: string = '';
  
  // First, try to get from environment variable
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  }
  // If not set, try to construct from request URL
  else if (request) {
    try {
      const url = new URL(request.url);
      baseUrl = `${url.protocol}//${url.host}`;
    } catch {
      // If URL parsing fails, try headers
      const protocol = request.headers.get('x-forwarded-proto') || 'http';
      const host = request.headers.get('host') || request.headers.get('x-forwarded-host');
      if (host) {
        baseUrl = `${protocol}://${host}`;
      }
    }
  }
  
  // Fallback to VERCEL_URL if available
  if (!baseUrl && process.env.VERCEL_URL) {
    baseUrl = `https://${process.env.VERCEL_URL}`;
  }
  
  // Final fallback to localhost
  if (!baseUrl) {
    baseUrl = 'http://localhost:3000';
  }
  
  // Ensure baseUrl doesn't have trailing slash
  baseUrl = baseUrl.replace(/\/$/, '');
  
  const verificationLink = `${baseUrl}/api/verify?token=${token}`;

  // If Resend API key is not set, log the link for development
  if (!process.env.RESEND_API_KEY) {
    console.log('⚠️  RESEND_API_KEY not set. Verification link:', verificationLink);
    console.log('📧 Email would be sent to:', email);
    return true; // Return success for development
  }

  try {
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'MX Validator <noreply@outreachboosters.io>',
      to: email,
      subject: 'Verify your email for MX Validator',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Your Email</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(90deg, rgba(30, 44, 92, 1) 0%, rgba(22, 79, 161, 1) 50%, rgba(30, 44, 92, 1) 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">MX Validator</h1>
            </div>
            <div style="background: #ffffff; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
              <h2 style="color: #1e2c5c; margin-top: 0;">Hi ${name},</h2>
              <p>Thank you for signing up for MX Validator! Please verify your email address to get started.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationLink}" style="display: inline-block; background: linear-gradient(90deg, rgba(30, 44, 92, 1) 0%, rgba(22, 79, 161, 1) 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">Verify Email Address</a>
              </div>
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="color: #3b82f6; font-size: 12px; word-break: break-all;">${verificationLink}</p>
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">This link will expire in 24 hours.</p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">If you didn't request this verification email, you can safely ignore it.</p>
            </div>
            <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
              <p>© ${new Date().getFullYear()} OutreachBoosters. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Failed to send verification email:', error);
    // In development, still return true so the flow continues
    if (!process.env.RESEND_API_KEY) {
      return true;
    }
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, company, email } = await request.json();

    if (!name || !company || !email) {
      return NextResponse.json(
        { error: 'Name, company, and email are required.' },
        { status: 400 }
      );
    }

    const trimmedEmail = String(email).trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    const domain = trimmedEmail.split('@')[1];
    if (!domain) {
      return NextResponse.json(
        { error: 'Could not extract domain from email.' },
        { status: 400 }
      );
    }

    // Verify email domain by checking MX records
    try {
      const mxRecords = await dns.resolveMx(domain);
      if (!mxRecords || mxRecords.length === 0) {
        return NextResponse.json(
          { error: 'Email domain does not have valid MX records.' },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: 'Email domain is not reachable or has no MX records.' },
        { status: 400 }
      );
    }

    // Generate verification token
    const verificationToken = randomBytes(32).toString('hex');

    // Create table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS access_users (
        id serial PRIMARY KEY,
        name text NOT NULL,
        company text NOT NULL,
        email text NOT NULL UNIQUE,
        verification_token text NOT NULL,
        is_verified boolean DEFAULT false,
        created_at timestamptz DEFAULT now(),
        verified_at timestamptz
      )
    `;

    // Check if user already exists
    const existingUser = await sql`
      SELECT id, is_verified FROM access_users WHERE email = ${trimmedEmail}
    `;

    if (existingUser.length > 0) {
      const user = existingUser[0] as { is_verified: boolean };
      if (user.is_verified) {
        // Email already verified: allow access immediately without sending another email
        return NextResponse.json({
          success: true,
          alreadyVerified: true,
          message: 'Email already verified. You can access the tool.',
        });
      }
      // Update existing user with new token
      await sql`
        UPDATE access_users
        SET verification_token = ${verificationToken}, name = ${name}, company = ${company}
        WHERE email = ${trimmedEmail}
      `;
    } else {
      // Insert new user
      await sql`
        INSERT INTO access_users (name, company, email, verification_token)
        VALUES (${name}, ${company}, ${trimmedEmail}, ${verificationToken})
      `;
    }

    // Send verification email
    try {
      await sendVerificationEmail(trimmedEmail, name, verificationToken, request);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Continue anyway - email might be sent via background job
    }

    return NextResponse.json({ 
      success: true,
      message: 'Verification email sent. Please check your inbox.' 
    });
  } catch (error) {
    console.error('Access API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error. Please try again later.',
      },
      { status: 500 }
    );
  }
}
