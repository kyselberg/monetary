import { requireLogin } from '$lib';
import { deleteCategory, getCategory, updateCategory } from '$lib/server/categories';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const user = requireLogin();
	const category = await getCategory(params.id, user.id);

	if (!category) {
		throw redirect(302, '/categories');
	}

	return {
		category
	};
};

export const actions: Actions = {
	updateCategory: async (event) => {
		const user = requireLogin();
		const data = await event.request.formData();

		const categoryId = data.get('categoryId')?.toString();
		const name = data.get('name')?.toString();
		const color = data.get('color')?.toString();
		const textColor = data.get('textColor')?.toString();
		const description = data.get('description')?.toString() || '';

		if (!categoryId || !name || !color || !textColor) {
			return fail(400, { message: 'Missing required fields' });
		}

		// Verify the category belongs to the user
		const category = await getCategory(categoryId, user.id);
		if (!category) {
			return fail(404, { message: 'Category not found' });
		}

		await updateCategory(categoryId, { name, color, textColor, description });

		throw redirect(302, '/categories');
	},

	deleteCategory: async (event) => {
		const user = requireLogin();
		const data = await event.request.formData();

		const categoryId = data.get('categoryId')?.toString();

		if (!categoryId) {
			return fail(400, { message: 'Missing category ID' });
		}

		// Verify the category belongs to the user
		const category = await getCategory(categoryId, user.id);
		if (!category) {
			return fail(404, { message: 'Category not found' });
		}

		await deleteCategory(categoryId);

		throw redirect(302, '/categories');
	}
};
