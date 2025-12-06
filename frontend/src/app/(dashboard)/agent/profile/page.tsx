'use client';

import { useState } from 'react';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Building2,
    Calendar,
    Edit2,
    Save,
    X,
    Shield,
    Package,
    Users,
    Bell,
    Lock,
    Camera
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useCurrentUser, useUpdateUser, useChangePassword } from '@/hooks/useAuth';
import { getRoleLabel } from '@/lib/utils';
import { toast } from 'sonner';

export default function AgentProfilePage() {
    const { data: user, refetch } = useCurrentUser();
    const updateUser = useUpdateUser();
    const changePassword = useChangePassword();

    const [isEditing, setIsEditing] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        address: user?.address || '',
        city: user?.city || '',
        province: user?.province || '',
        country: user?.country || 'Rwanda',
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    if (!user) return null;

    const handleSave = async () => {
        try {
            await updateUser.mutateAsync({
                id: user.id,
                data: formData,
            });
            setIsEditing(false);
            refetch();
        } catch (error) {
            // Error handled by mutation
        }
    };

    const handlePasswordChange = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        if (passwordData.newPassword.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }
        try {
            await changePassword.mutateAsync({
                oldPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            });
            setShowPasswordForm(false);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            // Error handled by mutation
        }
    };

    const memberSince = user.createdAt
        ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : 'N/A';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight dark:text-white">Profile</h1>
                <p className="text-muted-foreground">
                    Manage your agent account settings.
                </p>
            </div>

            {/* Profile Header Card */}
            <Card className="overflow-hidden">
                {/* Cover Image - Agent specific gradient */}
                <div className="h-32 sm:h-40 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 relative">
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/30 to-transparent" />
                </div>

                <CardContent className="relative pt-0">
                    {/* Avatar */}
                    <div className="relative -mt-16 sm:-mt-20 mb-4 flex flex-col sm:flex-row sm:items-end sm:justify-between">
                        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                            <div className="relative">
                                <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full bg-white dark:bg-gray-800 border-4 border-white dark:border-gray-800 shadow-lg overflow-hidden">
                                    <div className="h-full w-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center">
                                        <span className="text-3xl sm:text-4xl font-bold text-white">
                                            {user.name?.charAt(0)?.toUpperCase() || 'A'}
                                        </span>
                                    </div>
                                </div>
                                <button className="absolute bottom-0 right-0 p-2 bg-white dark:bg-gray-700 rounded-full shadow-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                                    <Camera className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                                </button>
                            </div>

                            <div className="mt-2 sm:mt-0 sm:mb-2">
                                <h2 className="text-xl sm:text-2xl font-bold dark:text-white">{user.name}</h2>
                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                    <Badge className="bg-indigo-600 hover:bg-indigo-700">
                                        {getRoleLabel(user.role)}
                                    </Badge>
                                    {user.isActive && (
                                        <Badge variant="outline" className="text-green-600 border-green-600">
                                            <Shield className="h-3 w-3 mr-1" />
                                            Active
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 sm:mt-0">
                            {!isEditing ? (
                                <Button
                                    variant="outline"
                                    onClick={() => setIsEditing(true)}
                                    className="w-full sm:w-auto"
                                >
                                    <Edit2 className="h-4 w-4 mr-2" />
                                    Edit Profile
                                </Button>
                            ) : (
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsEditing(false)}
                                    >
                                        <X className="h-4 w-4 mr-2" />
                                        Cancel
                                    </Button>
                                    <Button onClick={handleSave} disabled={updateUser.isPending}>
                                        <Save className="h-4 w-4 mr-2" />
                                        Save
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Personal Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Agent Information
                        </CardTitle>
                        <CardDescription>
                            Your personal details and contact information.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Full Name</Label>
                            {isEditing ? (
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            ) : (
                                <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <User className="h-4 w-4 text-gray-500" />
                                    <span className="dark:text-white">{user.name}</span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>Email Address</Label>
                            <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <Mail className="h-4 w-4 text-gray-500" />
                                <span className="dark:text-white">{user.email}</span>
                                <Badge variant="secondary" className="ml-auto text-xs">
                                    Cannot change
                                </Badge>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Phone Number</Label>
                            {isEditing ? (
                                <Input
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+250 788 000 000"
                                />
                            ) : (
                                <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <Phone className="h-4 w-4 text-gray-500" />
                                    <span className="dark:text-white">{user.phone || 'Not provided'}</span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>Member Since</Label>
                            <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                <span className="dark:text-white">{memberSince}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Location & Cooperative */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5" />
                            Cooperative Assignment
                        </CardTitle>
                        <CardDescription>
                            Your cooperative and location details.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {user.cooperative ? (
                            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-100 dark:bg-indigo-800 rounded-lg">
                                        <Building2 className="h-6 w-6 text-indigo-600 dark:text-indigo-300" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-indigo-800 dark:text-indigo-200">
                                            {user.cooperative.name}
                                        </p>
                                        <p className="text-sm text-indigo-600 dark:text-indigo-400">
                                            {user.cooperative.district}, {user.cooperative.province}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                <p className="text-yellow-800 dark:text-yellow-200">
                                    No cooperative assigned. Contact administrator.
                                </p>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>City</Label>
                                {isEditing ? (
                                    <Input
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        placeholder="City"
                                    />
                                ) : (
                                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <span className="dark:text-white">{user.city || 'Not provided'}</span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Province</Label>
                                {isEditing ? (
                                    <Input
                                        value={formData.province}
                                        onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                                        placeholder="Province"
                                    />
                                ) : (
                                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <span className="dark:text-white">{user.province || 'Not provided'}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Country</Label>
                            <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <span className="text-xl">🇷🇼</span>
                                <span className="dark:text-white">{user.country || 'Rwanda'}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Security Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Lock className="h-5 w-5" />
                        Security
                    </CardTitle>
                    <CardDescription>
                        Manage your password and security settings.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!showPasswordForm ? (
                        <Button
                            variant="outline"
                            onClick={() => setShowPasswordForm(true)}
                        >
                            <Lock className="h-4 w-4 mr-2" />
                            Change Password
                        </Button>
                    ) : (
                        <div className="space-y-4 max-w-md">
                            <div className="space-y-2">
                                <Label>Current Password</Label>
                                <Input
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    placeholder="Enter current password"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>New Password</Label>
                                <Input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    placeholder="Enter new password"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Confirm New Password</Label>
                                <Input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    placeholder="Confirm new password"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowPasswordForm(false);
                                        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button onClick={handlePasswordChange} disabled={changePassword.isPending}>
                                    Update Password
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/20 dark:to-gray-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-100 dark:bg-indigo-800 rounded-full">
                                <Package className="h-6 w-6 text-indigo-600 dark:text-indigo-300" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Batches Registered</p>
                                <p className="text-2xl font-bold dark:text-white">156</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-white dark:from-green-900/20 dark:to-gray-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 dark:bg-green-800 rounded-full">
                                <Users className="h-6 w-6 text-green-600 dark:text-green-300" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Farmers Served</p>
                                <p className="text-2xl font-bold dark:text-white">42</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 dark:bg-blue-800 rounded-full">
                                <Shield className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Account Status</p>
                                <p className="text-2xl font-bold text-green-600">Active</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-gray-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-100 dark:bg-purple-800 rounded-full">
                                <Bell className="h-6 w-6 text-purple-600 dark:text-purple-300" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Notifications</p>
                                <p className="text-2xl font-bold dark:text-white">Enabled</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
