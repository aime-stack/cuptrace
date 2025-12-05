'use client';

import { useState, useEffect } from 'react';
import { User, Loader2, Save, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCurrentUser } from '@/hooks/useAuth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as authService from '@/services/auth.service';

export default function ProfilePage() {
    const { data: user, isLoading } = useCurrentUser();
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        address: user?.address || '',
        city: user?.city || '',
        province: user?.province || '',
    });

    // Update form data when user data loads
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                phone: user.phone || '',
                address: user.address || '',
                city: user.city || '',
                province: user.province || '',
            });
        }
    }, [user]);

    const updateUserMutation = useMutation({
        mutationFn: (data: Partial<typeof formData>) => authService.updateUser(user!.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['currentUser'] });
            setIsEditing(false);
            toast.success('Profile updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        },
    });

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
                        <Input 
                            id="name" 
                            value={isEditing ? formData.name : (user?.name || '')} 
                            disabled={!isEditing}
                            onChange={(e) => isEditing && setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={user?.email || ''} disabled />
                        <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input 
                            id="phone" 
                            value={isEditing ? formData.phone : (user?.phone || '')} 
                            disabled={!isEditing}
                            onChange={(e) => isEditing && setFormData({ ...formData, phone: e.target.value })}
                            placeholder="Phone number"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Input id="role" value={user?.role || ''} disabled />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Input id="country" value={user?.country || 'Rwanda'} disabled />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input 
                            id="address" 
                            value={isEditing ? formData.address : (user?.address || '')} 
                            disabled={!isEditing}
                            onChange={(e) => isEditing && setFormData({ ...formData, address: e.target.value })}
                            placeholder="Street address"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input 
                            id="city" 
                            value={isEditing ? formData.city : (user?.city || '')} 
                            disabled={!isEditing}
                            onChange={(e) => isEditing && setFormData({ ...formData, city: e.target.value })}
                            placeholder="City"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="province">Province</Label>
                        <Input 
                            id="province" 
                            value={isEditing ? formData.province : (user?.province || '')} 
                            disabled={!isEditing}
                            onChange={(e) => isEditing && setFormData({ ...formData, province: e.target.value })}
                            placeholder="Province"
                        />
                    </div>
                    <div className="pt-4 flex gap-2">
                        {!isEditing ? (
                            <Button onClick={() => setIsEditing(true)}>
                                <User className="h-4 w-4 mr-2" />
                                Edit Profile
                            </Button>
                        ) : (
                            <>
                                <Button 
                                    onClick={() => {
                                        updateUserMutation.mutate(formData);
                                    }}
                                    disabled={updateUserMutation.isPending}
                                >
                                    {updateUserMutation.isPending ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 mr-2" />
                                            Save Changes
                                        </>
                                    )}
                                </Button>
                                <Button 
                                    variant="outline" 
                                    onClick={() => {
                                        setIsEditing(false);
                                        setFormData({
                                            name: user?.name || '',
                                            phone: user?.phone || '',
                                            address: user?.address || '',
                                            city: user?.city || '',
                                            province: user?.province || '',
                                        });
                                    }}
                                    disabled={updateUserMutation.isPending}
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Cancel
                                </Button>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

