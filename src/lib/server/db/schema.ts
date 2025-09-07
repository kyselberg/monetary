import { relations } from 'drizzle-orm';
import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
	id: text('id').primaryKey(),
	age: integer('age'),
	username: text('username').notNull().unique(),
	passwordHash: text('password_hash').notNull()
});

export const session = pgTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
});

export const expenses = pgTable('expenses', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	name: text('name').notNull().default(''),
	date: timestamp('date', { withTimezone: false, mode: 'date' }).notNull().defaultNow(),
	amountCents: integer('amount_cents').notNull()
});

export const expensesRelations = relations(expenses, ({ one }) => ({
	user: one(user, {
		fields: [expenses.userId],
		references: [user.id]
	})
}));

export const userRelations = relations(user, ({ many }) => ({
	expenses: many(expenses)
}));

export type Expenses = typeof expenses.$inferSelect;

export type Session = typeof session.$inferSelect;

export type User = typeof user.$inferSelect;
