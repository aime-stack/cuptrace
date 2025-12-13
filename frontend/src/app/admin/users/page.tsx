'use client';

import Link from 'next/link';
import { Users, Loader2, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUsers } from '@/hooks/useAuth';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

import { CreateUserDialog } from '@/components/admin/CreateUserDialog';

export default function UsersPage() {
    const { data: users, isLoading } = useUsers();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Users</h1>
                    <p className="text-muted-foreground">
                        Manage all system users
                    </p>
                </div>
                <CreateUserDialog />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Users</CardTitle>
                    <CardDescription>
                        View and manage user accounts
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : !users || users.length === 0 ? (
                        <div className="text-center py-12">
                            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                            <p className="text-gray-500 mb-4">No users have been registered in the system yet</p>
                            <CreateUserDialog
                                trigger={
                                    <Button className="gap-2">
                                        <Plus className="h-4 w-4" />
                                        Create User
                                    </Button>
                                }
                            />
                        </div>
                    ) : (
                        <>
                            {/* Mobile Card View */}
                            <div className="md:hidden space-y-4">
                                {users.map((user: any) => (
                                    <div key={user.id} className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <p className="font-semibold">{user.name}</p>
                                                <p className="text-sm text-muted-foreground break-all">{user.email}</p>
                                            </div>
                                            <span className={`px-2 py-1 text-xs rounded-full ${user.isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                                                }`}>
                                                {user.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between mt-4">
                                            <span className="text-sm px-2 py-1 rounded bg-muted text-muted-foreground capitalize">
                                                {user.role}
                                            </span>
                                            <Button size="sm" variant="outline" asChild>
                                                <Link href={`/admin/users/${user.id}`}>
                                                    View Details
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Desktop Table View */}
                            <div className="hidden md:block">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users.map((user: any) => (
                                            <TableRow key={user.id}>
                                                <TableCell className="font-medium">{user.name}</TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell className="capitalize">{user.role}</TableCell>
                                                <TableCell>
                                                    <span className={`px-2 py-1 text-xs rounded-full ${user.isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                                                        }`}>
                                                        {user.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <Button size="sm" variant="ghost" asChild>
                                                        <Link href={`/admin/users/${user.id}`}>
                                                            View
                                                        </Link>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

