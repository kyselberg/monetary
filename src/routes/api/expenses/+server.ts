import { requireLogin } from '$lib';
import { createMultipleExpenses } from '$lib/server/expenses';
import { json } from '@sveltejs/kit';
import { nanoid } from 'nanoid';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const user = requireLogin();
	const data = await request.json();

	const { expenses } = data;

	if (!expenses || !Array.isArray(expenses) || expenses.length === 0) {
		return json({ error: 'No expenses provided' }, { status: 400 });
	}

	try {
		// Transform the expenses data
		const transformedExpenses = expenses
			.filter((expense) => expense.name && expense.amount && parseFloat(expense.amount) > 0)
			.map((expense) => ({
				id: nanoid(),
				userId: user.id,
				name: expense.name.trim(),
				amountCents: Math.round(parseFloat(expense.amount) * 100),
				date: new Date(expense.date),
				categoryId: expense.categoryId || null
			}));

		if (transformedExpenses.length === 0) {
			return json({ error: 'No valid expenses provided' }, { status: 400 });
		}

		await createMultipleExpenses(transformedExpenses);

		return json({ success: true });
	} catch (error) {
		console.error('Error creating expenses:', error);
		return json({ error: 'Failed to create expenses' }, { status: 500 });
	}
};
