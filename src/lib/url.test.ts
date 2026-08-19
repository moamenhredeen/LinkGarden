import { describe, expect, it } from 'vitest';
import { assertSafeMetadataUrl, normalizeUrl } from './url';

describe('normalizeUrl', () => {
	it('normalizes host, port, fragment, and empty path while retaining query', () => {
		expect(normalizeUrl('HTTPS://Example.COM:443?ref=one#part')).toBe('https://example.com/?ref=one');
	});
	it('rejects unsupported protocols', () => expect(() => normalizeUrl('file:///etc/passwd')).toThrow());
	it('rejects private metadata destinations', () => {
		expect(() => assertSafeMetadataUrl('http://127.0.0.1/private')).toThrow();
		expect(() => assertSafeMetadataUrl('http://192.168.1.1/')).toThrow();
		expect(assertSafeMetadataUrl('https://example.com').hostname).toBe('example.com');
	});
});
