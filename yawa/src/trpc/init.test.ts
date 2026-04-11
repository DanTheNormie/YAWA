import { describe, it, expect, vi } from 'vitest';

// Mock react's cache to be a simple passthrough in test environment
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    cache: (fn: (...args: unknown[]) => unknown) => fn,
  };
});

import { createTRPCContext, createTRPCRouter, createCallerFactory, baseProcedure } from './init';

describe('createTRPCContext', () => {
  it('returns an object with userId', async () => {
    const ctx = await createTRPCContext();
    expect(ctx).toEqual({ userId: 'user_123' });
  });

  it('returns userId as user_123', async () => {
    const ctx = await createTRPCContext();
    expect(ctx.userId).toBe('user_123');
  });

  it('is an async function that resolves', async () => {
    const result = createTRPCContext();
    expect(result).toBeInstanceOf(Promise);
    await expect(result).resolves.toBeDefined();
  });
});

describe('createTRPCRouter', () => {
  it('is a function', () => {
    expect(typeof createTRPCRouter).toBe('function');
  });

  it('creates a router with procedures', () => {
    const testRouter = createTRPCRouter({
      testProcedure: baseProcedure.query(() => 'test-result'),
    });
    expect(testRouter).toBeDefined();
    expect(testRouter._def).toBeDefined();
  });
});

describe('baseProcedure', () => {
  it('is defined', () => {
    expect(baseProcedure).toBeDefined();
  });

  it('can be used to build a query procedure', () => {
    const queryProcedure = baseProcedure.query(() => 'result');
    expect(queryProcedure).toBeDefined();
    expect(queryProcedure._def).toBeDefined();
    expect(queryProcedure._def.type).toBe('query');
  });

  it('can be used to build a mutation procedure', () => {
    const mutationProcedure = baseProcedure.mutation(() => 'mutated');
    expect(mutationProcedure).toBeDefined();
    expect(mutationProcedure._def.type).toBe('mutation');
  });
});

describe('createCallerFactory', () => {
  it('is a function', () => {
    expect(typeof createCallerFactory).toBe('function');
  });

  it('creates a caller from a router', () => {
    const testRouter = createTRPCRouter({
      ping: baseProcedure.query(() => 'pong'),
    });
    const callerFactory = createCallerFactory(testRouter);
    expect(typeof callerFactory).toBe('function');
  });

  it('the created caller can invoke procedures', async () => {
    const testRouter = createTRPCRouter({
      ping: baseProcedure.query(() => 'pong'),
    });
    const callerFactory = createCallerFactory(testRouter);
    const caller = callerFactory({});
    const result = await caller.ping();
    expect(result).toBe('pong');
  });
});