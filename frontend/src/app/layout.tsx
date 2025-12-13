import type { Metadata } from 'next';
// import { Inter } from 'next/font/google';
import { Providers } from './providers';
import { Toaster } from '@/components/ui/toaster';
import '@/styles/globals.css';

// const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'CupTrace - Coffee & Tea Traceability',
    description: 'Blockchain-powered traceability system for Rwanda\'s coffee and tea value chains',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            {/* <body className={inter.className}> */}
            <body>
                <Providers>
                    {children}
                    <Toaster />
                </Providers>
            </body>
        </html>
    );
}
