import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ locals }) => ({
	user: locals.user,
	profile: locals.profile,
	isAdmin: locals.isAdmin
});
