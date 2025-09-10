import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { and, desc, eq, sql } from 'drizzle-orm';

export async function createExpense(expense: table.Expenses): Promise<void> {
	await db.insert(table.expenses).values(expense);
}

export async function createMultipleExpenses(expenses: table.Expenses[]): Promise<void> {
	if (expenses.length === 0) return;
	await db.insert(table.expenses).values(expenses);
}

export async function getExpenses(userId: string): Promise<table.Expenses[]> {
	return await db
		.select()
		.from(table.expenses)
		.where(eq(table.expenses.userId, userId))
		.orderBy(desc(table.expenses.date));
}

export async function getOwnExpensesByCategory(
	userId: string,
	categoryId: string
): Promise<table.Expenses[]> {
	return await db
		.select()
		.from(table.expenses)
		.where(and(eq(table.expenses.userId, userId), eq(table.expenses.categoryId, categoryId)))
		.orderBy(desc(table.expenses.date));
}

export async function getExpensesByCategory(categoryId: string): Promise<table.Expenses[]> {
	return await db
		.select()
		.from(table.expenses)
		.where(eq(table.expenses.categoryId, categoryId))
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
): Promise<{ total: number; average: number; median: number }> {
	const expenses = await getExpenses(userId);
	const total = expenses.reduce((sum, expense) => sum + expense.amountCents, 0);
	const average = expenses.length > 0 ? total / expenses.length : 0;

	let median = 0;
	if (expenses.length > 0) {
		const sortedAmounts = expenses.map((e) => e.amountCents).sort((a, b) => a - b);
		const mid = Math.floor(sortedAmounts.length / 2);
		median =
			sortedAmounts.length % 2 === 0
				? (sortedAmounts[mid - 1] + sortedAmounts[mid]) / 2
				: sortedAmounts[mid];
	}

	return { total, average, median };
}

export async function getOwnExpensesByCategorySummary(
	userId: string,
	categoryId: string
): Promise<{ total: number; average: number; median: number }> {
	const expenses = await getOwnExpensesByCategory(userId, categoryId);
	const total = expenses.reduce((sum, expense) => sum + expense.amountCents, 0);
	const average = expenses.length > 0 ? total / expenses.length : 0;

	let median = 0;
	if (expenses.length > 0) {
		const sortedAmounts = expenses.map((e) => e.amountCents).sort((a, b) => a - b);
		const mid = Math.floor(sortedAmounts.length / 2);
		median =
			sortedAmounts.length % 2 === 0
				? (sortedAmounts[mid - 1] + sortedAmounts[mid]) / 2
				: sortedAmounts[mid];
	}

	return { total, average, median };
}

export async function getMostFrequentCategories(
	userId: string
): Promise<{ categoryId: string | null; count: number }[]> {
	const result = await db
		.select({ categoryId: table.expenses.categoryId, count: sql<number>`count(*)` })
		.from(table.expenses)
		.where(eq(table.expenses.userId, userId))
		.groupBy(table.expenses.categoryId)
		.orderBy(desc(sql<number>`count`));

	return result;
}

export async function getBiggestCategories(
	userId: string
): Promise<{ categoryId: string | null; amount: number }[]> {
	return await db
		.select({ categoryId: table.expenses.categoryId, amount: sql<number>`sum(amount_cents)` })
		.from(table.expenses)
		.where(eq(table.expenses.userId, userId))
		.groupBy(table.expenses.categoryId)
		.orderBy(desc(sql<number>`sum(amount_cents)`));
}
