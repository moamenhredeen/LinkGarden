const PRIVATE_IPV4 = [
	/^10\./, /^127\./, /^169\.254\./, /^192\.168\./,
	/^172\.(?:1[6-9]|2\d|3[01])\./, /^0\./
];

export function normalizeUrl(input: string): string {
	let url: URL;
	try { url = new URL(input.trim()); } catch { throw new Error('Enter a valid HTTP or HTTPS URL.'); }
	if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new Error('Only HTTP and HTTPS links are supported.');
	url.hostname = url.hostname.toLocaleLowerCase('en-US');
	if ((url.protocol === 'http:' && url.port === '80') || (url.protocol === 'https:' && url.port === '443')) url.port = '';
	url.hash = '';
	if (!url.pathname) url.pathname = '/';
	return url.toString();
}

export function assertSafeMetadataUrl(input: string): URL {
	const url = new URL(normalizeUrl(input));
	if (url.username || url.password) throw new Error('URLs with embedded credentials cannot be fetched.');
	const host = url.hostname.replace(/^\[|\]$/g, '').toLocaleLowerCase('en-US');
	if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') || host === '::1' || host.startsWith('fc') || host.startsWith('fd') || host.startsWith('fe80:') || PRIVATE_IPV4.some((pattern) => pattern.test(host))) {
		throw new Error('Local and private network addresses cannot be fetched.');
	}
	return url;
}
