/// <reference types="@cloudflare/workers-types" />

import type { User, Session } from 'better-auth';
import { createAuth } from '$lib/server/auth';
import type { D1Database } from '@cloudflare/workers-types';
import type { MetadataJob } from '$lib/domain';

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			user?: User;
			session?: Session;
			profile?: typeof import('$lib/server/db/schema').profile.$inferSelect;
			isAdmin: boolean;
			auth: ReturnType<typeof createAuth>;
		}

		// interface Error {}
		// interface PageData {}
		// interface PageState {}
		interface Platform {
			env: {
				DB: D1Database;
				EMAIL: SendEmail;
				EMAIL_FROM: string;
				METADATA_QUEUE: Queue<MetadataJob>;
			};
		}
	}
}

export {};
