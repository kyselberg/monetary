import { requireLogin } from '$lib';
import type * as table from '$lib/server/db/schema';
import {
	createExpense,
	createMultipleExpenses,
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
	},
	createMultipleExpenses: async (event) => {
		const user = requireLogin();
		const data = await event.request.formData();

		// Parse the expenses array from form data
		const expenses: Array<{ name: string; amount: string; date: string }> = [];
		let index = 0;

		while (data.has(`expenses[${index}][name]`)) {
			const name = data.get(`expenses[${index}][name]`)?.toString();
			const amount = data.get(`expenses[${index}][amount]`)?.toString();
			const date = data.get(`expenses[${index}][date]`)?.toString();

			if (name && amount && date) {
				expenses.push({ name, amount, date });
			}
			index++;
		}

		if (expenses.length === 0) {
			return fail(400, { message: 'No valid expenses provided' });
		}

		// Validate and convert expenses
		const validExpenses: table.Expenses[] = [];

		for (const expense of expenses) {
			const amountValue = parseFloat(expense.amount);
			if (isNaN(amountValue) || amountValue <= 0) {
				return fail(400, { message: `Invalid amount for expense: ${expense.name}` });
			}

			// Convert UAH to cents
			const amountCents = Math.round(amountValue * 100);

			validExpenses.push({
				id: nanoid(),
				userId: user.id,
				name: expense.name.trim(),
				amountCents,
				date: new Date(expense.date)
			});
		}

		await createMultipleExpenses(validExpenses);
		return {
			success: true,
			count: validExpenses.length
		};
	}
};
