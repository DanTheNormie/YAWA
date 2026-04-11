import { describe, it, expect } from 'vitest';
import { QueryClient, defaultShouldDehydrateQuery } from '@tanstack/react-query';
import { makeQueryClient } from './query-client';

describe('makeQueryClient', () => {
  it('returns a QueryClient instance', () => {
    const client = makeQueryClient();
    expect(client).toBeInstanceOf(QueryClient);
  });

  it('creates a new QueryClient instance on each call', () => {
    const client1 = makeQueryClient();
    const client2 = makeQueryClient();
    expect(client1).not.toBe(client2);
  });

  it('configures staleTime to 30 seconds', () => {
    const client = makeQueryClient();
    const options = client.getDefaultOptions();
    expect(options.queries?.staleTime).toBe(30 * 1000);
  });

  describe('shouldDehydrateQuery', () => {
    it('dehydrates queries in pending state', () => {
      const client = makeQueryClient();
      const options = client.getDefaultOptions();
      const shouldDehydrate = options.dehydrate?.shouldDehydrateQuery;

      expect(shouldDehydrate).toBeDefined();

      const pendingQuery = {
        state: { status: 'pending' as const },
        queryKey: ['test'],
        queryHash: 'test',
      } as Parameters<typeof defaultShouldDehydrateQuery>[0];

      expect(shouldDehydrate!(pendingQuery)).toBe(true);
    });

    it('delegates to defaultShouldDehydrateQuery for non-pending queries', () => {
      const client = makeQueryClient();
      const options = client.getDefaultOptions();
      const shouldDehydrate = options.dehydrate?.shouldDehydrateQuery;

      expect(shouldDehydrate).toBeDefined();

      const successQuery = {
        state: { status: 'success' as const },
        queryKey: ['test'],
        queryHash: 'test',
      } as Parameters<typeof defaultShouldDehydrateQuery>[0];

      const defaultResult = defaultShouldDehydrateQuery(successQuery);
      expect(shouldDehydrate!(successQuery)).toBe(defaultResult);
    });

    it('dehydrates successful queries (via defaultShouldDehydrateQuery)', () => {
      const client = makeQueryClient();
      const options = client.getDefaultOptions();
      const shouldDehydrate = options.dehydrate?.shouldDehydrateQuery;

      expect(shouldDehydrate).toBeDefined();

      const successQuery = {
        state: { status: 'success' as const },
        queryKey: ['test'],
        queryHash: 'test',
      } as Parameters<typeof defaultShouldDehydrateQuery>[0];

      // defaultShouldDehydrateQuery returns true for success
      expect(shouldDehydrate!(successQuery)).toBe(true);
    });

    it('does not dehydrate errored queries by default', () => {
      const client = makeQueryClient();
      const options = client.getDefaultOptions();
      const shouldDehydrate = options.dehydrate?.shouldDehydrateQuery;

      expect(shouldDehydrate).toBeDefined();

      const errorQuery = {
        state: { status: 'error' as const },
        queryKey: ['test'],
        queryHash: 'test',
      } as Parameters<typeof defaultShouldDehydrateQuery>[0];

      // defaultShouldDehydrateQuery returns false for errors, and status !== 'pending'
      expect(shouldDehydrate!(errorQuery)).toBe(false);
    });
  });

  it('includes hydrate options in default options', () => {
    const client = makeQueryClient();
    const options = client.getDefaultOptions();
    // hydrate key exists in dehydrate/hydrate options
    expect(options).toHaveProperty('hydrate');
  });
});