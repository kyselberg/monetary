import { requireLogin } from '$lib';
import * as auth from '$lib/server/auth';
import { deleteCategory, getCategories, updateCategory } from '$lib/server/categories';
import type * as table from '$lib/server/db/schema';
import {
	createExpense,
	deleteExpense,
	getBiggestCategories,
	getExpenses,
	getExpensesSummary,
	getMostFrequentCategories,
	updateExpense
} from '$lib/server/expenses';
import { fail, redirect } from '@sveltejs/kit';
import { nanoid } from 'nanoid';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const user = requireLogin();
	const expenses = await getExpenses(user.id);
	const summary = await getExpensesSummary(user.id);
	const categories = await getCategories(user.id);
	const mostFrequentCategories = await getMostFrequentCategories(user.id);
	const biggestCategories = await getBiggestCategories(user.id);

	return {
		expenses,
		summary,
		categories,
		mostFrequentCategories,
		biggestCategories
	};
};

export const actions: Actions = {
	logout: async (event) => {
		if (!event.locals.session) {
			return fail(401);
		}
		await auth.invalidateSession(event.locals.session.id);
		auth.deleteSessionTokenCookie(event);

		return redirect(302, '/login');
	},
	createExpense: async (event) => {
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
	},
	deleteExpense: async (event) => {
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
	},
	updateExpense: async (event) => {
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
	},
	updateCategory: async (event) => {
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
	},
	deleteCategory: async (event) => {
		const user = requireLogin();
		const data = await event.request.formData();

		const categoryId = data.get('categoryId')?.toString();

		if (!categoryId) {
			return fail(400, { message: 'Missing category ID' });
		}

		const categories = await getCategories(user.id);
		const selectedCategory = categories.find((category) => category.id === categoryId);

		if (selectedCategory?.userId !== user.id) {
			return fail(400, { message: 'Category not found' });
		}

		await deleteCategory(categoryId);
		return {
			success: true
		};
	}
};
