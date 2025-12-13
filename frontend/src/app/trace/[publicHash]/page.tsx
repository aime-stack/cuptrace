'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
    Coffee,
    MapPin,
    Calendar,
    CheckCircle,
    Shield,
    Package,
    ArrowLeft,
    ExternalLink,
    Loader2,
    Leaf,
    Award,
    Clock,
    QrCode,
    Heart,
    Star,
    CreditCard,
    ThumbsUp,
    ChevronLeft
} from 'lucide-react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { axiosInstance } from '@/lib/axios';
import { toast } from 'sonner';

interface TraceData {
    publicTraceHash: string;
    lotId?: string;
    type: 'coffee' | 'tea';
    status: string;
    origin: {
        region?: string;
        country: string;
    };
    product: {
        grade?: string;
        quality?: string;
        processingType?: string;
        teaType?: string;
        quantity?: number;
        harvestDate?: string;
    };
    farmer?: {
        displayName: string;
        publicHash?: string;
    };
    cooperative?: {
        name: string;
        region?: string;
    };
    qc: {
        isApproved: boolean;
        qrCodeUrl?: string;
    };
    blockchain: {
        txHash?: string;
        nftPolicyId?: string;
        nftAssetName?: string;
        nftMintedAt?: string;
    };
    timeline: Array<{
        id: string;
        stage: string;
        timestamp: string;
        notes?: string;
    }>;
    events: Array<{
        id: string;
        type: string;
        timestamp: string;
        description?: string;
        location?: string;
    }>;
    certificates: Array<{
        id: string;
        certificateType: string;
        certificateNumber: string;
        issuedBy: string;
        issuedDate: string;
        expiryDate?: string;
    }>;
    description?: string;
    tags?: string[];
    createdAt: string;
    updatedAt: string;
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

function getStageLabel(stage: string): string {
    const labels: Record<string, string> = {
        farmer: 'Farmer Harvest',
        washing_station: 'Washing Station',
        factory: 'Factory Processing',
        exporter: 'Export Ready',
        importer: 'Imported',
        retailer: 'Retail',
    };
    return labels[stage] || stage;
}

function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
        exported: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
}

