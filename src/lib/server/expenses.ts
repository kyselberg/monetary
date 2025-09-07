import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { desc, eq } from 'drizzle-orm';

export async function createExpense(expense: table.Expenses): Promise<void> {
	await db.insert(table.expenses).values(expense);
}

export async function getExpenses(userId: string): Promise<table.Expenses[]> {
	return await db
		.select()
		.from(table.expenses)
		.where(eq(table.expenses.userId, userId))
		.orderBy(desc(table.expenses.date));
}

export async function updateExpense(
	id: string,
	updates: Partial<Omit<table.Expenses, 'id' | 'userId'>>
): Promise<void> {
	await db.update(table.expenses).set(updates).where(eq(table.expenses.id, id));
}

export async function deleteExpense(id: string): Promise<void> {
	await db.delete(table.expenses).where(eq(table.expenses.id, id));
}

export async function getExpensesSummary(
	userId: string
): Promise<{ total: number; average: number }> {
	const expenses = await getExpenses(userId);
	const total = expenses.reduce((sum, expense) => sum + expense.amountCents, 0);
	const average = total / expenses.length;
	return { total, average };
}
