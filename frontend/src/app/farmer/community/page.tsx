'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { listAnnouncements, listPolls, listAidPrograms } from '@/services/community.service';
import { AnnouncementCard } from '@/components/community/AnnouncementCard';
import { PollCard } from '@/components/community/PollCard';
import { AidProgramCard } from '@/components/community/AidProgramCard';
import { ThreadList } from '@/components/community/ThreadList';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Users, MessageCircle, HeartHandshake, LayoutDashboard } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function CommunityPage() {
    const { data: announcements, isLoading: loadingAnnouncements } = useQuery({
        queryKey: ['announcements'],
        queryFn: listAnnouncements,
    });

    const { data: polls, isLoading: loadingPolls } = useQuery({
        queryKey: ['polls'],
        queryFn: listPolls,
    });

    const { data: aidPrograms, isLoading: loadingAid } = useQuery({
        queryKey: ['aidPrograms'],
        queryFn: listAidPrograms,
    });

    return (
        <div className="container mx-auto p-4 space-y-6 max-w-7xl">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                <div className="flex items-center space-x-3">
                    <div className="p-3 bg-coffee-100 dark:bg-coffee-900/30 rounded-xl">
                        <Users className="h-8 w-8 text-coffee-600 dark:text-coffee-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Community</h1>
                        <p className="text-gray-500 dark:text-gray-400">Connect, vote, and grow with your cooperative</p>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3 max-w-md bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                    <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm">
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Overview
                    </TabsTrigger>
                    <TabsTrigger value="discussions" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Discussions
                    </TabsTrigger>
                    <TabsTrigger value="aid" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm">
                        <HeartHandshake className="h-4 w-4 mr-2" />
                        Aid Programs
                    </TabsTrigger>
                </TabsList>

                {/* OVERVIEW TAB */}
                <TabsContent value="overview" className="space-y-6 animate-in fade-in-50 duration-300">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Feed: Announcements */}
                        <div className="lg:col-span-2 space-y-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                📢 Announcements
                            </h2>

                            {loadingAnnouncements ? (
                                <div className="space-y-4">
                                    <Skeleton className="h-32 w-full rounded-xl" />
                                    <Skeleton className="h-32 w-full rounded-xl" />
                                </div>
                            ) : announcements?.length === 0 ? (
                                <div className="text-center py-10 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200">
                                    <p className="text-gray-500">No announcements at this time.</p>
                                </div>
                            ) : (
                                announcements?.map((announcement) => (
                                    <AnnouncementCard key={announcement.id} announcement={announcement} />
                                ))
                            )}
                        </div>

                        {/* Sidebar: Polls */}
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                                    🗳️ Active Polls
                                </h2>

                                {loadingPolls ? (
                                    <div className="space-y-4">
                                        <Skeleton className="h-48 w-full rounded-xl" />
                                        <Skeleton className="h-48 w-full rounded-xl" />
                                    </div>
                                ) : polls?.length === 0 ? (
                                    <div className="text-center py-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200">
                                        <p className="text-sm text-gray-500">No active polls.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {polls?.map((poll) => (
                                            <PollCard key={poll.id} poll={poll} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* DISCUSSIONS TAB */}
                <TabsContent value="discussions" className="animate-in fade-in-50 duration-300">
                    <ThreadList />
                </TabsContent>

                {/* AID PROGRAMS TAB */}
                <TabsContent value="aid" className="animate-in fade-in-50 duration-300">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                💰 Available Aid Programs
                            </h2>
                        </div>

                        {loadingAid ? (
                            <div className="grid md:grid-cols-2 gap-4">
                                <Skeleton className="h-48 w-full rounded-xl" />
                                <Skeleton className="h-48 w-full rounded-xl" />
                            </div>
                        ) : aidPrograms?.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200">
                                <HeartHandshake className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                <h3 className="text-lg font-medium text-gray-900">No programs available</h3>
                                <p className="text-gray-500">Check back later for new cooperative support programs.</p>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 gap-6">
                                {aidPrograms?.map((program) => (
                                    <AidProgramCard key={program.id} program={program} />
                                ))}
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
