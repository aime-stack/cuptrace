'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/react-query';

import dynamic from 'next/dynamic';
import { ThemeProvider } from '@/components/theme-provider';

const MeshProvider = dynamic(() => import('@meshsdk/react').then(mod => mod.MeshProvider), {
    ssr: false,
});

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <MeshProvider>
            <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
            >
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            </ThemeProvider>
        </MeshProvider>
    );
}
