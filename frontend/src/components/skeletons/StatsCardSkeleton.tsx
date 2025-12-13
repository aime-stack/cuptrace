import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export function StatsCardSkeleton() {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                    <Skeleton className="h-8 w-[60px]" />
                </div>
                <Skeleton className="h-3 w-[140px] mt-1" />
            </CardContent>
        </Card>
    );
}
