import { pgTable, serial, text, timestamp, boolean } from 'drizzle-orm/pg-core';

export const emailRecords = pgTable('email_records', {
  id: serial('id').primaryKey(),
  email: text('email').notNull(),
  domain: text('domain').notNull(),
  mxRecords: text('mx_records').array(),
  mxScanStatus: text('mx_scan_status').default('pending').notNull(),
  sessionId: text('session_id').default('').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const accessUsers = pgTable('access_users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  company: text('company').notNull(),
  email: text('email').notNull().unique(),
  verificationToken: text('verification_token').notNull(),
  isVerified: boolean('is_verified').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  verifiedAt: timestamp('verified_at'),
});
