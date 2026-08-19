import { describe, expect, it } from 'vitest';

import { normalizeTagName, slugSchema, usernameSchema } from './domain';

describe('domain validation', () => {
	it('normalizes tag identity without losing the display value contract', () => {
		expect(normalizeTagName('  Web   Design ')).toBe('web design');
	});

	it('accepts stable public identifiers', () => {
		expect(usernameSchema.safeParse('garden_keeper').success).toBe(true);
		expect(slugSchema.safeParse('independent-web').success).toBe(true);
	});

	it('rejects route-breaking identifiers', () => {
		expect(usernameSchema.safeParse('@admin').success).toBe(false);
		expect(slugSchema.safeParse('Changes Later').success).toBe(false);
	});
});
