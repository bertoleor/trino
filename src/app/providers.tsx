'use client';

import * as React from 'react';
import { QueryClient, QueryClientProvider, isServer } from '@tanstack/react-query';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: 1,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (isServer) {
    return makeQueryClient();
  }
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

export function Providers({ children, nonce }: { children: React.ReactNode; nonce?: string }) {
  const queryClient = getQueryClient();

  return (
    <div style={{ display: 'contents' }} data-csp-nonce={nonce}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </div>
  );
}
