// place files you want to import through the `$lib` alias in this folder.

import { getRequestEvent } from '$app/server';
import { redirect } from '@sveltejs/kit';

export const requireLogin = () => {
	const { locals } = getRequestEvent();

	if (!locals.user) {
		throw redirect(302, '/login');
	}

	return locals.user;
};
