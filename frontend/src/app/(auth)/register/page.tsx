'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Coffee, Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useRegister } from '@/hooks/useAuth';
import { useCooperatives } from '@/hooks/useCooperatives';
import { registerSchema, type RegisterFormData } from '@/lib/validations/auth.schema';
import { UserRole } from '@/types';

export default function RegisterPage() {
    const { mutate: register, isPending } = useRegister();
    const [showPassword, setShowPassword] = useState(false);
    const { data: cooperatives } = useCooperatives();

    const {
        register: registerField,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            country: 'Rwanda',
            role: UserRole.farmer,
        },
    });

    const selectedRole = watch('role');

    const onSubmit = (data: RegisterFormData) => {
        const { confirmPassword, ...submitData } = data;
        // Clean up empty strings for optional fields
        const cleanedData = {
            ...submitData,
            cooperativeId: submitData.cooperativeId && submitData.cooperativeId.trim() !== ''
                ? submitData.cooperativeId.trim()
                : undefined,
            phone: submitData.phone && submitData.phone.trim() !== ''
                ? submitData.phone.trim()
                : undefined,
            address: submitData.address && submitData.address.trim() !== ''
                ? submitData.address.trim()
                : undefined,
            city: submitData.city && submitData.city.trim() !== ''
                ? submitData.city.trim()
                : undefined,
            province: submitData.province && submitData.province.trim() !== ''
                ? submitData.province.trim()
                : undefined,
        };
        register(cleanedData);
    };

    return (
        <Card className="w-full max-w-md shadow-lg dark:shadow-none border-0 dark:border dark:border-gray-800">
            <CardHeader className="space-y-1 text-center">
                <div className="flex justify-center mb-4">
                    <div className="p-3 bg-coffee-100 dark:bg-gray-800 rounded-full">
                        <Coffee className="h-8 w-8 text-coffee-600 dark:text-coffee-400" />
                    </div>
                </div>
                <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
                <CardDescription>
                    Join CupTrace to start tracking your coffee and tea
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            placeholder="John Doe"
                            {...registerField('name')}
                            disabled={isPending}
                        />
                        {errors.name && (
                            <p className="text-sm text-red-500">{errors.name.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="john@example.com"
                            {...registerField('email')}
                            disabled={isPending}
                        />
                        {errors.email && (
                            <p className="text-sm text-red-500">{errors.email.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <select
                            id="role"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            {...registerField('role')}
                            disabled={isPending}
                        >
                            <option value={UserRole.farmer}>Farmer</option>
                            <option value={UserRole.ws}>Washing Station</option>
                            <option value={UserRole.factory}>Factory</option>
                            <option value={UserRole.exporter}>Exporter</option>
                            <option value={UserRole.importer}>Importer</option>
                            <option value={UserRole.retailer}>Retailer</option>
                        </select>
                        {errors.role && (
                            <p className="text-sm text-red-500">{errors.role.message}</p>
                        )}
                    </div>

                    {selectedRole === UserRole.farmer && (
                        <div className="space-y-2">
                            <Label htmlFor="cooperativeId">Cooperative <span className="text-red-500">*</span></Label>
                            <select
                                id="cooperativeId"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                {...registerField('cooperativeId', {
                                    required: 'Cooperative is required for farmers',
                                })}
                                disabled={isPending}
                            >
                                <option value="">Select a cooperative</option>
                                {cooperatives && cooperatives.length > 0 ? (
                                    cooperatives.map((coop) => (
                                        <option key={coop.id} value={coop.id}>
                                            {coop.name}
                                        </option>
                                    ))
                                ) : (
                                    <option value="" disabled>No cooperatives available</option>
                                )}
                            </select>
                            {errors.cooperativeId && (
                                <p className="text-sm text-red-500">{errors.cooperativeId.message}</p>
                            )}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone (Optional)</Label>
                        <Input
                            id="phone"
                            type="tel"
                            placeholder="+250 788 000 000"
                            {...registerField('phone')}
                            disabled={isPending}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                {...registerField('password')}
                                disabled={isPending}
                                className="pr-10"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4 text-gray-500" />
                                ) : (
                                    <Eye className="h-4 w-4 text-gray-500" />
                                )}
                            </Button>
                        </div>
                        {errors.password && (
                            <p className="text-sm text-red-500">{errors.password.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <div className="relative">
                            <Input
                                id="confirmPassword"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                {...registerField('confirmPassword')}
                                disabled={isPending}
                                className="pr-10"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4 text-gray-500" />
                                ) : (
                                    <Eye className="h-4 w-4 text-gray-500" />
                                )}
                            </Button>
                        </div>
                        {errors.confirmPassword && (
                            <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isPending}
                    >
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Account
                    </Button>
                    <p className="text-sm text-center text-gray-600">
                        Already have an account?{' '}
                        <Link href="/login" className="text-coffee-600 hover:underline font-medium">
                            Sign in
                        </Link>
                    </p>
                </CardFooter>
            </form>
        </Card>
    );
}
