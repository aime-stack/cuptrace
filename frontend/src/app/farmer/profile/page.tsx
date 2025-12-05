'use client';

import { User, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCurrentUser } from '@/hooks/useAuth';

export default function ProfilePage() {
    const { data: user, isLoading } = useCurrentUser();

    if (isLoading) {
        return (
            <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
                <p className="text-muted-foreground">
                    Manage your account information
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Personal Information
                    </CardTitle>
                    <CardDescription>
                        Your account details and contact information
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" value={user?.name || ''} disabled />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={user?.email || ''} disabled />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input id="phone" value={user?.phone || 'Not provided'} disabled />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Input id="role" value={user?.role || ''} disabled />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Input id="country" value={user?.country || 'Rwanda'} disabled />
                    </div>
                    {user?.city && (
                        <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input id="city" value={user.city} disabled />
                        </div>
                    )}
                    {user?.province && (
                        <div className="space-y-2">
                            <Label htmlFor="province">Province</Label>
                            <Input id="province" value={user.province} disabled />
                        </div>
                    )}
                    <div className="pt-4">
                        <Button>Edit Profile</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

