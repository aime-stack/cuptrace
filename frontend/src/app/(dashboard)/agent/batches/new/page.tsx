"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, ArrowLeft, Search, User, Copy, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateBatch } from "@/hooks/useBatches";
import { useCurrentUser } from "@/hooks/useAuth";
import { ProductType, UserRole } from "@/types";
import { axiosInstance } from "@/lib/axios";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const batchSchema = z.object({
    farmerId: z.string().min(1, "Farmer is required"),
    originLocation: z.string().min(1, "Origin location is required"),
    region: z.string().optional(),
    district: z.string().optional(),
    quantity: z.coerce.number().positive("Quantity must be positive"),
    quality: z.string().optional(),
    harvestDate: z.string().optional(),
    processingType: z.string().optional(),
    description: z.string().optional(),
});

type BatchFormData = z.infer<typeof batchSchema>;

interface Farmer {
    id: string;
    name: string;
    email: string;
    phone?: string;
    city?: string;
}

export default function AgentNewBatchPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const typeParam = searchParams.get("type");
    const productType = typeParam === "tea" ? ProductType.tea : ProductType.coffee;

    const { data: user } = useCurrentUser();
    const { mutate: createBatch, isPending } = useCreateBatch(productType);

    const [farmers, setFarmers] = useState<Farmer[]>([]);
    const [loadingFarmers, setLoadingFarmers] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);

    // Success Dialog State
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [createdBatchCode, setCreatedBatchCode] = useState<string>("");
    const [copied, setCopied] = useState(false);

    const form = useForm<BatchFormData>({
        resolver: zodResolver(batchSchema),
        defaultValues: {
            farmerId: "",
            originLocation: "",
            region: "",
            district: "",
            quantity: 0,
            quality: "",
            harvestDate: "",
            processingType: "washed",
            description: "",
        },
    });

    // Fetch farmers in the agent's cooperative
    useEffect(() => {
        const fetchFarmers = async () => {
            try {
                // Fetch farmers - if agent has cooperativeId, filter by it
                const params: any = {
                    role: 'farmer',
                    limit: 100,
                };

                if (user?.cooperativeId) {
                    params.cooperativeId = user.cooperativeId;
                }

                const response = await axiosInstance.get('/auth/users', { params });

                // Handle various response formats
                let farmersList: Farmer[] = [];
                if (Array.isArray(response.data?.data)) {
                    farmersList = response.data.data;
                } else if (response.data?.data?.data && Array.isArray(response.data.data.data)) {
                    farmersList = response.data.data.data;
                } else if (Array.isArray(response.data)) {
                    farmersList = response.data;
                }

                setFarmers(farmersList);
            } catch (error) {
                console.error('Failed to fetch farmers:', error);
            } finally {
                setLoadingFarmers(false);
            }
        };

        if (user) {
            fetchFarmers();
        }
    }, [user]);

    const filteredFarmers = farmers.filter(f =>
        f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleFarmerSelect = (farmer: Farmer) => {
        setSelectedFarmer(farmer);
        form.setValue("farmerId", farmer.id);
        // Auto-fill origin location from farmer's city if available
        if (farmer.city) {
            form.setValue("originLocation", farmer.city);
        }
    };

    const onSubmit = (data: BatchFormData) => {
        // Build the batch request with required type field
        const batchRequest = {
            type: productType,
            farmerId: data.farmerId,
            originLocation: data.originLocation,
            region: data.region,
            district: data.district,
            quantity: data.quantity,
            quality: data.quality,
            harvestDate: data.harvestDate,
            processingType: data.processingType,
            description: data.description,
            cooperativeId: user?.cooperativeId,
        };

        createBatch(batchRequest, {
            onSuccess: (newBatch) => {
                // Determine the best code to show: lotId > id (first 8 chars)
                const code = newBatch.lotId || newBatch.id.substring(0, 8).toUpperCase();
                setCreatedBatchCode(code);
                setShowSuccessDialog(true);
            },
        });
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText(createdBatchCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleCloseDialog = () => {
        setShowSuccessDialog(false);
        router.push("/agent");
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Register New {productType === ProductType.tea ? 'Tea' : 'Coffee'} Batch</h1>
                    <p className="text-muted-foreground">
                        Create a batch on behalf of a farmer
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Farmer Selection */}
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Select Farmer</CardTitle>
                        <CardDescription>
                            Choose the farmer for this batch
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name, email, or ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        <div className="max-h-[400px] overflow-y-auto space-y-2">
                            {loadingFarmers ? (
                                <div className="flex justify-center py-4">
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                </div>
                            ) : filteredFarmers.length === 0 ? (
                                <p className="text-center text-sm text-muted-foreground py-4">
                                    No farmers found
                                </p>
                            ) : (
                                filteredFarmers.map((farmer) => (
                                    <div
                                        key={farmer.id}
                                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedFarmer?.id === farmer.id
                                            ? "border-primary bg-primary/5"
                                            : "hover:bg-muted"
                                            }`}
                                        onClick={() => handleFarmerSelect(farmer)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                                <User className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{farmer.name}</p>
                                                <p className="text-xs text-muted-foreground">{farmer.email}</p>
                                                <p className="text-xs text-muted-foreground font-mono">
                                                    ID: {farmer.id.substring(0, 8)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Batch Form */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Batch Details</CardTitle>
                        <CardDescription>
                            Enter the details for this {productType} batch
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                {selectedFarmer && (
                                    <div className="p-4 bg-muted/50 rounded-lg">
                                        <p className="text-sm font-medium">Selected Farmer:</p>
                                        <p className="text-lg">{selectedFarmer.name}</p>
                                    </div>
                                )}

                                <FormField
                                    control={form.control}
                                    name="farmerId"
                                    render={({ field }) => (
                                        <FormItem className="hidden">
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid gap-4 md:grid-cols-2">
                                    <FormField
                                        control={form.control}
                                        name="originLocation"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Origin Location *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g. Huye District" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="quantity"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Quantity (kg) *</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="0.1" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="processingType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Processing Type</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="washed">Washed</SelectItem>
                                                    <SelectItem value="natural">Natural</SelectItem>
                                                    <SelectItem value="honey">Honey</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="harvestDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Harvest Date</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Notes</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Any additional notes about this batch..."
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="flex gap-4">
                                    <Button type="button" variant="outline" onClick={() => router.back()}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isPending || !selectedFarmer} className="bg-green-600 hover:bg-green-700">
                                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Register Batch
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>

            {/* Success Dialog */}
            <Dialog open={showSuccessDialog} onOpenChange={handleCloseDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-center text-2xl font-bold flex flex-col items-center gap-2">
                            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                                <Check className="h-6 w-6 text-green-600" />
                            </div>
                            Registration Successful!
                        </DialogTitle>
                        <DialogDescription className="text-center">
                            The batch has been successfully registered. The farmer has been notified via SMS.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col items-center space-y-4 py-4">
                        <p className="text-sm font-medium text-muted-foreground">SHARE THIS CODE WITH THE FARMER</p>
                        <div className="flex items-center gap-2 w-full max-w-sm">
                            <div className="flex-1 bg-muted p-3 rounded-md text-center font-mono text-xl tracking-wider font-bold border">
                                {createdBatchCode}
                            </div>
                            <Button size="icon" variant="outline" onClick={handleCopyCode} className="h-12 w-12">
                                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground text-center max-w-[280px]">
                            Farmers can use this code to track the status of their batch at any time.
                        </p>
                    </div>
                    <DialogFooter className="sm:justify-center">
                        <Button onClick={handleCloseDialog} className="w-full sm:w-auto min-w-[120px]">
                            Done
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
// Force update