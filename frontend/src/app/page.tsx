import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Coffee,
    Leaf,
    Shield,
    TrendingUp,
    Users,
    QrCode,
    ArrowRight,
    Database,
    Link as LinkIcon,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import ScannerButton from '@/components/ScannerButton';

export default function HomePage() {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300 font-sans">
            {/* Header */}
            <header className="fixed w-full border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-50 dark:border-gray-800">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-coffee-600 dark:bg-coffee-500 p-2 rounded-lg">
                            <Coffee className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-coffee-900 dark:text-white tracking-tight">CupTrace</span>
                    </div>
                    <nav className="flex items-center gap-2 sm:gap-6">
                        <Link href="/verify" className="hidden md:block text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-coffee-600 dark:hover:text-white transition-colors">
                            Verify
                        </Link>
                        <Link href="/login" className="hidden sm:block">
                            <Button variant="ghost" className="dark:text-gray-300 dark:hover:text-white">Login</Button>
                        </Link>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] dark:opacity-[0.05] pointer-events-none" />
                <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-br from-coffee-100/30 to-transparent dark:from-coffee-900/10 blur-3xl -z-10" />
                <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-tea-100/30 to-transparent dark:from-teal-900/10 blur-3xl -z-10" />

                <div className="container mx-auto px-4 text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-coffee-50 dark:bg-coffee-900/30 text-coffee-700 dark:text-coffee-300 text-sm font-medium mb-8 border border-coffee-100 dark:border-coffee-800 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-coffee-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-coffee-500"></span>
                        </span>
                        Live on Cardano Testnet
                    </div>

                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-8 tracking-tight leading-tight animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                        Rwanda's Coffee & Tea
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-coffee-600 to-coffee-800 dark:from-coffee-400 dark:to-coffee-600">
                            Transparently Tracked
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                        A blockchain-powered platform ensuring fair payments for farmers and absolute authenticity for consumers. From harvest to your cup.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                        <Link href="/verify" className="w-full sm:w-auto">
                            <Button size="lg" className="gap-2 w-full sm:w-auto h-14 px-8 text-lg bg-gray-900 hover:bg-black dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 border-0 shadow-xl">
                                <QrCode className="h-5 w-5" />
                                View Demo
                            </Button>
                        </Link>
                        <Link href="/register" className="w-full sm:w-auto">
                            <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto h-14 px-8 text-lg bg-white dark:bg-transparent border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-white">
                                <Users className="h-5 w-5" />
                                For Cooperatives
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Problem & Solution */}
            <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-12 lg:gap-24 items-center">
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-coffee-600 dark:text-coffee-500 font-semibold mb-2 flex items-center gap-2">
                                    <AlertCircle className="h-5 w-5" /> The Problem
                                </h3>
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">A Broken Supply Chain</h2>
                                <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                                    Coffee and tea supply chains suffer from a lack of transparency. Farmers often receive unfair payments, quality data is manipulated, and consumers have no way to verify the true origin of their products.
                                </p>
                            </div>

                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                <ul className="space-y-4">
                                    <li className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                                        <div className="bg-red-100 dark:bg-red-900/30 p-1 rounded text-red-600 dark:text-red-400 mt-1">
                                            <ArrowRight className="h-3 w-3" />
                                        </div>
                                        <span>Data siloed in disconnected systems</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                                        <div className="bg-red-100 dark:bg-red-900/30 p-1 rounded text-red-600 dark:text-red-400 mt-1">
                                            <ArrowRight className="h-3 w-3" />
                                        </div>
                                        <span>Paper-based records prone to manipulation</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                                        <div className="bg-red-100 dark:bg-red-900/30 p-1 rounded text-red-600 dark:text-red-400 mt-1">
                                            <ArrowRight className="h-3 w-3" />
                                        </div>
                                        <span>Lack of trust between stakeholders</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div>
                                <h3 className="text-green-600 dark:text-green-500 font-semibold mb-2 flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5" /> The CupTrace Solution
                                </h3>
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Immutable Trust</h2>
                                <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                                    We use blockchain technology to create a digital passport for every batch. Every transition—from farmer to washing station to exporter—is recorded permanently on the Cardano blockchain.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Card className="bg-white dark:bg-gray-800 border-green-100 dark:border-green-900/30 shadow-none">
                                    <CardContent className="p-6">
                                        <Database className="h-8 w-8 text-green-600 dark:text-green-500 mb-3" />
                                        <h4 className="font-bold text-gray-900 dark:text-white">Tamper-Proof</h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Records cannot be altered once written</p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-white dark:bg-gray-800 border-green-100 dark:border-green-900/30 shadow-none">
                                    <CardContent className="p-6">
                                        <Users className="h-8 w-8 text-green-600 dark:text-green-500 mb-3" />
                                        <h4 className="font-bold text-gray-900 dark:text-white">Fair Pay</h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Smart contracts verify payments</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Cardano */}
            <section className="py-20 bg-gray-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-coffee-900/20 blur-3xl rounded-full" />

                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/50 border border-blue-700/50 text-blue-200 text-xs font-bold uppercase tracking-wider mb-6">
                            Powered by Cardano
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">Built on Robust Infrastructure</h2>
                        <p className="text-gray-300 text-lg">
                            We chose Cardano for its unmatched security, scalability, and sustainability.
                            CupTrace leverages the EUTxO model for reliable supply chain tracking.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700 hover:border-blue-500/50 transition-colors">
                            <Shield className="h-10 w-10 text-blue-400 mb-6" />
                            <h3 className="text-xl font-bold mb-3">Data Integrity</h3>
                            <p className="text-gray-400">
                                Critical supply chain events are hashed and stored on-chain, providing mathematical proof of authenticity without exposing sensitive business data.
                            </p>
                        </div>
                        <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700 hover:border-blue-500/50 transition-colors">
                            <LinkIcon className="h-10 w-10 text-blue-400 mb-6" />
                            <h3 className="text-xl font-bold mb-3">Smart Contracts</h3>
                            <p className="text-gray-400">
                                Aiken-based smart contracts automate verification logic, ensuring that a batch cannot move to the next stage unless quality standards are met.
                            </p>
                        </div>
                        <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700 hover:border-blue-500/50 transition-colors">
                            <Leaf className="h-10 w-10 text-blue-400 mb-6" />
                            <h3 className="text-xl font-bold mb-3">Sustainable</h3>
                            <p className="text-gray-400">
                                Cardano's Proof-of-Stake consensus consumes a fraction of the energy of other blockchains, aligning with our eco-friendly mission.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Architecture / Flow */}
            <section className="py-20 container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-16 text-gray-900 dark:text-white">Farm to Cup Journey</h2>

                <div className="relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-coffee-200 via-coffee-400 to-coffee-200 -translate-y-1/2 z-0 opacity-30" />

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-8 relative z-10">
                        <div className="flex flex-col items-center text-center group">
                            <div className="w-16 h-16 rounded-full bg-white dark:bg-gray-800 border-4 border-coffee-100 dark:border-gray-700 flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300">
                                <span className="text-2xl">👨‍🌾</span>
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white">Farmer</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Harvest & Weighing</p>
                        </div>

                        <div className="flex flex-col items-center text-center group">
                            <div className="w-16 h-16 rounded-full bg-white dark:bg-gray-800 border-4 border-coffee-100 dark:border-gray-700 flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300">
                                <span className="text-2xl">🏭</span>
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white">Station</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Washing & Drying</p>
                        </div>

                        <div className="flex flex-col items-center text-center group">
                            <div className="w-16 h-16 rounded-full bg-white dark:bg-gray-800 border-4 border-coffee-100 dark:border-gray-700 flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300">
                                <span className="text-2xl">🔬</span>
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white">QC Lab</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Grading & Testing</p>
                        </div>

                        <div className="flex flex-col items-center text-center group">
                            <div className="w-16 h-16 rounded-full bg-white dark:bg-gray-800 border-4 border-coffee-100 dark:border-gray-700 flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300">
                                <span className="text-2xl">✈️</span>
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white">Exporter</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Shipping & Logistics</p>
                        </div>

                        <div className="flex flex-col items-center text-center group">
                            <div className="w-16 h-16 rounded-full bg-white dark:bg-gray-800 border-4 border-coffee-100 dark:border-gray-700 flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300">
                                <span className="text-2xl">☕</span>
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white">Consumer</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Scan & Verify</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Meet the Team</h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            A passionate team of developers and innovators building the future of African agri-tech.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
                        <div className="order-2 md:order-1 relative rounded-2xl overflow-hidden shadow-2xl rotate-1 hover:rotate-0 transition-transform duration-500">
                            <div className="aspect-[4/3] bg-gray-200 relative">
                                <Image
                                    src="/images/team.jpg"
                                    alt="CupTrace Team"
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <div className="absolute bottom-4 left-4 text-white">
                                    <p className="font-bold text-lg">Cardano Africa Tech Summit</p>
                                    <p className="text-sm opacity-80">Nairobi, 2024</p>
                                </div>
                            </div>
                        </div>

                        <div className="order-1 md:order-2 grid gap-6">
                            {[
                                { name: "Aime P. Mwizerwa", role: "Lead Developer & Innovator" },
                                { name: "Etienne Tuyihamye", role: "Developer" },
                                { name: "Iragena D.", role: "Innovator" },
                                { name: "Uwizeye Magnifique", role: "Community Member" },
                                { name: "Didier I.", role: "Community Member" }
                            ].map((member, i) => (
                                <div key={i} className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="h-10 w-10 rounded-full bg-coffee-100 dark:bg-coffee-900 flex items-center justify-center text-coffee-700 dark:text-coffee-300 font-bold">
                                        {member.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white">{member.name}</h4>
                                        <p className="text-xs uppercase tracking-wider text-coffee-600 dark:text-coffee-500 font-semibold">{member.role}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 text-center bg-coffee-900 dark:bg-black text-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-coffee-800/40 via-transparent to-transparent" />

                <div className="container mx-auto px-4 relative z-10">
                    <h2 className="text-4xl md:text-5xl font-bold mb-8">Ready to Transform Traceability?</h2>
                    <p className="text-xl text-coffee-100 mb-12 max-w-2xl mx-auto">
                        Join us in building a transparent, fair, and sustainable future for Rwanda's coffee and tea.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <Link href="/register">
                            <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg bg-coffee-500 hover:bg-coffee-600 text-white border-0">
                                Create Account
                            </Button>
                        </Link>
                        <Link href="mailto:contact@cuptrace.rw">
                            <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg bg-transparent border-white text-white hover:bg-white hover:text-coffee-900">
                                Contact Team
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-950 text-white py-12 border-t border-gray-900">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="flex items-center gap-2">
                            <Coffee className="h-6 w-6 text-coffee-500" />
                            <span className="text-xl font-bold">CupTrace</span>
                        </div>
                        <div className="text-gray-500 text-sm">
                            <p>© 2025 CupTrace. All rights reserved.</p>
                            <p className="mt-1">Built for the Cardano Ecosystem.</p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
