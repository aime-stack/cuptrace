'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { axiosInstance } from '@/lib/axios';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    data?: {
        batchId?: string;
        lotId?: string;
        qrCodeUrl?: string;
        traceUrl?: string;
        grade?: string;
    };
    isRead: boolean;
    createdAt: string;
}

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/notifications', {
                params: { limit: 10 }
            });

            if (response.data?.success) {
                setNotifications(response.data.data.notifications || []);
                setUnreadCount(response.data.data.unreadCount || 0);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId: string) => {
        try {
            await axiosInstance.patch(`/notifications/${notificationId}/read`);
            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axiosInstance.patch('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'batch_approved':
                return '✅';
            case 'batch_rejected':
                return '❌';
            case 'qr_generated':
                return '📱';
            case 'payment_received':
                return '💰';
            case 'nft_minted':
                return '🎨';
            default:
                return '📢';
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-semibold">Notifications</h3>
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                            <Check className="mr-1 h-4 w-4" />
                            Mark all read
                        </Button>
                    )}
                </div>

                <ScrollArea className="h-80">
                    {loading && notifications.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground">
                            Loading...
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>No notifications yet</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${!notification.isRead ? 'bg-blue-50' : ''
                                        }`}
                                    onClick={() => !notification.isRead && markAsRead(notification.id)}
                                >
                                    <div className="flex gap-3">
                                        <span className="text-xl">
                                            {getNotificationIcon(notification.type)}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm">
                                                {notification.title}
                                            </p>
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {notification.message}
                                            </p>

                                            {/* Quick actions for batch notifications */}
                                            {notification.data?.traceUrl && (
                                                <Link
                                                    href={notification.data.traceUrl}
                                                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-1"
                                                >
                                                    <ExternalLink className="h-3 w-3" />
                                                    View Trace
                                                </Link>
                                            )}

                                            <p className="text-xs text-muted-foreground mt-1">
                                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                            </p>
                                        </div>

                                        {!notification.isRead && (
                                            <div className="h-2 w-2 rounded-full bg-blue-500 mt-2" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                <div className="p-2 border-t">
                    <Button variant="ghost" size="sm" className="w-full" asChild>
                        <Link href="/notifications">View all notifications</Link>
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
