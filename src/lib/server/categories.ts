import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { and, eq } from 'drizzle-orm';
import { getExpensesByCategory } from './expenses';

export async function createCategory(category: table.Categories): Promise<void> {
	await db.insert(table.categories).values(category);
}

export async function getCategories(userId: string): Promise<table.Categories[]> {
	return await db.select().from(table.categories).where(eq(table.categories.userId, userId));
}

export async function getCategory(id: string, userId: string): Promise<table.Categories | null> {
	const result = await db
		.select()
		.from(table.categories)
		.where(and(eq(table.categories.id, id), eq(table.categories.userId, userId)))
		.limit(1);

	return result[0] || null;
}

export async function updateCategory(
	id: string,
	updates: Partial<Omit<table.Categories, 'id' | 'userId'>>
): Promise<void> {
	await db.update(table.categories).set(updates).where(eq(table.categories.id, id));
}

export async function deleteCategory(id: string): Promise<void> {
	const expenses = await getExpensesByCategory(id);
	if (expenses.length > 0) {
		throw new Error('Category has associated expenses');
	}
	await db.delete(table.categories).where(eq(table.categories.id, id));
}
