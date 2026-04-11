import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock react's cache to be a simple passthrough in test environment
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    cache: (fn: (...args: unknown[]) => unknown) => fn,
  };
});

// Mock the database module
vi.mock('@/lib/db', () => ({
  default: {
    user: {
      findMany: vi.fn(),
    },
  },
}));

import { appRouter, type AppRouter } from './_app';
import db from '@/lib/db';
import { createCallerFactory } from '@/trpc/init';

const mockDb = db as {
  user: {
    findMany: ReturnType<typeof vi.fn>;
  };
};

describe('appRouter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('is defined', () => {
    expect(appRouter).toBeDefined();
  });

  it('has a getUsers procedure', () => {
    expect(appRouter._def.procedures.getUsers).toBeDefined();
  });

  describe('getUsers procedure', () => {
    const createCaller = createCallerFactory(appRouter);

    it('returns users from the database', async () => {
      const mockUsers = [
        { id: '1', name: 'Alice', email: 'alice@example.com' },
        { id: '2', name: 'Bob', email: 'bob@example.com' },
      ];
      mockDb.user.findMany.mockResolvedValue(mockUsers);

      const caller = createCaller({});
      const result = await caller.getUsers();

      expect(result).toEqual(mockUsers);
      expect(mockDb.user.findMany).toHaveBeenCalledTimes(1);
      expect(mockDb.user.findMany).toHaveBeenCalledWith();
    });

    it('returns an empty array when no users exist', async () => {
      mockDb.user.findMany.mockResolvedValue([]);

      const caller = createCaller({});
      const result = await caller.getUsers();

      expect(result).toEqual([]);
      expect(mockDb.user.findMany).toHaveBeenCalledTimes(1);
    });

    it('calls db.user.findMany without arguments', async () => {
      mockDb.user.findMany.mockResolvedValue([]);

      const caller = createCaller({});
      await caller.getUsers();

      expect(mockDb.user.findMany).toHaveBeenCalledWith();
    });

    it('propagates database errors', async () => {
      const dbError = new Error('Database connection failed');
      mockDb.user.findMany.mockRejectedValue(dbError);

      const caller = createCaller({});
      await expect(caller.getUsers()).rejects.toThrow('Database connection failed');
    });

    it('is a query procedure (not mutation)', () => {
      const procedure = appRouter._def.procedures.getUsers;
      expect(procedure._def.type).toBe('query');
    });
  });
});

describe('AppRouter type', () => {
  it('appRouter matches AppRouter type', () => {
    // This is a type-level test; ensure the runtime value satisfies the shape
    const router: AppRouter = appRouter;
    expect(router).toBe(appRouter);
  });
});