import { requireLogin } from '$lib';
import { getCategories } from '$lib/server/categories';
import { getOwnExpensesByCategory, getOwnExpensesByCategorySummary } from '$lib/server/expenses';
import {
	handleCreateExpense,
	handleDeleteExpense,
	handleLogout,
	handleUpdateCategory,
	handleUpdateExpense
} from '$lib/server/form-actions';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const user = requireLogin();
	const expenses = await getOwnExpensesByCategory(user.id, params.id);
	const summary = await getOwnExpensesByCategorySummary(user.id, params.id);
	const categories = await getCategories(user.id);

	return {
		expenses,
		summary,
		categories
	};
};

export const actions: Actions = {
	logout: handleLogout,
	createExpense: handleCreateExpense,
	deleteExpense: handleDeleteExpense,
	updateExpense: handleUpdateExpense,
	updateCategory: handleUpdateCategory
};
