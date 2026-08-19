import { requireWriter } from '$lib/server/guards'; import type { PageServerLoad } from './$types';
export const load: PageServerLoad = (event) => { requireWriter(event); return {}; };
