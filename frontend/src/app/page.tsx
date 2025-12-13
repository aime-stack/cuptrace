import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Coffee, Leaf, Shield, TrendingUp, Users, QrCode } from 'lucide-react';
import ScannerButton from '@/components/ScannerButton';
export default function HomePage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-coffee-50 to-white dark:from-gray-950 dark:to-gray-900 transition-colors duration-300">
            {/* Header */}
            <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50 dark:border-gray-800">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Coffee className="h-8 w-8 text-coffee-600 dark:text-coffee-500" />
                        <span className="text-2xl font-bold text-coffee-900 dark:text-white">CupTrace</span>
                    </div>
                    <nav className="flex items-center gap-2 sm:gap-4">
                        <Link href="/verify" className="hidden sm:block">
                            <Button variant="ghost" className="dark:text-gray-300 dark:hover:text-white">Verify Product</Button>
                        </Link>
                        <Link href="/login">
                            <Button variant="outline" className="dark:bg-transparent dark:border-gray-700 dark:text-white">Login</Button>
                        </Link>
                        <Link href="/register" className="hidden xs:block">
                            <Button className="bg-coffee-600 hover:bg-coffee-700 text-white border-0">Register</Button>
                        </Link>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <section className="container mx-auto px-4 py-12 md:py-20 text-center">
                <h1 className="text-3xl md:text-5xl font-bold text-coffee-900 dark:text-white mb-6">
                    Track Your Coffee & Tea
                    <br />
                    <span className="text-coffee-600 dark:text-coffee-500">From Farm to Cup</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                    Blockchain-powered traceability system for Rwanda&apos;s coffee and tea value chains.
                    Ensuring transparency, authenticity, and fair payments.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                    <Link href="/register" className="w-full sm:w-auto">
                        <Button size="lg" className="gap-2 w-full sm:w-auto bg-coffee-600 hover:bg-coffee-700 text-white border-0">
                            <Users className="h-5 w-5" />
                            Get Started
                        </Button>
                    </Link>
                    <div className="w-full sm:w-auto">
                        <ScannerButton className="w-full sm:w-auto" />
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="container mx-auto px-4 py-12 md:py-16">
                <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">Why CupTrace?</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    <Card className="dark:bg-gray-800 dark:border-gray-700">
                        <CardHeader>
                            <Shield className="h-12 w-12 text-coffee-600 dark:text-coffee-500 mb-4" />
                            <CardTitle className="dark:text-white">Blockchain Security</CardTitle>
                            <CardDescription className="dark:text-gray-400">
                                Immutable records on Cardano blockchain ensure data integrity and prevent tampering
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    <Card className="dark:bg-gray-800 dark:border-gray-700">
                        <CardHeader>
                            <TrendingUp className="h-12 w-12 text-tea-600 dark:text-green-500 mb-4" />
                            <CardTitle className="dark:text-white">Full Transparency</CardTitle>
                            <CardDescription className="dark:text-gray-400">
                                Track every step from harvest to export with complete visibility for all stakeholders
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    <Card className="dark:bg-gray-800 dark:border-gray-700">
                        <CardHeader>
                            <Users className="h-12 w-12 text-coffee-600 dark:text-coffee-500 mb-4" />
                            <CardTitle className="dark:text-white">Fair Trade</CardTitle>
                            <CardDescription className="dark:text-gray-400">
                                Farmers know exact delivery, quality, and payment details for every batch
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </div>
            </section>

            {/* How It Works */}
            <section className="bg-coffee-50 dark:bg-gray-900 py-16 transition-colors duration-300">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">How It Works</h2>
                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-coffee-600 dark:bg-coffee-500 text-white flex items-center justify-center font-bold">
                                1
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-2 dark:text-white">Farmer Registration</h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Farmers register batches with location, quality, and quantity details
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-coffee-600 dark:bg-coffee-500 text-white flex items-center justify-center font-bold">
                                2
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-2 dark:text-white">Processing Stages</h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Track washing, drying, milling, and grading at each station
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-coffee-600 dark:bg-coffee-500 text-white flex items-center justify-center font-bold">
                                3
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-2 dark:text-white">Quality Verification</h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Quality checks and certificates recorded at every stage
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-coffee-600 dark:bg-coffee-500 text-white flex items-center justify-center font-bold">
                                4
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-2 dark:text-white">Consumer Verification</h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Scan QR code to view complete journey from farm to cup
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="container mx-auto px-4 py-20 text-center">
                <Card className="max-w-2xl mx-auto dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader>
                        <CardTitle className="text-3xl dark:text-white">Ready to Get Started?</CardTitle>
                        <CardDescription className="text-lg dark:text-gray-400">
                            Join Rwanda&apos;s leading coffee and tea traceability platform
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/register" className="w-full sm:w-auto">
                            <Button size="lg" className="w-full sm:w-auto bg-coffee-600 hover:bg-coffee-700 text-white border-0">Register Now</Button>
                        </Link>
                        <Link href="/login" className="w-full sm:w-auto">
                            <Button size="lg" variant="outline" className="w-full sm:w-auto dark:text-white dark:border-gray-600 dark:hover:bg-gray-700">Login</Button>
                        </Link>
                    </CardContent>
                </Card>
            </section>

            {/* Footer */}
            <footer className="border-t bg-coffee-900 dark:bg-gray-950 text-white py-8 border-coffee-800 dark:border-gray-800">
                <div className="container mx-auto px-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Coffee className="h-6 w-6 text-coffee-400" />
                        <span className="text-xl font-bold">CupTrace</span>
                    </div>
                    <p className="text-coffee-200 dark:text-gray-400 mb-2">
                        Blockchain-powered traceability for Rwanda&apos;s coffee and tea
                    </p>
                    <p className="text-coffee-300 dark:text-gray-500 text-sm">
                        © 2025 CupTrace Team. Built for Cardano Hackathon 2025.
                    </p>
                </div>
            </footer>
        </div>
    );
}
