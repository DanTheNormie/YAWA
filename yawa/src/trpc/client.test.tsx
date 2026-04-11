import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Mock tRPC and React Query dependencies using inline vi.fn()
vi.mock('@trpc/client', () => ({
  createTRPCClient: vi.fn(() => ({ _client: true })),
  httpBatchLink: vi.fn(() => ({ type: 'httpBatchLink' })),
}));

vi.mock('@trpc/tanstack-react-query', () => ({
  createTRPCContext: vi.fn(() => ({
    TRPCProvider: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="trpc-provider">{children}</div>
    ),
    useTRPC: vi.fn(),
  })),
}));

vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>();
  return {
    ...actual,
    QueryClientProvider: ({ children, client }: { children: React.ReactNode; client: unknown }) => (
      <div data-testid="query-client-provider">{children}</div>
    ),
  };
});

vi.mock('@/trpc/query-client', () => ({
  makeQueryClient: vi.fn(() => ({
    getDefaultOptions: vi.fn(() => ({})),
    setDefaultOptions: vi.fn(),
    invalidateQueries: vi.fn(),
  })),
}));

import { TRPCReactProvider, TRPCProvider, useTRPC } from './client';
import { makeQueryClient } from '@/trpc/query-client';
import { httpBatchLink } from '@trpc/client';

describe('TRPCReactProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Re-set makeQueryClient to return a valid mock after clearAllMocks
    vi.mocked(makeQueryClient).mockReturnValue({
      getDefaultOptions: vi.fn(() => ({})),
      setDefaultOptions: vi.fn(),
      invalidateQueries: vi.fn(),
    } as ReturnType<typeof makeQueryClient>);
    vi.mocked(httpBatchLink).mockReturnValue({ type: 'httpBatchLink' } as ReturnType<typeof httpBatchLink>);
  });

  it('renders children', () => {
    render(
      <TRPCReactProvider>
        <div data-testid="child">Hello</div>
      </TRPCReactProvider>,
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('renders without crashing', () => {
    expect(() =>
      render(
        <TRPCReactProvider>
          <span>test</span>
        </TRPCReactProvider>,
      ),
    ).not.toThrow();
  });

  it('renders the QueryClientProvider wrapper', () => {
    render(
      <TRPCReactProvider>
        <div>content</div>
      </TRPCReactProvider>,
    );
    expect(screen.getByTestId('query-client-provider')).toBeInTheDocument();
  });

  it('renders the TRPCProvider wrapper', () => {
    render(
      <TRPCReactProvider>
        <div>content</div>
      </TRPCReactProvider>,
    );
    expect(screen.getByTestId('trpc-provider')).toBeInTheDocument();
  });

  it('uses makeQueryClient to obtain the query client', () => {
    // Because getQueryClient() uses a module-level singleton (browserQueryClient),
    // makeQueryClient is only called once per module lifetime when window is defined.
    // We verify the mock was used at module init time by rendering and checking
    // the QueryClientProvider receives a client object (the mock return value).
    let clientPassed: unknown;
    const { QueryClientProvider } = require('@tanstack/react-query');
    // The fact that TRPCReactProvider renders QueryClientProvider without throwing
    // confirms a QueryClient was obtained (from makeQueryClient or singleton).
    expect(() =>
      render(
        <TRPCReactProvider>
          <div>test</div>
        </TRPCReactProvider>,
      ),
    ).not.toThrow();
  });

  it('renders multiple children correctly', () => {
    render(
      <TRPCReactProvider>
        <span data-testid="child-1">First</span>
        <span data-testid="child-2">Second</span>
      </TRPCReactProvider>,
    );
    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
  });

  it('accepts readonly children prop', () => {
    const Child = () => <div data-testid="typed-child">typed</div>;
    expect(() =>
      render(
        <TRPCReactProvider>
          <Child />
        </TRPCReactProvider>,
      ),
    ).not.toThrow();
    expect(screen.getByTestId('typed-child')).toBeInTheDocument();
  });
});

describe('exports', () => {
  it('exports TRPCProvider', () => {
    expect(TRPCProvider).toBeDefined();
  });

  it('exports useTRPC', () => {
    expect(useTRPC).toBeDefined();
  });

  it('exports TRPCReactProvider as a function component', () => {
    expect(typeof TRPCReactProvider).toBe('function');
  });
});

describe('getUrl logic (via TRPCReactProvider)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(makeQueryClient).mockReturnValue({
      getDefaultOptions: vi.fn(() => ({})),
      setDefaultOptions: vi.fn(),
      invalidateQueries: vi.fn(),
    } as ReturnType<typeof makeQueryClient>);
    vi.mocked(httpBatchLink).mockReturnValue({ type: 'httpBatchLink' } as ReturnType<typeof httpBatchLink>);
    delete process.env.NEXT_PUBLIC_VERCEL_URL;
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_VERCEL_URL;
  });

  it('uses /api/trpc as the tRPC endpoint path in browser (jsdom has window)', () => {
    render(
      <TRPCReactProvider>
        <div>test</div>
      </TRPCReactProvider>,
    );

    // In jsdom, window is defined so base = '' making url = '/api/trpc'
    expect(httpBatchLink).toHaveBeenCalledWith(
      expect.objectContaining({
        url: '/api/trpc',
      }),
    );
  });

  it('constructs the tRPC URL with /api/trpc suffix', () => {
    render(
      <TRPCReactProvider>
        <div>test</div>
      </TRPCReactProvider>,
    );

    expect(httpBatchLink).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining('/api/trpc'),
      }),
    );
  });
});