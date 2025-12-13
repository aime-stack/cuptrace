'use client';

import React, { useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useBatches } from '@/hooks/useBatches';
import { useUsers } from '@/hooks/useAuth'; // Assuming this hook exists based on admin dashboard usage
import { Loader2, TrendingUp, Users, Package, AlertCircle } from 'lucide-react';
import { ProductType, BatchStatus, UserRole } from '@/types';

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
const STATUS_COLORS: Record<string, string> = {
    [BatchStatus.pending]: '#FFBB28', // Yellow
    [BatchStatus.approved]: '#00C49F', // Green
    [BatchStatus.rejected]: '#FF8042', // Orange/Red
    [BatchStatus.processing]: '#0088FE', // Blue
    [BatchStatus.ready_for_export]: '#8884d8', // Purple
    [BatchStatus.exported]: '#82ca9d', // Light Green
    [BatchStatus.delivered]: '#00C49F', // Strong Green
};

export default function AnalyticsPage() {
    // Fetch data
    const { data: coffeeBatches, isLoading: isLoadingCoffee } = useBatches({}, ProductType.coffee);
    const { data: teaBatches, isLoading: isLoadingTea } = useBatches({}, ProductType.tea);
    const { data: users, isLoading: isLoadingUsers } = useUsers();

    const isLoading = isLoadingCoffee || isLoadingTea || isLoadingUsers;

    // Process Data for Visualizations
    const stats = useMemo(() => {
        if (!coffeeBatches || !teaBatches || !users) return null;

        const allBatches = [...coffeeBatches, ...teaBatches];

        // 1. Product Type Distribution
        const productTypeData = [
            { name: 'Coffee', value: coffeeBatches.length },
            { name: 'Tea', value: teaBatches.length },
        ];

        // 2. Batch Status Distribution
        const statusCounts: Record<string, number> = {};
        allBatches.forEach(batch => {
            statusCounts[batch.status] = (statusCounts[batch.status] || 0) + 1;
        });
        const statusData = Object.keys(statusCounts).map(status => ({
            name: status.replace('_', ' ').toUpperCase(),
            value: statusCounts[status],
            fill: STATUS_COLORS[status] || '#8884d8'
        }));

        // 3. User Role Distribution
        const roleCounts: Record<string, number> = {};
        users.forEach((user: any) => {
            roleCounts[user.role] = (roleCounts[user.role] || 0) + 1;
        });
        const roleData = Object.keys(roleCounts).map((role, index) => ({
            name: role.toUpperCase(),
            value: roleCounts[role],
            fill: COLORS[index % COLORS.length]
        }));

        // 4. Regional Distribution (Rwanda Provinces)
        const regionCounts: Record<string, number> = {};
        allBatches.forEach(batch => {
            if (batch.region) {
                regionCounts[batch.region] = (regionCounts[batch.region] || 0) + 1;
            } else {
                regionCounts['Unknown'] = (regionCounts['Unknown'] || 0) + 1;
            }
        });
        const regionData = Object.keys(regionCounts).map(region => ({
            name: region,
            value: regionCounts[region]
        }));

        return {
            totalBatches: allBatches.length,
            totalUsers: users.length,
            productTypeData,
            statusData,
            roleData,
            regionData
        };
    }, [coffeeBatches, teaBatches, users]);

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">System Analytics</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Real-time insights into supply chain and user activity</p>
            </div>

            {/* Key Metrics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Batches</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalBatches}</div>
                        <p className="text-xs text-muted-foreground">Across all stages</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalUsers}</div>
                        <p className="text-xs text-muted-foreground">Active participants</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Coffee Volume</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.productTypeData[0].value}</div>
                        <p className="text-xs text-muted-foreground">Batches</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tea Volume</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.productTypeData[1].value}</div>
                        <p className="text-xs text-muted-foreground">Batches</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row 1 */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Batch Status Distribution */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Batch Status Overview</CardTitle>
                        <CardDescription>Distribution of batches across supply chain stages</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.statusData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="value" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Product Type Distribution */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Coffee vs Tea</CardTitle>
                        <CardDescription>Production volume share</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.productTypeData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {stats.productTypeData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index === 0 ? '#6F4E37' : '#228B22'} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row 2 */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* User Role Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>User Demographics</CardTitle>
                        <CardDescription>Registered users by role</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.roleData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {stats.roleData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Regional Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>Regional Distribution</CardTitle>
                        <CardDescription>Batches by province/region</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.regionData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis dataKey="name" type="category" width={100} fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#82ca9d" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
