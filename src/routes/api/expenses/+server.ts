import { requireLogin } from '$lib';
import { createExpense } from '$lib/server/expenses';
import { nanoid } from 'nanoid';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const user = requireLogin();

	try {
		const { amountCents, date, name } = await request.json();

		if (!amountCents || !date || !name) {
			return new Response(JSON.stringify({ error: 'Missing required fields' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		if (typeof amountCents !== 'number' || amountCents <= 0) {
			return new Response(JSON.stringify({ error: 'Invalid amount' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		const expense = {
			id: nanoid(),
			userId: user.id,
			name,
			amountCents,
			date: new Date(date),
			categoryId: null
		};

		await createExpense(expense);

		return new Response(JSON.stringify({ success: true }), {
			status: 201,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (error) {
		console.error('Error creating expense:', error);
		return new Response(JSON.stringify({ error: 'Internal server error' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
};
