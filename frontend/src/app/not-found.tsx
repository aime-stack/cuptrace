import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Coffee, Home } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-center px-4">
            <div className="space-y-6 max-w-md">
                <div className="flex justify-center">
                    <div className="h-24 w-24 rounded-full bg-coffee-100 dark:bg-coffee-900/20 flex items-center justify-center">
                        <Coffee className="h-12 w-12 text-coffee-600 dark:text-coffee-400" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
                        404
                    </h1>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                        Page Not Found
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">
                        Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved or doesn&apos;t exist.
                    </p>
                </div>

                <Button asChild className="gap-2">
                    <Link href="/">
                        <Home className="h-4 w-4" />
                        Back to Home
                    </Link>
                </Button>
            </div>
        </div>
    )
}
