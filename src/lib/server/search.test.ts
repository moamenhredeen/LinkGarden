import { describe, expect, it } from 'vitest'; import { toFtsQuery } from './search';
describe('toFtsQuery', () => { it('creates a bounded prefix query', () => expect(toFtsQuery('independent web')).toBe('"independent"* AND "web"*')); it('drops FTS operators', () => expect(toFtsQuery('" OR *')).toBe('"OR"*')); });
