import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Plus, Loader2, User } from 'lucide-react';
import * as communityService from '@/services/community.service';
import { formatRelativeDate, getInitials } from '@/lib/utils';
import { toast } from 'sonner';
import { CommentSection } from './CommentSection';

export function ThreadList() {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [expandedThreadId, setExpandedThreadId] = useState<string | null>(null);

    const queryClient = useQueryClient();

    const { data: threads, isLoading } = useQuery({
        queryKey: ['threads'],
        queryFn: communityService.listThreads,
    });

    const createThreadMutation = useMutation({
        mutationFn: (data: { title: string; content: string }) => communityService.createThread(data.title, data.content),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['threads'] });
            setIsCreateOpen(false);
            setNewTitle('');
            setNewContent('');
            toast.success('Thread created successfully');
        },
        onError: () => {
            toast.error('Failed to create thread');
        }
    });

    const handleCreate = () => {
        if (!newTitle.trim() || !newContent.trim()) return;
        createThreadMutation.mutate({ title: newTitle, content: newContent });
    };

    if (isLoading) {
        return <div className="p-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-coffee-600" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Community Discussions
                </h3>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-coffee-600 hover:bg-coffee-700">
                            <Plus className="h-4 w-4 mr-2" />
                            New Thread
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Start a New Discussion</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Topic Title</label>
                                <Input
                                    placeholder="e.g., Best practices for drying coffee"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Content</label>
                                <Textarea
                                    placeholder="Share your thoughts or ask a question..."
                                    value={newContent}
                                    onChange={(e) => setNewContent(e.target.value)}
                                    className="h-32"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                            <Button
                                onClick={handleCreate}
                                disabled={createThreadMutation.isPending || !newTitle || !newContent}
                                className="bg-coffee-600 hover:bg-coffee-700"
                            >
                                {createThreadMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                Post Thread
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4">
                {threads?.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">No discussions yet</h3>
                        <p className="text-gray-500">Be the first to start a conversation in your community.</p>
                    </div>
                )}

                {threads?.map((thread) => (
                    <Card key={thread.id} className="overflow-hidden">
                        <CardHeader className="bg-gray-50/50 dark:bg-gray-800/50 pb-3">
                            <div className="flex justify-between items-start">
                                <div className="flex gap-3">
                                    <Avatar>
                                        <AvatarFallback className="bg-coffee-100 text-coffee-800">
                                            {getInitials(thread.author.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <CardTitle className="text-base font-semibold">{thread.title}</CardTitle>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                            <span>{thread.author.name}</span>
                                            <span>•</span>
                                            <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal">
                                                {thread.author.role}
                                            </Badge>
                                            <span>•</span>
                                            <span>{formatRelativeDate(thread.createdAt)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4 pb-2">
                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{thread.content}</p>
                        </CardContent>
                        <CardFooter className="flex flex-col items-stretch pt-0 pb-4">
                            <div className="w-full border-t border-gray-100 my-2"></div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="self-start text-gray-500 hover:text-coffee-600 gap-2 mb-2"
                                onClick={() => setExpandedThreadId(expandedThreadId === thread.id ? null : thread.id)}
                            >
                                <MessageSquare className="h-4 w-4" />
                                {expandedThreadId === thread.id ? 'Hide Comments' : `Comments (${thread._count?.comments || 0})`}
                            </Button>

                            {expandedThreadId === thread.id && (
                                <CommentSection targetId={thread.id} targetType="thread" className="w-full pl-4 border-l-2 border-gray-100" />
                            )}
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