export default function TracePage() {
    const params = useParams();
    const publicHash = params.publicHash as string;

    const [traceData, setTraceData] = useState<TraceData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Rating State
    const [isRatingOpen, setIsRatingOpen] = useState(false);
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');
    const [isSubmittingRating, setIsSubmittingRating] = useState(false);

    // Donation State
    const [isDonationOpen, setIsDonationOpen] = useState(false);
    const [donationAmount, setDonationAmount] = useState('');
    const [donationMessage, setDonationMessage] = useState('');
    const [isProcessingDonation, setIsProcessingDonation] = useState(false);

    useEffect(() => {
        const fetchTraceData = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get(`/api/trace/${publicHash}`);
                if (response.data?.success) {
                    setTraceData(response.data.data);
                } else {
                    setError('Failed to load trace data');
                }
            } catch (err) {
                console.error('Error fetching trace:', err);
                setError('Product not found or invalid trace code');
            } finally {
                setLoading(false);
            }
        };

        if (publicHash) {
            fetchTraceData();
        }
    }, [publicHash]);

    const handleRatingSubmit = async () => {
        if (rating === 0) {
            toast.error("Please select a star rating");
            return;
        }
        setIsSubmittingRating(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success("Thank you for your review!");
        setIsSubmittingRating(false);
        setIsRatingOpen(false);
        setRating(0);
        setReview('');
    };

    const handleDonationSubmit = async () => {
        if (!donationAmount || isNaN(Number(donationAmount)) || Number(donationAmount) <= 0) {
            toast.error("Please enter a valid donation amount");
            return;
        }
        setIsProcessingDonation(true);
        // Simulate API/Payment call
        await new Promise(resolve => setTimeout(resolve, 1500));
        toast.success(`Thank you! Your donation of $${donationAmount} has been sent to the farmer.`);
        setIsProcessingDonation(false);
        setIsDonationOpen(false);
        setDonationAmount('');
        setDonationMessage('');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-coffee-50 to-white dark:from-gray-950 dark:to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-coffee-600 dark:text-coffee-500 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Loading product trace...</p>
                </div>
            </div>
        );
    }

    if (error || !traceData) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-coffee-50 to-white dark:from-gray-950 dark:to-gray-900">
                <div className="container mx-auto px-4 py-12 max-w-4xl">
                    <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-900/40">
                        <CardContent className="py-12 text-center">
                            <Package className="h-16 w-16 text-red-400 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-red-900 dark:text-red-400 mb-2">Product Not Found</h2>
                            <p className="text-red-700 dark:text-red-300 mb-6">
                                {error || 'The trace code you entered is not valid or the product could not be found.'}
                            </p>
                            <Link href="/">
                                <Button variant="outline" className="dark:text-white dark:border-gray-700 dark:hover:bg-gray-800">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Home
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    const ProductIcon = traceData.type === 'coffee' ? Coffee : Leaf;

    return (
        <div className="min-h-screen bg-gradient-to-b from-coffee-50 to-white dark:from-gray-950 dark:to-gray-900 transition-colors duration-300">
            {/* Header */}
            <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50 dark:border-gray-800">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <Coffee className="h-8 w-8 text-coffee-600 dark:text-coffee-500" />
                        <span className="text-2xl font-bold text-coffee-900 dark:text-white">CupTrace</span>
                    </Link>
                    <Badge variant="outline" className="text-coffee-600 border-coffee-300 dark:text-coffee-400 dark:border-coffee-800">
                        <Shield className="h-3 w-3 mr-1" />
                        Verified Product
                    </Badge>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Back Link */}
                <Button variant="outline" size="icon" className="h-8 w-8 shrink-0 mb-6" asChild>
                    <Link href="/">
                        <ChevronLeft className="h-4 w-4" />
                    </Link>
                </Button>

                {/* Verification Banner */}
                <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/10 dark:border-green-800 mb-6">
                    <CardContent className="py-6">
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-green-900 dark:text-green-100">
                                    Verified {traceData.type === 'coffee' ? 'Coffee' : 'Tea'} Product
                                </h1>
                                <p className="text-green-700 dark:text-green-300">
                                    Trace ID: {traceData.publicTraceHash}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Consumer Engagement Card */}
                <Card className="mb-6 border-coffee-200 shadow-md dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader className="bg-coffee-50/50 dark:bg-gray-800/50 border-b dark:border-gray-700">
                        <CardTitle className="flex items-center gap-2 text-coffee-900 dark:text-white">
                            <Heart className="h-5 w-5 text-red-500 fill-red-500" />
                            Support & Connect
                        </CardTitle>
                        <CardDescription className="dark:text-gray-400">
                            Directly impact the livelihood of the farmer who grew this {traceData.type}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid sm:grid-cols-2 gap-4">
                            {/* Vote / Rate */}
                            <div className="flex flex-col gap-2">
                                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Star className="h-4 w-4 text-yellow-500" /> Rate Product
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Did you enjoy this cup? Let the producer know!
                                </p>
                                <Dialog open={isRatingOpen} onOpenChange={setIsRatingOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" className="w-full mt-2 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700">
                                            <ThumbsUp className="h-4 w-4 mr-2" />
                                            Leave a Review
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[425px] dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                                        <DialogHeader>
                                            <DialogTitle>Rate this Product</DialogTitle>
                                            <DialogDescription className="dark:text-gray-400">
                                                Share your feedback directly with the farmer and cooperative.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="flex justify-center gap-2 py-2">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        onClick={() => setRating(star)}
                                                        className={`p-1 rounded-full transition-colors ${rating >= star ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                                                    >
                                                        <Star className={`h-8 w-8 ${rating >= star ? 'fill-current' : ''}`} />
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="review" className="dark:text-gray-200">Your Message (Optional)</Label>
                                                <Textarea
                                                    id="review"
                                                    placeholder="Tasting notes, appreciation, etc..."
                                                    value={review}
                                                    onChange={(e) => setReview(e.target.value)}
                                                    className="dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button onClick={handleRatingSubmit} disabled={isSubmittingRating || rating === 0} className="bg-coffee-600 hover:bg-coffee-700 text-white">
                                                {isSubmittingRating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                                Submit Review
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>

                            {/* Donate */}
                            <div className="flex flex-col gap-2">
                                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <CreditCard className="h-4 w-4 text-green-600" /> Tip the Farmer
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Send a direct tip to supports sustainable farming.
                                </p>
                                <Dialog open={isDonationOpen} onOpenChange={setIsDonationOpen}>
                                    <DialogTrigger asChild>
                                        <Button className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white">
                                            <Heart className="h-4 w-4 mr-2" />
                                            Donate Now
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[425px] dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                                        <DialogHeader>
                                            <DialogTitle>Support the Farmer</DialogTitle>
                                            <DialogDescription className="dark:text-gray-400">
                                                100% of your tip goes directly to {traceData.farmer?.displayName || 'the farmer'} via mobile money.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid grid-cols-3 gap-2">
                                                {['1', '3', '5'].map((amt) => (
                                                    <Button
                                                        key={amt}
                                                        variant={donationAmount === amt ? "default" : "outline"}
                                                        onClick={() => setDonationAmount(amt)}
                                                        className={`border-green-200 hover:bg-green-50 hover:text-green-700 dark:border-green-800 dark:hover:bg-green-900/30 ${donationAmount === amt ? 'bg-green-600 dark:bg-green-700' : ''}`}
                                                    >
                                                        ${amt}
                                                    </Button>
                                                ))}
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="custom-amount" className="dark:text-gray-200">Custom Amount ($)</Label>
                                                <Input
                                                    id="custom-amount"
                                                    type="number"
                                                    min="1"
                                                    placeholder="Enter amount"
                                                    value={donationAmount}
                                                    onChange={(e) => setDonationAmount(e.target.value)}
                                                    className="dark:bg-gray-700 dark:border-gray-600"
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="message" className="dark:text-gray-200">Message (Optional)</Label>
                                                <Textarea
                                                    id="message"
                                                    placeholder="Add a note to your donation..."
                                                    value={donationMessage}
                                                    onChange={(e) => setDonationMessage(e.target.value)}
                                                    className="dark:bg-gray-700 dark:border-gray-600"
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button onClick={handleDonationSubmit} disabled={isProcessingDonation || !donationAmount} className="bg-green-600 hover:bg-green-700 text-white w-full">
                                                {isProcessingDonation ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Heart className="h-4 w-4 mr-2" />}
                                                Send Donation
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Product Info */}
                    <Card className="dark:bg-gray-800 dark:border-gray-700">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 dark:text-white">
                                <ProductIcon className="h-5 w-5 text-coffee-600 dark:text-coffee-500" />
                                Product Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 dark:text-gray-400">Lot ID</span>
                                <span className="font-mono font-medium dark:text-gray-200">{traceData.lotId || traceData.publicTraceHash}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 dark:text-gray-400">Type</span>
                                <Badge className="dark:bg-gray-700 dark:text-gray-200">{traceData.type.toUpperCase()}</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 dark:text-gray-400">Status</span>
                                <Badge className={getStatusColor(traceData.status)}>
                                    {traceData.status}
                                </Badge>
                            </div>
                            {traceData.product.grade && (
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 dark:text-gray-400">Grade</span>
                                    <span className="font-medium dark:text-gray-200">{traceData.product.grade}</span>
                                </div>
                            )}
                            {traceData.product.quantity && (
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 dark:text-gray-400">Quantity</span>
                                    <span className="font-medium dark:text-gray-200">{traceData.product.quantity} kg</span>
                                </div>
                            )}
                            {traceData.product.processingType && (
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 dark:text-gray-400">Processing</span>
                                    <span className="font-medium capitalize dark:text-gray-200">{traceData.product.processingType}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Origin Info */}
                    <Card className="dark:bg-gray-800 dark:border-gray-700">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 dark:text-white">
                                <MapPin className="h-5 w-5 text-coffee-600 dark:text-coffee-500" />
                                Origin
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 dark:text-gray-400">Country</span>
                                <span className="font-medium dark:text-gray-200">{traceData.origin.country}</span>
                            </div>
                            {traceData.origin.region && (
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 dark:text-gray-400">Region</span>
                                    <span className="font-medium dark:text-gray-200">{traceData.origin.region}</span>
                                </div>
                            )}
                            {traceData.farmer && (
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 dark:text-gray-400">Producer</span>
                                    <span className="font-medium dark:text-gray-200">{traceData.farmer.displayName}</span>
                                </div>
                            )}
                            {traceData.cooperative && (
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 dark:text-gray-400">Cooperative</span>
                                    <span className="font-medium dark:text-gray-200">{traceData.cooperative.name}</span>
                                </div>
                            )}
                            {traceData.product.harvestDate && (
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 dark:text-gray-400">Harvest Date</span>
                                    <span className="font-medium dark:text-gray-200">{formatDate(traceData.product.harvestDate)}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* QR Code */}
                {traceData.qc.qrCodeUrl && (
                    <Card className="mt-6 dark:bg-gray-800 dark:border-gray-700">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 dark:text-white">
                                <QrCode className="h-5 w-5 text-coffee-600 dark:text-coffee-500" />
                                Product QR Code
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex justify-center">
                            <Image
                                src={traceData.qc.qrCodeUrl}
                                alt="Product QR Code"
                                width={192}
                                height={192}
                                className="w-48 h-48 border rounded-lg shadow-sm bg-white"
                            />
                        </CardContent>
                    </Card>
                )}

                {/* Timeline */}
                {traceData.timeline.length > 0 && (
                    <Card className="mt-6 dark:bg-gray-800 dark:border-gray-700">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 dark:text-white">
                                <Clock className="h-5 w-5 text-coffee-600 dark:text-coffee-500" />
                                Supply Chain Journey
                            </CardTitle>
                            <CardDescription className="dark:text-gray-400">Track the complete journey from farm to cup</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {traceData.timeline.map((item, index) => (
                                    <div key={item.id} className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${index === 0 ? 'bg-coffee-600 text-white' : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                                                }`}>
                                                {index + 1}
                                            </div>
                                            {index < traceData.timeline.length - 1 && (
                                                <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-700 my-2" />
                                            )}
                                        </div>
                                        <div className="flex-1 pb-4">
                                            <p className="font-medium dark:text-white">{getStageLabel(item.stage)}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(item.timestamp)}</p>
                                            {item.notes && (
                                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{item.notes}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Certifications */}
                {traceData.certificates.length > 0 && (
                    <Card className="mt-6 dark:bg-gray-800 dark:border-gray-700">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 dark:text-white">
                                <Award className="h-5 w-5 text-coffee-600 dark:text-coffee-500" />
                                Certifications
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {traceData.certificates.map((cert) => (
                                    <div key={cert.id} className="p-4 border rounded-lg dark:border-gray-700">
                                        <p className="font-medium capitalize dark:text-white">{cert.certificateType.replace('_', ' ')}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">#{cert.certificateNumber}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Issued by: {cert.issuedBy}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(cert.issuedDate)}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Blockchain Info */}
                {traceData.blockchain.nftPolicyId && (
                    <Card className="mt-6 border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-900/40">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-300">
                                <Shield className="h-5 w-5" />
                                Blockchain Verification
                            </CardTitle>
                            <CardDescription className="text-blue-700 dark:text-blue-400">
                                This product is verified on the Cardano blockchain
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <p className="text-sm text-blue-700 dark:text-blue-400">NFT Policy ID</p>
                                <p className="font-mono text-sm text-blue-900 dark:text-blue-200 break-all">
                                    {traceData.blockchain.nftPolicyId}
                                </p>
                            </div>
                            {traceData.blockchain.txHash && (
                                <div>
                                    <p className="text-sm text-blue-700 dark:text-blue-400">Transaction Hash</p>
                                    <a
                                        href={`https://preprod.cardanoscan.io/transaction/${traceData.blockchain.txHash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-mono text-sm text-blue-600 dark:text-blue-300 hover:underline break-all inline-flex items-center gap-1"
                                    >
                                        {traceData.blockchain.txHash.substring(0, 20)}...
                                        <ExternalLink className="h-3 w-3" />
                                    </a>
                                </div>
                            )}
                            {traceData.blockchain.nftMintedAt && (
                                <div>
                                    <p className="text-sm text-blue-700 dark:text-blue-400">Minted On</p>
                                    <p className="text-sm text-blue-900 dark:text-blue-200">{formatDate(traceData.blockchain.nftMintedAt)}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Footer */}
                <div className="mt-8 text-center text-gray-500 text-sm dark:text-gray-500">
                    <p>Verified by CupTrace - Blockchain-powered traceability</p>
                    <p className="mt-1">© 2025 CupTrace Team</p>
                </div>
            </div>
        </div>
    );
}
