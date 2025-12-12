import { useState } from 'react';
import { Announcement, AnnouncementType } from '@/services/community.service';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Megaphone, AlertCircle, Calendar, Tag, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { CommentSection } from './CommentSection';

interface AnnouncementCardProps {
    announcement: Announcement;
}

const getBadgeColor = (type: AnnouncementType) => {
    switch (type) {
        case AnnouncementType.pricing:
            return 'bg-green-500 hover:bg-green-600';
        case AnnouncementType.aid:
            return 'bg-blue-500 hover:bg-blue-600';
        case AnnouncementType.training:
            return 'bg-purple-500 hover:bg-purple-600';
        case AnnouncementType.event:
            return 'bg-orange-500 hover:bg-orange-600';
        default:
            return 'bg-gray-500 hover:bg-gray-600';
    }
};

const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
        case 'urgent':
            return 'text-red-500 font-bold';
        case 'high':
            return 'text-orange-500 font-semibold';
        default:
            return 'text-gray-500';
    }
};

export function AnnouncementCard({ announcement }: AnnouncementCardProps) {
    const [showComments, setShowComments] = useState(false);

    return (
        <Card className={`mb-4 w-full shadow-md ${announcement.priority === 'urgent' ? 'border-l-4 border-l-red-500' : ''}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center space-x-2">
                    {announcement.type === AnnouncementType.pricing ? (
                        <Tag className="h-5 w-5 text-green-500" />
                    ) : (
                        <Megaphone className="h-5 w-5 text-blue-500" />
                    )}
                    <CardTitle className="text-lg font-bold">
                        {announcement.title}
                    </CardTitle>
                </div>
                <Badge className={`${getBadgeColor(announcement.type)} text-white`}>
                    {announcement.type}
                </Badge>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 whitespace-pre-line">
                    {announcement.content}
                </p>
                <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-2">
                        <span>By {announcement.author.name}</span>
                        <span className="hidden sm:inline">•</span>
                        <span className={getPriorityColor(announcement.priority)}>
                            {announcement.priority.toUpperCase()} Priority
                        </span>
                    </div>
                    <div className="flex items-center">
                        <Calendar className="mr-1 h-3 w-3" />
                        {format(new Date(announcement.publishedAt), 'PPP')}
                    </div>
                </div>

                <div className="mt-4 pt-2 border-t border-gray-100">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-coffee-600 gap-2 mb-2 p-0 h-auto hover:bg-transparent"
                        onClick={() => setShowComments(!showComments)}
                    >
                        <MessageSquare className="h-4 w-4" />
                        {showComments ? 'Hide Comments' : 'Show Comments'}
                    </Button>

                    {showComments && (
                        <CommentSection targetId={announcement.id} targetType="announcement" className="mt-2 pl-4 border-l-2 border-gray-100" />
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
