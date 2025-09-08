import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function createCategory(category: table.Categories): Promise<void> {
	await db.insert(table.categories).values(category);
}

export async function getCategories(userId: string): Promise<table.Categories[]> {
	return await db.select().from(table.categories).where(eq(table.categories.userId, userId));
}

export async function updateCategory(
	id: string,
	updates: Partial<Omit<table.Categories, 'id' | 'userId'>>
): Promise<void> {
	await db.update(table.categories).set(updates).where(eq(table.categories.id, id));
}

export async function deleteCategory(id: string): Promise<void> {
	await db.delete(table.categories).where(eq(table.categories.id, id));
}
