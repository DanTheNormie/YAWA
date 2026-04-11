import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock react's cache to be a simple passthrough in test environment
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    cache: (fn: (...args: unknown[]) => unknown) => fn,
  };
});

// Mock fetchRequestHandler from tRPC using inline vi.fn()
vi.mock('@trpc/server/adapters/fetch', () => ({
  fetchRequestHandler: vi.fn().mockResolvedValue(new Response('ok', { status: 200 })),
}));

// Mock the tRPC init
vi.mock('@/trpc/init', () => ({
  createTRPCContext: vi.fn(async () => ({ userId: 'user_123' })),
}));

// Mock the db
vi.mock('@/lib/db', () => ({
  default: {
    user: {
      findMany: vi.fn().mockResolvedValue([]),
    },
  },
}));

// Mock the app router
vi.mock('@/trpc/routers/_app', () => ({
  appRouter: { _def: { procedures: {} } },
}));

import { GET, POST } from './route';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { createTRPCContext } from '@/trpc/init';
import { appRouter } from '@/trpc/routers/_app';

describe('API route handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetchRequestHandler).mockResolvedValue(
      new Response('ok', { status: 200 }),
    );
  });

  it('exports GET handler', () => {
    expect(GET).toBeDefined();
    expect(typeof GET).toBe('function');
  });

  it('exports POST handler', () => {
    expect(POST).toBeDefined();
    expect(typeof POST).toBe('function');
  });

  it('GET and POST are the same handler function', () => {
    expect(GET).toBe(POST);
  });

  it('calls fetchRequestHandler with the correct endpoint', async () => {
    const mockRequest = new Request('http://localhost:3000/api/trpc/getUsers');
    await GET(mockRequest);

    expect(fetchRequestHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        endpoint: '/api/trpc',
      }),
    );
  });

  it('calls fetchRequestHandler with the request object', async () => {
    const mockRequest = new Request('http://localhost:3000/api/trpc/getUsers');
    await GET(mockRequest);

    expect(fetchRequestHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        req: mockRequest,
      }),
    );
  });

  it('calls fetchRequestHandler with the appRouter', async () => {
    const mockRequest = new Request('http://localhost:3000/api/trpc/getUsers');
    await GET(mockRequest);

    expect(fetchRequestHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        router: appRouter,
      }),
    );
  });

  it('calls fetchRequestHandler with createTRPCContext as createContext', async () => {
    const mockRequest = new Request('http://localhost:3000/api/trpc/getUsers');
    await GET(mockRequest);

    expect(fetchRequestHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        createContext: createTRPCContext,
      }),
    );
  });

  it('returns the response from fetchRequestHandler', async () => {
    const mockResponse = new Response(JSON.stringify({ result: 'data' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    vi.mocked(fetchRequestHandler).mockResolvedValue(mockResponse);

    const mockRequest = new Request('http://localhost:3000/api/trpc/getUsers');
    const response = await GET(mockRequest);

    expect(response).toBe(mockResponse);
  });

  it('handles POST requests with all required args', async () => {
    const mockRequest = new Request('http://localhost:3000/api/trpc/getUsers', {
      method: 'POST',
      body: JSON.stringify({ input: {} }),
    });
    await POST(mockRequest);

    expect(fetchRequestHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        endpoint: '/api/trpc',
        req: mockRequest,
        router: appRouter,
        createContext: createTRPCContext,
      }),
    );
  });

  it('calls fetchRequestHandler exactly once per request', async () => {
    const mockRequest = new Request('http://localhost:3000/api/trpc/getUsers');
    await GET(mockRequest);
    expect(fetchRequestHandler).toHaveBeenCalledTimes(1);
  });
});