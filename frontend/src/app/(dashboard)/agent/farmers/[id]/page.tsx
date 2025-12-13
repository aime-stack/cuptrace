'use client';

import { useParams } from 'next/navigation';
import { ChevronLeft, Loader2, UserCheck, UserX, Key, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as authService from '@/services/auth.service';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

export default function AgentFarmerDetailPage() {
    const params = useParams();
    const queryClient = useQueryClient();
    const userId = params.id as string;

    const { data: user, isLoading, error } = useQuery({
        queryKey: ['user', userId],
        queryFn: () => authService.getUserById(userId),
        enabled: !!userId,
    });

    const activateMutation = useMutation({
        mutationFn: () => authService.activateUser(userId),
        onSuccess: () => {
            toast.success('Farmer account activated successfully');
            queryClient.invalidateQueries({ queryKey: ['user', userId] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to activate account');
        },
    });

    const deactivateMutation = useMutation({
        mutationFn: () => authService.deactivateUser(userId),
        onSuccess: () => {
            toast.success('Farmer account deactivated successfully');
            queryClient.invalidateQueries({ queryKey: ['user', userId] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to deactivate account');
        },
    });

    const resetPasswordMutation = useMutation({
        mutationFn: () => authService.resetPassword(userId),
        onSuccess: () => {
            toast.success('Password reset initiated successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to reset password');
        },
    });

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                        <Link href="/agent/farmers">
                            <ChevronLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                        <Link href="/agent/farmers">
                            <ChevronLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>
                <div className="text-center py-12">
                    <p className="text-red-600">Farmer not found or error loading data</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" className="h-8 w-8 shrink-0" asChild>
                        <Link href="/agent/farmers">
                            <ChevronLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-xl md:text-3xl font-bold tracking-tight">{user.name}</h1>
                        <p className="text-sm text-muted-foreground">
                            Farmer Profile & Details
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    {user.isActive ? (
                        <Button
                            variant="outline"
                            onClick={() => deactivateMutation.mutate()}
                            disabled={deactivateMutation.isPending}
                            className="flex-1 md:flex-none text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                            <UserX className="h-4 w-4 mr-2" />
                            Deactivate
                        </Button>
                    ) : (
                        <Button
                            variant="outline"
                            onClick={() => activateMutation.mutate()}
                            disabled={activateMutation.isPending}
                            className="flex-1 md:flex-none text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                        >
                            <UserCheck className="h-4 w-4 mr-2" />
                            Activate
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        onClick={() => resetPasswordMutation.mutate()}
                        disabled={resetPasswordMutation.isPending}
                        className="flex-1 md:flex-none"
                    >
                        <Key className="h-4 w-4 mr-2" />
                        Reset Password
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                        Contact and location details
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Contact</p>
                            <div className="text-sm">
                                <p className="font-medium text-base">{user.email}</p>
                                {user.phone && (
                                    <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                                        <Phone className="h-3 w-3" />
                                        <span>{user.phone}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Status</p>
                            <div>
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${user.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                    }`}>
                                    {user.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Location</p>
                            <div className="text-sm">
                                <div className="flex items-start gap-2">
                                    <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                    <div>
                                        <p>{[user.province, user.city, user.address].filter(Boolean).join(', ')}</p>
                                        <p className="text-muted-foreground">{user.country}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Registration</p>
                            <div className="text-sm space-y-1">
                                <p>Joined: {formatDate(user.createdAt)}</p>
                                {user.registrationNumber && (
                                    <p className="font-mono text-xs text-muted-foreground">ID: {user.registrationNumber}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
