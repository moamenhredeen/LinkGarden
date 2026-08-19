import { z } from 'zod';

export const visibilitySchema = z.enum(['private', 'public']);
export const moderationStateSchema = z.enum(['active', 'hidden']);
export const metadataStateSchema = z.enum(['pending', 'ready', 'failed']);
export const invitationStateSchema = z.enum(['pending', 'accepted', 'expired', 'revoked']);
export const reportStateSchema = z.enum(['open', 'dismissed', 'actioned']);
export const reportReasonSchema = z.enum(['spam', 'malware', 'harassment', 'illegal', 'misleading', 'other']);

export const usernameSchema = z.string().trim().min(3).max(30)
	.regex(/^[a-z0-9](?:[a-z0-9_-]*[a-z0-9])?$/i, 'Use letters, numbers, underscores, or hyphens');
export const slugSchema = z.string().trim().min(1).max(80)
	.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase words separated by hyphens');
export const tagNameSchema = z.string().trim().min(1).max(40);

export type Visibility = z.infer<typeof visibilitySchema>;
export type MetadataJob = { version: 1; linkId: string; generation: number };

export function normalizeTagName(value: string): string {
	return value.trim().replace(/\s+/g, ' ').toLocaleLowerCase('en-US');
}
