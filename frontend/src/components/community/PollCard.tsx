import React, { useState } from 'react';
import { Poll, PollType, voteOnPoll, getPollResults } from '@/services/community.service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Vote, CheckCircle2, AlertCircle } from 'lucide-react';
import { CommentSection } from './CommentSection';
import { formatDistanceToNow } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface PollCardProps {
    poll: Poll;
}

export function PollCard({ poll }: PollCardProps) {
    const [selectedOption, setSelectedOption] = useState<string | null>(poll.userVote?.optionId || null);
    const queryClient = useQueryClient();

    // Fetch results only if user voted or poll is closed
    const showResults = !!poll.userVote || new Date(poll.endsAt) < new Date();

    // Fetch results query
    const { data: results } = useQuery({
        queryKey: ['pollResults', poll.id],
        queryFn: () => getPollResults(poll.id),
        enabled: showResults
    });

    const voteMutation = useMutation({
        mutationFn: (optionId: string) => voteOnPoll(poll.id, optionId),
        onSuccess: () => {
            toast.success('Vote submitted successfully');
            queryClient.invalidateQueries({ queryKey: ['polls'] });
            queryClient.invalidateQueries({ queryKey: ['poll', poll.id] });
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to submit vote');
        }
    });

    const handleVote = () => {
        if (!selectedOption) return;
        voteMutation.mutate(selectedOption);
    };

    const calculatePercentage = (optionId: string) => {
        if (!results) return 0;
        const total = results.reduce((acc: number, curr: any) => acc + curr.count, 0);
        if (total === 0) return 0;
        const optionCount = results.find((r: any) => r.optionId === optionId)?.count || 0;
        return Math.round((optionCount / total) * 100);
    };

    const getVoteCount = (optionId: string) => {
        if (!results) return 0;
        return results.find((r: any) => r.optionId === optionId)?.count || 0;
    };

    const isExpired = new Date(poll.endsAt) < new Date();

    return (
        <Card className="w-full shadow-md mb-6">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <Vote className="h-5 w-5 text-primary" />
                            {poll.title}
                        </CardTitle>
                        <CardDescription className="mt-2">
                            {poll.description}
                        </CardDescription>
                    </div>
                    <Badge variant={isExpired ? "secondary" : "default"}>
                        {isExpired ? 'Closed' : 'Active'}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                {showResults ? (
                    <div className="space-y-4">
                        {poll.options.map((option) => (
                            <div key={option.id} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium flex items-center gap-2">
                                        {option.text}
                                        {poll.userVote?.optionId === option.id && (
                                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                                        )}
                                    </span>
                                    <span className="text-muted-foreground">{calculatePercentage(option.id)}% ({getVoteCount(option.id)} votes)</span>
                                </div>
                                <Progress value={calculatePercentage(option.id)} className="h-2" />
                            </div>
                        ))}
                        <p className="text-xs text-muted-foreground text-center mt-4">
                            Total votes: {results?.reduce((acc: number, curr: any) => acc + curr.count, 0) || 0}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <RadioGroup value={selectedOption || ""} onValueChange={setSelectedOption} disabled={voteMutation.isPending}>
                            {poll.options.map((option) => (
                                <div key={option.id} className="flex items-center space-x-2 border p-3 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                    <RadioGroupItem value={option.id} id={option.id} />
                                    <Label htmlFor={option.id} className="flex-grow cursor-pointer font-medium">{option.text}</Label>
                                </div>
                            ))}
                        </RadioGroup>
                        <Button
                            className="w-full mt-4"
                            onClick={handleVote}
                            disabled={!selectedOption || voteMutation.isPending}
                        >
                            {voteMutation.isPending ? 'Submitting...' : 'Submit Vote'}
                        </Button>
                    </div>
                )}

                <div className="mt-4 pt-4 border-t text-xs text-muted-foreground flex justify-between">
                    <span>Ends {formatDistanceToNow(new Date(poll.endsAt), { addSuffix: true })}</span>
                    {poll.userVote && <span className="text-green-600 font-medium flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> You voted</span>}
                </div>

                <div className="mt-4 border-t border-gray-100 pt-2">
                    <CommentSection targetId={poll.id} targetType="poll" />
                </div>
            </CardContent>
        </Card>
    );
}
