import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, MessageCircle, Send } from 'lucide-react';
import * as communityService from '@/services/community.service';
import { formatRelativeDate, getInitials } from '@/lib/utils';
import { toast } from 'sonner';

interface CommentSectionProps {
    targetId: string;
    targetType: 'announcement' | 'poll' | 'thread';
    className?: string;
}

export function CommentSection({ targetId, targetType, className }: CommentSectionProps) {
    const [content, setContent] = useState('');
    const queryClient = useQueryClient();
    const queryKey = ['comments', targetType, targetId];

    const { data: comments, isLoading } = useQuery({
        queryKey,
        queryFn: () => communityService.listComments(targetType, targetId),
    });

    const createCommentMutation = useMutation({
        mutationFn: (text: string) => communityService.createComment(text, targetType, targetId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
            setContent('');
            toast.success('Comment posted');
        },
        onError: () => {
            toast.error('Failed to post comment');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;
        createCommentMutation.mutate(content);
    };

    if (isLoading) {
        return <div className="p-4 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto text-gray-400" /></div>;
    }

    return (
        <div className={`space-y-4 ${className}`}>
            <h4 className="text-sm font-semibold flex items-center gap-2 text-gray-700 dark:text-gray-200">
                <MessageCircle className="h-4 w-4" />
                Comments ({comments?.length || 0})
            </h4>

            {/* List */}
            <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {comments?.length === 0 && (
                    <p className="text-sm text-gray-500 italic text-center py-2">No comments yet. Be the first!</p>
                )}
                {comments?.map((comment) => (
                    <div key={comment.id} className="flex gap-3 text-sm">
                        <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs bg-coffee-100 text-coffee-800">
                                {getInitials(comment.author.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                            <div className="flex justify-between items-baseline mb-1">
                                <span className="font-medium text-gray-900 dark:text-gray-100">{comment.author.name}</span>
                                <span className="text-xs text-gray-400">{formatRelativeDate(comment.createdAt)}</span>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="flex gap-2 items-start mt-4">
                <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1 min-h-[40px] h-[40px] py-2 resize-none text-sm"
                />
                <Button
                    type="submit"
                    size="icon"
                    disabled={createCommentMutation.isPending || !content.trim()}
                    className="h-[40px] w-[40px] shrink-0"
                >
                    {createCommentMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
            </form>
        </div>
    );
}
