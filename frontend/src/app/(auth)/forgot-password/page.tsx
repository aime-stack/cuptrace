'use client';

import Link from 'next/link';
import { Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ForgotPasswordPage() {
    return (
        <Card>
            <CardHeader className="space-y-1 text-center">
                <div className="flex justify-center mb-4">
                    <div className="p-3 bg-coffee-100 rounded-full">
                        <Coffee className="h-8 w-8 text-coffee-600" />
                    </div>
                </div>
                <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
                <CardDescription>
                    Password reset functionality coming soon
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 text-center">
                    This feature is currently under development. Please contact your administrator for password reset assistance.
                </p>
                <Link href="/login" className="block">
                    <Button variant="outline" className="w-full">
                        Back to Login
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
}
