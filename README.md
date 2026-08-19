# LinkGarden

LinkGarden is a collaborative link manager and public, human-curated directory of the web. The v1 behavior and acceptance criteria live in [`spec.md`](./spec.md).

## Stack

- SvelteKit 2 and Svelte 5 on Cloudflare Workers
- Better Auth with mandatory email verification
- Drizzle ORM and Cloudflare D1, including FTS5 public search
- Cloudflare Queues for asynchronous page metadata
- Cloudflare Email Service for verification, reset, and invitation mail
- Vitest and Playwright

The web Worker produces metadata jobs. `workers/metadata.ts` is deployed as the single queue consumer and shares the D1 database with the web application.

## Local setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env`, fill in the D1 credentials and a high-entropy `BETTER_AUTH_SECRET`, and set `ORIGIN` to the local URL.
3. Apply migrations with `npx wrangler d1 migrations apply dont-loose-it-db --local`.
4. Start the application with `npm run dev`.

Useful checks:

```sh
npm test
npm run check
npm run build
npm run check:workers
npm run test:e2e
```

Playwright browsers must be installed once with `npx playwright install chromium` before running browser tests.

## Cloudflare provisioning

Create the metadata queue and dead-letter queue once:

```sh
npx wrangler queues create linkgarden-metadata
npx wrangler queues create linkgarden-metadata-dlq
```

Enable transactional email for the configured sender domain and confirm that `hello@linkgarden.moamenhredeen.me` is allowed by the `EMAIL` binding:

```sh
npx wrangler email sending enable linkgarden.moamenhredeen.me
npx wrangler email sending list
```

Cloudflare Email Service configures SPF and DKIM during onboarding. Add and monitor a DMARC policy for the domain separately.

## Deployment

Deploy in dependency order:

```sh
npx wrangler d1 migrations apply dont-loose-it-db --remote
npm run deploy:metadata
npm run deploy:web
```

The metadata consumer must be deployed before the web Worker begins producing jobs. Both Workers have structured logs and tracing enabled. Inspect failures with `npx wrangler tail --config wrangler.metadata.jsonc`; exhausted jobs go to `linkgarden-metadata-dlq`.

For rollback, redeploy the previous Worker commits. Do not reverse a D1 migration destructively; use D1 Time Travel or a forward corrective migration.

## Administrator bootstrap

There is deliberately no public administrator-assignment route. After the first administrator has registered, verified their email, and chosen a profile, grant access with an idempotent D1 statement:

```sh
npx wrangler d1 execute dont-loose-it-db --remote --command "INSERT OR IGNORE INTO platform_admin (user_id, created_at) SELECT id, cast(unixepoch('subsecond') * 1000 as integer) FROM user WHERE lower(email) = lower('ADMIN_EMAIL_HERE')"
```

Confirm the statement inserted exactly the intended existing account before sharing administrator access. Removing the row revokes administrator tools without changing public profile data.

## Operational smoke test

After deployment:

1. Register and receive a verification email.
2. Complete a profile and save a private and public link.
3. Confirm metadata moves from `pending` to `ready` or can be retried after failure.
4. Create a public list, add a link, invite a second verified user, and accept the invitation.
5. Confirm signed-out profile, list, homepage, and search results exclude private content.
6. Report a public item, hide it as an administrator, confirm it disappears publicly, then restore it.

Never commit `.env`, API tokens, or the Better Auth secret. Worker bindings should be regenerated or checked with Wrangler whenever configuration changes.
