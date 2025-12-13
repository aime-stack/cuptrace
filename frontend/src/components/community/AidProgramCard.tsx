import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HeartHandshake, CheckCircle, Calendar, Loader2 } from 'lucide-react';
import { AidProgram, applyForAid } from '@/services/community.service';
import { formatDate } from '@/lib/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface AidProgramCardProps {
    program: AidProgram;
}

export function AidProgramCard({ program }: AidProgramCardProps) {
    const queryClient = useQueryClient();

    const applyMutation = useMutation({
        mutationFn: () => applyForAid(program.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['aidPrograms'] });
            toast.success('Application submitted successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to apply');
        }
    });

    const isExpired = program.deadline ? new Date(program.deadline) < new Date() : false;

    return (
        <Card className="w-full shadow-sm border-l-4 border-l-blue-500 mb-4 hover:shadow-md transition-shadow">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                            <HeartHandshake className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">{program.title}</CardTitle>
                            <CardDescription className="mt-1">{program.provider}</CardDescription>
                        </div>
                    </div>
                    <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50 capitalize">
                        {program.type}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">{program.description}</p>
                <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        <span className="font-medium mr-1">Eligibility:</span> {program.eligibility}
                    </div>
                    {program.deadline && (
                        <div className={`flex items-center text-sm ${isExpired ? 'text-red-500' : 'text-gray-600 dark:text-gray-300'}`}>
                            <Calendar className="h-4 w-4 mr-2" />
                            <span className="font-medium mr-1">Deadline:</span> {formatDate(program.deadline)}
                        </div>
                    )}
                </div>
            </CardContent>
            <CardFooter>
                <Button
                    variant={isExpired ? "outline" : "secondary"}
                    className="w-full"
                    onClick={() => applyMutation.mutate()}
                    disabled={applyMutation.isPending || isExpired}
                >
                    {applyMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    {isExpired ? 'Application Closed' : 'Apply Now'}
                </Button>
            </CardFooter>
        </Card>
    )
}
