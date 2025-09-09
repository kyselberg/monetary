import { requireLogin } from '$lib';
import { deleteCategory, getCategory, updateCategory } from '$lib/server/categories';
import { getExpensesByCategory } from '$lib/server/expenses';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const user = requireLogin();
	const category = await getCategory(params.id, user.id);

	if (!category) {
		throw redirect(302, '/categories');
	}

	// Get associated expenses count
	const expenses = await getExpensesByCategory(category.id);
	const expenseCount = expenses.length;

	return {
		category,
		expenseCount
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

		try {
			await deleteCategory(categoryId);
		} catch (error) {
			// Check if the error is about associated expenses
			if (error instanceof Error && error.message === 'Category has associated expenses') {
				return fail(409, {
					message:
						'Cannot delete category with associated expenses. Please delete or reassign all expenses in this category first.',
					error: 'HAS_EXPENSES'
				});
			}

			return fail(500, {
				message: 'Failed to delete category',
				error: error instanceof Error ? error.message : 'Unknown error'
			});
		}

		throw redirect(302, '/categories');
	}
};
