'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/react-query';

import { MeshProvider } from '@meshsdk/react';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <MeshProvider>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </MeshProvider>
    );
}
