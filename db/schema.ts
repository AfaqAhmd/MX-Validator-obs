import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const emailRecords = pgTable('email_records', {
  id: serial('id').primaryKey(),
  email: text('email').notNull(),
  domain: text('domain').notNull(),
  mxRecords: text('mx_records').array(),
  mxScanStatus: text('mx_scan_status').default('pending').notNull(),
  sessionId: text('session_id').default('').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
