"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Plus, Loader2, Eye, Users, Package, TrendingUp } from "lucide-react";

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
import { Badge } from "@/components/ui/badge";
import { useBatches } from "@/hooks/useBatches";
import { useCurrentUser } from "@/hooks/useAuth";
import { ProductType } from "@/types";

export default function AgentDashboard() {
    const { data: user } = useCurrentUser();
    const { data: batchesData, isLoading } = useBatches(
        { cooperativeId: user?.cooperativeId }, // Filter by agent's cooperative
        ProductType.coffee
    );

    const batches = batchesData ?? [];

    // Stats
    const todayBatches = batches.filter((b: any) => {
        const today = new Date();
        const batchDate = new Date(b.createdAt);
        return batchDate.toDateString() === today.toDateString();
    });

    const pendingBatches = batches.filter((b: any) => b.status === 'pending');

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Agent Dashboard</h1>
                    <p className="text-muted-foreground">
                        Register and manage batches for farmers in your cooperative.
                    </p>
                </div>
                <Button asChild>
                    <Link href="/agent/batches/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Register New Batch
                    </Link>
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Today's Batches</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{todayBatches.length}</div>
                        <p className="text-xs text-muted-foreground">Registered today</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingBatches.length}</div>
                        <p className="text-xs text-muted-foreground">Awaiting approval</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Batches</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{batches.length}</div>
                        <p className="text-xs text-muted-foreground">All time</p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Batches */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Batches</CardTitle>
                    <CardDescription>
                        Batches you've registered for farmers.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : batches.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No batches found. Register your first batch to get started.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Batch ID</TableHead>
                                    <TableHead>Farmer</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {batches.slice(0, 10).map((batch: any) => (
                                    <TableRow key={batch.id}>
                                        <TableCell className="font-medium">
                                            {batch.lotId || batch.id.substring(0, 8)}
                                        </TableCell>
                                        <TableCell>{batch.farmer?.name || "Unknown"}</TableCell>
                                        <TableCell>
                                            {format(new Date(batch.createdAt), "MMM d, yyyy")}
                                        </TableCell>
                                        <TableCell>{batch.quantity} kg</TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                batch.status === 'approved' ? 'default' :
                                                    batch.status === 'rejected' ? 'destructive' :
                                                        'secondary'
                                            } className={
                                                batch.status === 'approved' ? 'bg-green-600' : ''
                                            }>
                                                {batch.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/farmer/batches/${batch.id}`}>
                                                    <Eye className="h-4 w-4" />
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
