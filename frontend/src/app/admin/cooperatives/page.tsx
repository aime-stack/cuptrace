'use client';

import { CreateCooperativeDialog } from '@/components/admin/CreateCooperativeDialog';
import { Building, Loader2, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCooperatives } from '@/hooks/useCooperatives';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

export default function CooperativesPage() {
    const { data: cooperatives, isLoading } = useCooperatives();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Cooperatives</h1>
                    <p className="text-muted-foreground">
                        Manage farmer cooperatives
                    </p>
                </div>
                <CreateCooperativeDialog />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Cooperatives</CardTitle>
                    <CardDescription>
                        View and manage cooperatives
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : !cooperatives || cooperatives.length === 0 ? (
                        <div className="text-center py-12">
                            <Building className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No cooperatives found</h3>
                            <p className="text-gray-500 mb-4">Create your first cooperative to get started</p>
                            <CreateCooperativeDialog
                                trigger={
                                    <Button className="gap-2">
                                        <Plus className="h-4 w-4" />
                                        Create Cooperative
                                    </Button>
                                }
                            />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {cooperatives.map((coop: any) => (
                                    <TableRow key={coop.id}>
                                        <TableCell className="font-medium">{coop.name}</TableCell>
                                        <TableCell>{coop.location}</TableCell>
                                        <TableCell>{coop.description || 'N/A'}</TableCell>
                                        <TableCell>
                                            <Button size="sm" variant="ghost">Edit</Button>
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

