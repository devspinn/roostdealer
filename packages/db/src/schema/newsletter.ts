import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { dealers } from './dealers'

export const newsletterSignups = pgTable('newsletter_signups', {
  id: uuid('id').primaryKey().defaultRandom(),
  dealerId: uuid('dealer_id').notNull().references(() => dealers.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})
