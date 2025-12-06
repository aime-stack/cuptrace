"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, ArrowLeft, Search, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

const batchSchema = z.object({
    farmerId: z.string().min(1, "Farmer is required"),
    originLocation: z.string().min(1, "Origin location is required"),
    region: z.string().optional(),
    district: z.string().optional(),
    quantity: z.coerce.number().positive("Quantity must be positive"),
    quality: z.string().optional(),
    moisture: z.coerce.number().min(0).max(100).optional(),
    harvestDate: z.string().optional(),
    processingType: z.string().optional(),
    grade: z.string().optional(),
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
    const { data: user } = useCurrentUser();
    const { mutate: createBatch, isPending } = useCreateBatch(ProductType.coffee);

    const [farmers, setFarmers] = useState<Farmer[]>([]);
    const [loadingFarmers, setLoadingFarmers] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);

    const form = useForm<BatchFormData>({
        resolver: zodResolver(batchSchema),
        defaultValues: {
            farmerId: "",
            originLocation: "",
            region: "",
            district: "",
            quantity: 0,
            quality: "",
            moisture: undefined,
            harvestDate: "",
            processingType: "washed",
            grade: "",
            description: "",
        },
    });

    // Fetch farmers in the agent's cooperative
    useEffect(() => {
        const fetchFarmers = async () => {
            console.log('[AGENT] Current user:', user);
            console.log('[AGENT] Cooperative ID:', user?.cooperativeId);

            try {
                // Fetch farmers - if agent has cooperativeId, filter by it
                const params: any = {
                    role: 'farmer',
                    limit: 100,
                };

                if (user?.cooperativeId) {
                    params.cooperativeId = user.cooperativeId;
                }

                console.log('[AGENT] Fetching farmers with params:', params);

                const response = await axiosInstance.get('/auth/users', { params });
                console.log('[AGENT] Response:', response.data);

                // Handle various response formats
                let farmersList: Farmer[] = [];
                if (Array.isArray(response.data?.data)) {
                    farmersList = response.data.data;
                } else if (response.data?.data?.data && Array.isArray(response.data.data.data)) {
                    farmersList = response.data.data.data;
                } else if (Array.isArray(response.data)) {
                    farmersList = response.data;
                }

                console.log('[AGENT] Farmers found:', farmersList.length);
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
        createBatch(
            {
                ...data,
                cooperativeId: user?.cooperativeId,
            },
            {
                onSuccess: () => {
                    router.push("/agent");
                },
            }
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Register New Batch</h1>
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
                            Enter the details for this coffee batch
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

                                <div className="grid gap-4 md:grid-cols-3">
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
                                        name="grade"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Grade</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select grade" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="AA">AA (Premium)</SelectItem>
                                                        <SelectItem value="A">A (High)</SelectItem>
                                                        <SelectItem value="B">B (Standard)</SelectItem>
                                                        <SelectItem value="C">C (Commercial)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="moisture"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Moisture (%)</FormLabel>
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
                                    <Button type="submit" disabled={isPending || !selectedFarmer}>
                                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Register Batch
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
