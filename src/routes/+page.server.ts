import { requireLogin } from '$lib';
import type * as table from '$lib/server/db/schema';
import {
	createExpense,
	deleteExpense,
	getExpenses,
	getExpensesSummary,
	updateExpense
} from '$lib/server/expenses';
import { fail } from '@sveltejs/kit';
import { nanoid } from 'nanoid';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const user = requireLogin();
	const expenses = await getExpenses(user.id);
	const summary = await getExpensesSummary(user.id);

	return {
		expenses,
		summary
	};
};

export const actions: Actions = {
	createExpense: async (event) => {
		const user = requireLogin();
		const data = await event.request.formData();

		const name = data.get('name')?.toString();
		const amount = data.get('amount')?.toString();
		const date = data.get('date')?.toString();

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
			date: new Date(date)
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
			date: new Date(date)
		});

		return {
			success: true
		};
	}
};
