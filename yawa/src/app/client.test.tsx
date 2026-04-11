import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Mock @/trpc/client using inline vi.fn() (factories are hoisted, can't ref outer vars)
vi.mock('@/trpc/client', () => ({
  useTRPC: vi.fn(() => ({
    getUsers: {
      queryOptions: vi.fn(() => ({ queryKey: ['getUsers'], queryFn: vi.fn() })),
    },
  })),
  TRPCProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TRPCReactProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock useSuspenseQuery from @tanstack/react-query using inline vi.fn()
vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>();
  return {
    ...actual,
    useSuspenseQuery: vi.fn(() => ({ data: [] })),
  };
});

import { Client } from './client';
import { useTRPC } from '@/trpc/client';
import { useSuspenseQuery } from '@tanstack/react-query';

describe('Client component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset default mock implementations after clearAllMocks
    vi.mocked(useSuspenseQuery).mockReturnValue({ data: [] } as ReturnType<typeof useSuspenseQuery>);
    vi.mocked(useTRPC).mockReturnValue({
      getUsers: {
        queryOptions: vi.fn(() => ({ queryKey: ['getUsers'], queryFn: vi.fn() })),
      },
    } as ReturnType<typeof useTRPC>);
  });

  it('renders without crashing', () => {
    expect(() => render(<Client />)).not.toThrow();
  });

  it('renders the "Client:" label', () => {
    render(<Client />);
    expect(screen.getByText(/Client:/)).toBeInTheDocument();
  });

  it('renders serialized user data', () => {
    const mockUsers = [{ id: '1', name: 'Alice', email: 'alice@example.com' }];
    vi.mocked(useSuspenseQuery).mockReturnValue({
      data: mockUsers,
    } as ReturnType<typeof useSuspenseQuery>);

    render(<Client />);
    expect(screen.getByText(/Alice/)).toBeInTheDocument();
  });

  it('renders empty array when no users', () => {
    vi.mocked(useSuspenseQuery).mockReturnValue({ data: [] } as ReturnType<typeof useSuspenseQuery>);

    render(<Client />);
    const container = screen.getByText(/Client:/).parentElement;
    expect(container?.textContent).toContain('[]');
  });

  it('renders multiple users as JSON', () => {
    const mockUsers = [
      { id: '1', name: 'Alice', email: 'alice@example.com' },
      { id: '2', name: 'Bob', email: 'bob@example.com' },
    ];
    vi.mocked(useSuspenseQuery).mockReturnValue({
      data: mockUsers,
    } as ReturnType<typeof useSuspenseQuery>);

    render(<Client />);
    expect(screen.getByText(/Bob/)).toBeInTheDocument();
    expect(screen.getByText(/Alice/)).toBeInTheDocument();
  });

  it('calls useTRPC hook', () => {
    render(<Client />);
    expect(useTRPC).toHaveBeenCalled();
  });

  it('calls trpc.getUsers.queryOptions to get query options', () => {
    const mockQueryOptions = vi.fn(() => ({ queryKey: ['getUsers'], queryFn: vi.fn() }));
    vi.mocked(useTRPC).mockReturnValue({
      getUsers: { queryOptions: mockQueryOptions },
    } as ReturnType<typeof useTRPC>);

    render(<Client />);
    expect(mockQueryOptions).toHaveBeenCalled();
  });

  it('passes query options to useSuspenseQuery', () => {
    const queryOptions = { queryKey: ['getUsers'], queryFn: vi.fn() };
    const mockQueryOptions = vi.fn(() => queryOptions);
    vi.mocked(useTRPC).mockReturnValue({
      getUsers: { queryOptions: mockQueryOptions },
    } as ReturnType<typeof useTRPC>);
    vi.mocked(useSuspenseQuery).mockReturnValue({ data: [] } as ReturnType<typeof useSuspenseQuery>);

    render(<Client />);
    expect(useSuspenseQuery).toHaveBeenCalledWith(queryOptions);
  });

  it('renders data inside a div element', () => {
    vi.mocked(useSuspenseQuery).mockReturnValue({
      data: [{ id: '1', name: 'Test User' }],
    } as ReturnType<typeof useSuspenseQuery>);

    const { container } = render(<Client />);
    const div = container.querySelector('div');
    expect(div).toBeInTheDocument();
    expect(div?.textContent).toContain('Client:');
  });

  it('uses JSON.stringify with pretty-print formatting (2-space indent)', () => {
    const mockUsers = [{ id: '1', name: 'Pretty' }];
    vi.mocked(useSuspenseQuery).mockReturnValue({
      data: mockUsers,
    } as ReturnType<typeof useSuspenseQuery>);

    render(<Client />);
    const text = document.body.textContent;
    // JSON.stringify with null, 2 uses 2-space indentation
    expect(text).toContain('"name": "Pretty"');
  });

  it('renders null/undefined data gracefully', () => {
    vi.mocked(useSuspenseQuery).mockReturnValue({
      data: null,
    } as ReturnType<typeof useSuspenseQuery>);

    expect(() => render(<Client />)).not.toThrow();
    expect(screen.getByText(/Client:/)).toBeInTheDocument();
  });
});