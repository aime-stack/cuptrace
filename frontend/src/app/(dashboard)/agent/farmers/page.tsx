"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
    Users,
    Search,
    Plus,
    Phone,
    MapPin,
    MoreHorizontal,
    Loader2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useUsers, useCurrentUser } from "@/hooks/useAuth";
import { UserRole } from "@/types";

export default function AgentFarmersPage() {
    const { data: currentUser } = useCurrentUser();
    const [searchQuery, setSearchQuery] = useState("");

    // Fetch users with role 'farmer'
    // Ideally we would filter by cooperativeId here, but the hook typing might be generic.
    // The backend *should* filter if we pass it, or we filter client side.
    // For now we pass role="farmer". 
    // If the API supports passing extra params via the same object (even if TS complains), we could try.
    // However, let's rely on client-side filtering if backend returns all farmers (fallback) or 
    // ideally backend handles scoping for the agent.
    const { data: usersData, isLoading } = useUsers({
        role: UserRole.farmer,
        // search: searchQuery // Search is handled via API usually
    });

    const farmers = usersData?.filter(user => {
        // Filter by search query
        const matchesSearch =
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (user.phone && user.phone.includes(searchQuery));

        // Filter by cooperative (ensure they belong to the agent's cooperative)
        const matchesCoop = currentUser?.cooperativeId ? user.cooperativeId === currentUser.cooperativeId : true;

        return matchesSearch && matchesCoop;
    }) || [];

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Farmers</h1>
                    <p className="text-muted-foreground">
                        Manage the farmers in your cooperative.
                    </p>
                </div>
                {/* 
                <Button asChild>
                    <Link href="/agent/farmers/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Register Farmer
                    </Link>
                </Button>
                */}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Farmer Directory</CardTitle>
                    <CardDescription>
                        A list of all farmers registered with your cooperative.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center mb-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search farmers..."
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : farmers.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No farmers found.</p>
                        </div>
                    ) : (
                        <div className="rounded-md border overflow-x-auto">
                            <Table className="min-w-[800px]">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Contact</TableHead>
                                        <TableHead>Location</TableHead>
                                        <TableHead>Joined</TableHead>
                                        <TableHead className="w-[80px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {farmers.map((farmer) => (
                                        <TableRow key={farmer.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex flex-col">
                                                    <span>{farmer.name}</span>
                                                    <span className="text-xs text-muted-foreground">{farmer.email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={farmer.isActive ? "default" : "secondary"} className={farmer.isActive ? "bg-green-600 hover:bg-green-700" : ""}>
                                                    {farmer.isActive ? "Active" : "Inactive"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center text-sm text-muted-foreground">
                                                    <Phone className="mr-2 h-4 w-4" />
                                                    {farmer.phone || "N/A"}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col text-sm text-muted-foreground">
                                                    <div className="flex items-center">
                                                        <MapPin className="mr-1 h-3 w-3" />
                                                        {farmer.province || "-"}
                                                    </div>
                                                    <span className="text-xs pl-4">{farmer.city || ""}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {format(new Date(farmer.createdAt), "MMM d, yyyy")}
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(farmer.id)}>
                                                            Copy ID
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/agent/farmers/${farmer.id}`}>
                                                                View Details
                                                            </Link>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
// Force update
