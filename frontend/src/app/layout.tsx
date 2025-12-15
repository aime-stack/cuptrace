import type { Metadata } from 'next';
// import { Inter } from 'next/font/google';
import { Providers } from './providers';
import { Toaster } from '@/components/ui/toaster';
import '@/styles/globals.css';

// const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'CupTrace | Blockchain Coffee & Tea Traceability',
    description: 'Track Rwandan coffee and tea from farm to cup. Powered by Cardano for immutable transparency, fair trade, and authentic verification.',
    keywords: ['Cardano', 'Blockchain', 'Supply Chain', 'Coffee', 'Tea', 'Rwanda', 'Traceability', 'AgriTech'],
    openGraph: {
        title: 'CupTrace - Farm to Cup Transparency',
        description: 'Verify the authenticity of your coffee and tea with the power of Cardano blockchain.',
        type: 'website',
        // images: ['/images/og-image.jpg'], // TODO: Add OG image if available
    }
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
