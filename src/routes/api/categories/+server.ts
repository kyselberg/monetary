import { requireLogin } from '$lib';
import { createCategory, getCategories } from '$lib/server/categories';
import { json } from '@sveltejs/kit';
import { nanoid } from 'nanoid';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const user = requireLogin();
	const categories = await getCategories(user.id);
	return json(categories);
};

export const POST: RequestHandler = async ({ request }) => {
	const user = requireLogin();
	const data = await request.json();

	const { name, description, color, textColor } = data;

	if (!name || !description || !color || !textColor) {
		return json({ error: 'All fields are required' }, { status: 400 });
	}

	try {
		await createCategory({
			id: nanoid(),
			userId: user.id,
			name: name.trim(),
			description: description.trim(),
			color,
			textColor
		});

		return json({ success: true });
	} catch (error) {
		console.error('Error creating category:', error);
		return json({ error: 'Failed to create category' }, { status: 500 });
	}
};
