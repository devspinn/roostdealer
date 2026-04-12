import { pgTable, text, timestamp, uuid, integer } from 'drizzle-orm/pg-core'
import { dealers } from './dealers'

export const testimonials = pgTable('testimonials', {
  id: uuid('id').primaryKey().defaultRandom(),
  dealerId: uuid('dealer_id').notNull().references(() => dealers.id, { onDelete: 'cascade' }),
  reviewerName: text('reviewer_name').notNull(),
  rating: integer('rating').notNull(),
  text: text('text').notNull(),
  source: text('source'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})
