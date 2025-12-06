"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { batchSchema, BatchFormData } from "@/lib/validations/batch.schema";
import { useCreateBatch } from "@/hooks/useBatches";
import { ProductType } from "@/types";
import {
    COFFEE_GRADES,
    PROCESSING_TYPES,
    TEA_GRADES,
    TEA_TYPES,
    RWANDA_PROVINCES,
} from "@/lib/constants";

import { useCurrentUser } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { listUsers } from "@/services/auth.service";

export function BatchForm() {
    const router = useRouter();
    const [productType, setProductType] = useState<ProductType>(ProductType.coffee);
    const { data: user } = useCurrentUser();

    const { data: farmers } = useQuery({
        queryKey: ['farmers'],
        queryFn: () => listUsers({ role: 'farmer' }),
        enabled: user?.role === 'agent',
    });

    const { mutate: createBatch, isPending } = useCreateBatch(productType);

    const form = useForm<BatchFormData>({
        resolver: zodResolver(batchSchema),
        defaultValues: {
            type: ProductType.coffee,
            quantity: undefined,
            moisture: undefined,
            originLocation: "",
            description: "",
            region: "",
            district: "",
            sector: "",
            processingType: "",
            grade: "",
            teaType: "",
            harvestDate: "",
            pluckingDate: "",
            farmerId: undefined,
        },
    });

    // Watch type to update state and conditional rendering
    const watchedType = form.watch("type");
    if (watchedType !== productType) {
        setProductType(watchedType);
    }

    function onSubmit(data: BatchFormData) {
        createBatch(data, {
            onSuccess: () => {
                router.push("/farmer/batches");
            },
        });
    }

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Register New Batch</CardTitle>
                <CardDescription>
                    Enter the details of your harvest to create a new traceability batch.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {user?.role === 'agent' && (
                            <FormField
                                control={form.control}
                                name="farmerId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Select Farmer</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a farmer" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {farmers?.map((farmer) => (
                                                    <SelectItem key={farmer.id} value={farmer.id}>
                                                        {farmer.name} ({farmer.email})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Product Type */}
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Product Type</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select product type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value={ProductType.coffee}>Coffee</SelectItem>
                                                <SelectItem value={ProductType.tea}>Tea</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Harvest/Plucking Date */}
                            <FormField
                                control={form.control}
                                name={productType === ProductType.coffee ? "harvestDate" : "pluckingDate"}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {productType === ProductType.coffee ? "Harvest Date" : "Plucking Date"}
                                        </FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Quantity */}
                            <FormField
                                control={form.control}
                                name="quantity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Quantity (kg)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="e.g. 100"
                                                {...field}
                                                value={field.value ?? ""}
                                                onChange={(e) => {
                                                    const val = e.target.valueAsNumber;
                                                    field.onChange(isNaN(val) ? undefined : val);
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Moisture Content */}
                            <FormField
                                control={form.control}
                                name="moisture"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Moisture Content (%)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="e.g. 12.5"
                                                step="0.1"
                                                {...field}
                                                value={field.value ?? ""}
                                                onChange={(e) => {
                                                    const val = e.target.valueAsNumber;
                                                    field.onChange(isNaN(val) ? undefined : val);
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Location Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Origin Location */}
                                <FormField
                                    control={form.control}
                                    name="originLocation"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Origin Location (Name)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. Huye Mountain Farm" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Province */}
                                <FormField
                                    control={form.control}
                                    name="region"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Province</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select province" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {RWANDA_PROVINCES.map((province) => (
                                                        <SelectItem key={province} value={province}>
                                                            {province}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* District */}
                                <FormField
                                    control={form.control}
                                    name="district"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>District</FormLabel>
                                            <FormControl>
                                                <Input placeholder="District" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Sector */}
                                <FormField
                                    control={form.control}
                                    name="sector"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Sector</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Sector" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Coffee Specific Fields */}
                        {productType === ProductType.coffee && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Coffee Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="processingType"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Processing Method</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    value={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select processing" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {PROCESSING_TYPES.map((type) => (
                                                            <SelectItem key={type} value={type}>
                                                                {type}
                                                            </SelectItem>
                                                        ))}
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
                                                <Select
                                                    onValueChange={field.onChange}
                                                    value={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select grade" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {COFFEE_GRADES.map((grade) => (
                                                            <SelectItem key={grade} value={grade}>
                                                                {grade}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Tea Specific Fields */}
                        {productType === ProductType.tea && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Tea Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="teaType"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tea Type</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    value={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select tea type" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {TEA_TYPES.map((type) => (
                                                            <SelectItem key={type} value={type}>
                                                                {type}
                                                            </SelectItem>
                                                        ))}
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
                                                <Select
                                                    onValueChange={field.onChange}
                                                    value={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select grade" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {TEA_GRADES.map((grade) => (
                                                            <SelectItem key={grade} value={grade}>
                                                                {grade}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Additional Notes</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Any other details about this batch..."
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Register Batch
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}

