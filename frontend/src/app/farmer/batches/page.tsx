"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Loader2, Eye, MapPin, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
<<<<<<< HEAD:frontend/src/app/farmer/batches/page.tsx
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
=======
import { Badge } from "@/components/ui/badge";
>>>>>>> c259597 (All):frontend/src/app/(dashboard)/farmer/batches/page.tsx
import { useBatches } from "@/hooks/useBatches";
import { useCurrentUser } from "@/hooks/useAuth";
import { ProductType } from "@/types";

export default function BatchesPage() {
    const { data: user } = useCurrentUser();
    const [productType, setProductType] = useState<ProductType>(ProductType.coffee);
    
    const { data: batchesData, isLoading } = useBatches(
<<<<<<< HEAD:frontend/src/app/farmer/batches/page.tsx
        { farmerId: user?.id }, // Filter by current farmer
        productType
    );

    const batches = batchesData || [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Batches</h1>
                    <p className="text-muted-foreground">
                        Manage your coffee and tea harvests.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <Select value={productType} onValueChange={(value) => setProductType(value as ProductType)}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Product Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ProductType.coffee}>Coffee</SelectItem>
                            <SelectItem value={ProductType.tea}>Tea</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button asChild className="gap-2">
                        <Link href="/farmer/batches/new">
                            <Plus className="h-4 w-4" />
                            New Batch
                        </Link>
                    </Button>
                </div>
=======
        { farmerId: user?.id },
        ProductType.coffee
    );

    const batches = batchesData ?? [];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">My Batches</h1>
                <p className="text-muted-foreground">
                    Track your coffee deliveries through the supply chain.
                </p>
>>>>>>> c259597 (All):frontend/src/app/(dashboard)/farmer/batches/page.tsx
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Your Batches</CardTitle>
                    <CardDescription>
                        Batches registered on your behalf by your cooperative agent.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : batches.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No batches found.</p>
                            <p className="text-sm mt-2">
                                Your agent will register batches when you deliver coffee to the station.
                            </p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Batch ID</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Current Stage</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {batches.map((batch: any) => (
                                    <TableRow key={batch.id}>
                                        <TableCell className="font-medium">
                                            {batch.lotId || batch.id.substring(0, 8)}
                                        </TableCell>
                                        <TableCell className="capitalize">{batch.type}</TableCell>
                                        <TableCell>
                                            {format(new Date(batch.createdAt), "MMM d, yyyy")}
                                        </TableCell>
                                        <TableCell>{batch.quantity} kg</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="capitalize">
                                                {batch.currentStage?.replace('_', ' ')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={
                                                batch.status === 'approved' ? 'bg-green-600' :
                                                    batch.status === 'rejected' ? 'bg-red-600' :
                                                        batch.status === 'completed' ? 'bg-blue-600' :
                                                            'bg-yellow-600'
                                            }>
                                                {batch.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/farmer/batches/${batch.id}`}>
                                                    <Eye className="h-4 w-4" />
                                                    <span className="sr-only">View</span>
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

