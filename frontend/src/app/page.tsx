import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Coffee, Leaf, Shield, TrendingUp, Users, QrCode } from 'lucide-react';

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-coffee-50 to-white">
            {/* Header */}
            <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Coffee className="h-8 w-8 text-coffee-600" />
                        <span className="text-2xl font-bold text-coffee-900">CupTrace</span>
                    </div>
                    <nav className="flex items-center gap-4">
                        <Link href="/verify">
                            <Button variant="ghost">Verify Product</Button>
                        </Link>
                        <Link href="/login">
                            <Button variant="outline">Login</Button>
                        </Link>
                        <Link href="/register">
                            <Button>Register</Button>
                        </Link>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <section className="container mx-auto px-4 py-20 text-center">
                <h1 className="text-5xl font-bold text-coffee-900 mb-6">
                    Track Your Coffee & Tea
                    <br />
                    <span className="text-coffee-600">From Farm to Cup</span>
                </h1>
                <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                    Blockchain-powered traceability system for Rwanda's coffee and tea value chains.
                    Ensuring transparency, authenticity, and fair payments.
                </p>
                <div className="flex gap-4 justify-center">
                    <Link href="/register">
                        <Button size="lg" className="gap-2">
                            <Users className="h-5 w-5" />
                            Get Started
                        </Button>
                    </Link>
                    <Link href="/verify">
                        <Button size="lg" variant="outline" className="gap-2">
                            <QrCode className="h-5 w-5" />
                            Verify Product
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Features Section */}
            <section className="container mx-auto px-4 py-16">
                <h2 className="text-3xl font-bold text-center mb-12">Why CupTrace?</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    <Card>
                        <CardHeader>
                            <Shield className="h-12 w-12 text-coffee-600 mb-4" />
                            <CardTitle>Blockchain Security</CardTitle>
                            <CardDescription>
                                Immutable records on Cardano blockchain ensure data integrity and prevent tampering
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <TrendingUp className="h-12 w-12 text-tea-600 mb-4" />
                            <CardTitle>Full Transparency</CardTitle>
                            <CardDescription>
                                Track every step from harvest to export with complete visibility for all stakeholders
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <Users className="h-12 w-12 text-coffee-600 mb-4" />
                            <CardTitle>Fair Trade</CardTitle>
                            <CardDescription>
                                Farmers know exact delivery, quality, and payment details for every batch
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </div>
            </section>

            {/* How It Works */}
            <section className="bg-coffee-50 py-16">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-coffee-600 text-white flex items-center justify-center font-bold">
                                1
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-2">Farmer Registration</h3>
                                <p className="text-gray-600">
                                    Farmers register batches with location, quality, and quantity details
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-coffee-600 text-white flex items-center justify-center font-bold">
                                2
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-2">Processing Stages</h3>
                                <p className="text-gray-600">
                                    Track washing, drying, milling, and grading at each station
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-coffee-600 text-white flex items-center justify-center font-bold">
                                3
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-2">Quality Verification</h3>
                                <p className="text-gray-600">
                                    Quality checks and certificates recorded at every stage
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-coffee-600 text-white flex items-center justify-center font-bold">
                                4
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-2">Consumer Verification</h3>
                                <p className="text-gray-600">
                                    Scan QR code to view complete journey from farm to cup
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="container mx-auto px-4 py-20 text-center">
                <Card className="max-w-2xl mx-auto">
                    <CardHeader>
                        <CardTitle className="text-3xl">Ready to Get Started?</CardTitle>
                        <CardDescription className="text-lg">
                            Join Rwanda's leading coffee and tea traceability platform
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex gap-4 justify-center">
                        <Link href="/register">
                            <Button size="lg">Register Now</Button>
                        </Link>
                        <Link href="/login">
                            <Button size="lg" variant="outline">Login</Button>
                        </Link>
                    </CardContent>
                </Card>
            </section>

            {/* Footer */}
            <footer className="border-t bg-coffee-900 text-white py-8">
                <div className="container mx-auto px-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Coffee className="h-6 w-6" />
                        <span className="text-xl font-bold">CupTrace</span>
                    </div>
                    <p className="text-coffee-200 mb-2">
                        Blockchain-powered traceability for Rwanda's coffee and tea
                    </p>
                    <p className="text-coffee-300 text-sm">
                        © 2025 CupTrace Team. Built for Cardano Hackathon 2025.
                    </p>
                </div>
            </footer>
        </div>
    );
}
