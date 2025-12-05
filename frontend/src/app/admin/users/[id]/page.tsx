'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Loader2, UserCheck, UserX, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as authService from '@/services/auth.service';
import Link from 'next/link';
import { formatDate, getRoleLabel } from '@/lib/utils';
import { User } from '@/types';

export default function UserDetailPage() {
    const params = useParams();
    const router = useRouter();
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
            toast.success('User activated successfully');
            queryClient.invalidateQueries({ queryKey: ['user', userId] });
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to activate user');
        },
    });

    const deactivateMutation = useMutation({
        mutationFn: () => authService.deactivateUser(userId),
        onSuccess: () => {
            toast.success('User deactivated successfully');
            queryClient.invalidateQueries({ queryKey: ['user', userId] });
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to deactivate user');
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
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/admin/users">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
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
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/admin/users">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Link>
                    </Button>
                </div>
                <div className="text-center py-12">
                    <p className="text-red-600">User not found or error loading user</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/admin/users">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Users
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>
                        <p className="text-muted-foreground">
                            User details and management
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {user.isActive ? (
                        <Button 
                            variant="outline" 
                            onClick={() => deactivateMutation.mutate()}
                            disabled={deactivateMutation.isPending}
                        >
                            <UserX className="h-4 w-4 mr-2" />
                            Deactivate
                        </Button>
                    ) : (
                        <Button 
                            variant="outline" 
                            onClick={() => activateMutation.mutate()}
                            disabled={activateMutation.isPending}
                        >
                            <UserCheck className="h-4 w-4 mr-2" />
                            Activate
                        </Button>
                    )}
                    <Button 
                        variant="outline" 
                        onClick={() => resetPasswordMutation.mutate()}
                        disabled={resetPasswordMutation.isPending}
                    >
                        <Key className="h-4 w-4 mr-2" />
                        Reset Password
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>User Information</CardTitle>
                    <CardDescription>
                        Complete user profile details
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-medium text-gray-700">Name</p>
                            <p className="text-sm text-gray-600">{user.name}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-700">Email</p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-700">Role</p>
                            <p className="text-sm text-gray-600">{getRoleLabel(user.role)}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-700">Status</p>
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                                {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        {user.phone && (
                            <div>
                                <p className="text-sm font-medium text-gray-700">Phone</p>
                                <p className="text-sm text-gray-600">{user.phone}</p>
                            </div>
                        )}
                        {user.country && (
                            <div>
                                <p className="text-sm font-medium text-gray-700">Country</p>
                                <p className="text-sm text-gray-600">{user.country}</p>
                            </div>
                        )}
                        {user.city && (
                            <div>
                                <p className="text-sm font-medium text-gray-700">City</p>
                                <p className="text-sm text-gray-600">{user.city}</p>
                            </div>
                        )}
                        {user.province && (
                            <div>
                                <p className="text-sm font-medium text-gray-700">Province</p>
                                <p className="text-sm text-gray-600">{user.province}</p>
                            </div>
                        )}
                        {user.cooperativeId && (
                            <div>
                                <p className="text-sm font-medium text-gray-700">Cooperative ID</p>
                                <p className="text-sm text-gray-600">{user.cooperativeId}</p>
                            </div>
                        )}
                        <div>
                            <p className="text-sm font-medium text-gray-700">Created At</p>
                            <p className="text-sm text-gray-600">{formatDate(user.createdAt)}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-700">Last Updated</p>
                            <p className="text-sm text-gray-600">{formatDate(user.updatedAt)}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

