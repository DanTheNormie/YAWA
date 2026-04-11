import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Mock 'server-only' to prevent it from throwing in test env
vi.mock('server-only', () => ({}));

// Mock '@/trpc/server' using inline vi.fn() (factories are hoisted, can't ref outer vars)
vi.mock('@/trpc/server', () => ({
  getQueryClient: vi.fn(() => ({
    prefetchQuery: vi.fn().mockResolvedValue(undefined),
  })),
  trpc: {
    getUsers: {
      queryOptions: vi.fn(() => ({
        queryKey: ['getUsers'],
        queryFn: vi.fn(),
      })),
    },
  },
  caller: {},
}));

// Mock dehydrate and HydrationBoundary
vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>();
  return {
    ...actual,
    dehydrate: vi.fn(() => ({ mutations: [], queries: [] })),
    HydrationBoundary: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="hydration-boundary">{children}</div>
    ),
  };
});

// Mock Client component
vi.mock('@/app/client', () => ({
  Client: () => <div data-testid="client-component">Client</div>,
}));

import Page from './page';
import { getQueryClient, trpc } from '@/trpc/server';
import { dehydrate } from '@tanstack/react-query';

describe('Page component', () => {
  let mockPrefetchQuery: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockPrefetchQuery = vi.fn().mockResolvedValue(undefined);
    vi.mocked(getQueryClient).mockReturnValue({
      prefetchQuery: mockPrefetchQuery,
    } as ReturnType<typeof getQueryClient>);
    vi.mocked(trpc.getUsers.queryOptions).mockReturnValue({
      queryKey: ['getUsers'],
      queryFn: vi.fn(),
    } as ReturnType<typeof trpc.getUsers.queryOptions>);
  });

  it('renders without crashing', async () => {
    const page = await Page();
    expect(() => render(page)).not.toThrow();
  });

  it('calls getQueryClient to get the query client', async () => {
    await Page();
    expect(getQueryClient).toHaveBeenCalled();
  });

  it('prefetches users query', async () => {
    await Page();
    expect(mockPrefetchQuery).toHaveBeenCalled();
  });

  it('prefetches with trpc.getUsers.queryOptions result', async () => {
    const queryOptions = { queryKey: ['getUsers'], queryFn: vi.fn() };
    vi.mocked(trpc.getUsers.queryOptions).mockReturnValue(
      queryOptions as ReturnType<typeof trpc.getUsers.queryOptions>,
    );

    await Page();
    expect(mockPrefetchQuery).toHaveBeenCalledWith(queryOptions);
  });

  it('calls dehydrate with the query client', async () => {
    const mockQueryClient = { prefetchQuery: mockPrefetchQuery };
    vi.mocked(getQueryClient).mockReturnValue(
      mockQueryClient as ReturnType<typeof getQueryClient>,
    );

    await Page();
    expect(dehydrate).toHaveBeenCalledWith(mockQueryClient);
  });

  it('renders HydrationBoundary', async () => {
    const page = await Page();
    render(page);
    expect(screen.getByTestId('hydration-boundary')).toBeInTheDocument();
  });

  it('renders Client component inside HydrationBoundary', async () => {
    const page = await Page();
    render(page);
    expect(screen.getByTestId('client-component')).toBeInTheDocument();
  });

  it('has the correct layout CSS classes on the outer div', async () => {
    const page = await Page();
    const { container } = render(page);
    const outerDiv = container.firstChild as HTMLElement;
    expect(outerDiv.className).toContain('min-h-screen');
    expect(outerDiv.className).toContain('min-w-screen');
    expect(outerDiv.className).toContain('flex');
    expect(outerDiv.className).toContain('items-center');
    expect(outerDiv.className).toContain('justify-center');
  });

  it('awaits the prefetch before rendering', async () => {
    let prefetchResolved = false;
    mockPrefetchQuery.mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
      prefetchResolved = true;
    });
    vi.mocked(getQueryClient).mockReturnValue({
      prefetchQuery: mockPrefetchQuery,
    } as ReturnType<typeof getQueryClient>);

    await Page();
    expect(prefetchResolved).toBe(true);
  });

  it('passes dehydrated state to HydrationBoundary', async () => {
    const dehydratedState = { mutations: [], queries: [{ queryKey: ['getUsers'] }] };
    vi.mocked(dehydrate).mockReturnValue(
      dehydratedState as ReturnType<typeof dehydrate>,
    );

    // Just verify dehydrate was called and render succeeds
    const page = await Page();
    expect(() => render(page)).not.toThrow();
    expect(dehydrate).toHaveBeenCalled();
  });
});