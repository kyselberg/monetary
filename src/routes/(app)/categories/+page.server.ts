import { requireLogin } from '$lib';
import { getCategories } from '$lib/server/categories';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const user = requireLogin();
	const categories = await getCategories(user.id);

	return {
		categories
	};
};
