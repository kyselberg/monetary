import { requireLogin } from '$lib';
import * as auth from '$lib/server/auth';
import { getCategories, updateCategory } from '$lib/server/categories';
import type * as table from '$lib/server/db/schema';
import { createExpense, deleteExpense, updateExpense } from '$lib/server/expenses';
import type { RequestEvent } from '@sveltejs/kit';
import { fail, redirect } from '@sveltejs/kit';
import { nanoid } from 'nanoid';

export async function handleLogout(event: RequestEvent) {
	if (!event.locals.session) {
		return fail(401);
	}
	await auth.invalidateSession(event.locals.session.id);
	auth.deleteSessionTokenCookie(event);

	return redirect(302, '/login');
}

export async function handleCreateExpense(event: RequestEvent) {
	const user = requireLogin();
	const data = await event.request.formData();

	const name = data.get('name')?.toString();
	const amount = data.get('amount')?.toString();
	const date = data.get('date')?.toString();
	const categoryIdRaw = data.get('categoryId')?.toString();

	if (!name || !amount || !date) {
		return fail(400, { message: 'Missing required fields' });
	}

	const amountValue = parseFloat(amount);
	if (isNaN(amountValue) || amountValue <= 0) {
		return fail(400, { message: 'Invalid amount' });
	}

	// Convert UAH to cents
	const amountCents = Math.round(amountValue * 100);

	const expense: table.Expenses = {
		id: nanoid(),
		userId: user.id,
		name,
		amountCents,
		date: new Date(date),
		categoryId: categoryIdRaw && categoryIdRaw.length > 0 ? categoryIdRaw : null
	};

	await createExpense(expense);
	return {
		success: true
	};
}

export async function handleDeleteExpense(event: RequestEvent) {
	requireLogin(); // Ensure user is authenticated
	const data = await event.request.formData();
	const expenseId = data.get('expenseId')?.toString();

	if (!expenseId) {
		return fail(400, { message: 'Missing expense ID' });
	}

	await deleteExpense(expenseId);
	return {
		success: true
	};
}

export async function handleUpdateExpense(event: RequestEvent) {
	requireLogin(); // Ensure user is authenticated
	const data = await event.request.formData();

	const expenseId = data.get('expenseId')?.toString();
	const name = data.get('name')?.toString();
	const amount = data.get('amount')?.toString();
	const date = data.get('date')?.toString();
	const categoryIdRaw = data.get('categoryId')?.toString();

	if (!expenseId || !name || !amount || !date) {
		return fail(400, { message: 'Missing required fields' });
	}

	const amountValue = parseFloat(amount);
	if (isNaN(amountValue) || amountValue <= 0) {
		return fail(400, { message: 'Invalid amount' });
	}

	// Convert UAH to cents
	const amountCents = Math.round(amountValue * 100);

	await updateExpense(expenseId, {
		name,
		amountCents,
		date: new Date(date),
		categoryId: categoryIdRaw && categoryIdRaw.length > 0 ? categoryIdRaw : null
	});

	return {
		success: true
	};
}

export async function handleUpdateCategory(event: RequestEvent) {
	const user = requireLogin();
	const data = await event.request.formData();

	const categoryId = data.get('categoryId')?.toString();
	const name = data.get('name')?.toString();
	const color = data.get('color')?.toString();
	const textColor = data.get('textColor')?.toString();

	if (!categoryId || !name || !color || !textColor) {
		return fail(400, { message: 'Missing required fields' });
	}

	const categories = await getCategories(user.id);
	const selectedCategory = categories.find((category) => category.id === categoryId);

	if (selectedCategory?.userId !== user.id) {
		return fail(400, { message: 'Category not found' });
	}

	await updateCategory(categoryId, { name, color, textColor });

	return {
		success: true
	};
}
