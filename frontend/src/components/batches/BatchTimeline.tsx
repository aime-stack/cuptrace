import React from 'react';
import { SupplyChainStage, BatchHistory } from '@/types';
import { cn } from '@/lib/utils';
import { Sprout, Droplets, Factory, Plane, Container, Store } from 'lucide-react';
import { format } from 'date-fns';

interface BatchTimelineProps {
    currentStage: SupplyChainStage;
    history?: BatchHistory[];
    className?: string;
    /** Optional: Pass "completed" if the batch is fully done to highlight everything if needed, 
     * though usually currentStage=retailer should handle it. */
    isFullyCompleted?: boolean;
}

const STAGES = [
    {
        id: SupplyChainStage.farmer,
        label: 'Farmer',
        description: 'Harvested & Collected',
        icon: Sprout
    },
    {
        id: SupplyChainStage.washing_station,
        label: 'Washing Station',
        description: 'Processed & Dried',
        icon: Droplets
    },
    {
        id: SupplyChainStage.factory,
        label: 'Factory',
        description: 'Milled & Graded',
        icon: Factory
    },
    {
        id: SupplyChainStage.exporter,
        label: 'Exporter',
        description: 'Packed & Shipped',
        icon: Plane
    },
    {
        id: SupplyChainStage.importer,
        label: 'Importer',
        description: 'Received & Cleared',
        icon: Container
    },
    {
        id: SupplyChainStage.retailer,
        label: 'Retailer',
        description: 'Roasted & Sold',
        icon: Store
    }
];

export function BatchTimeline({ currentStage, history = [], className, isFullyCompleted }: BatchTimelineProps) {
    const currentStageIndex = STAGES.findIndex(s => s.id === currentStage);

    // If the batch status is explicitly completed, maybe we should consider the timeline full?
    // But let's rely on currentStageIndex primarily. If index is -1 (unknown), we default to 0.
    // If isFullyCompleted is true, maybe we should override? 
    // Let's assume currentStage is accurate.

    const safeCurrentIndex = currentStageIndex === -1 ? 0 : currentStageIndex;

    const getStageDate = (stageId: SupplyChainStage) => {
        const entry = history.find(h => h.stage === stageId);
        return entry ? new Date(entry.timestamp) : null;
    };

    return (
        <div className={cn("w-full py-8", className)}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-start w-full px-4 relative">

                {STAGES.map((stage, index) => {
                    // Logic: A stage is completed if we are past it or at it.
                    const isCompleted = index <= safeCurrentIndex;
                    // Logic: The line AFTER this stage is colored if the NEXT stage is also completed (or we are at it).
                    const isNextCompleted = index < safeCurrentIndex;
                    const stageDate = getStageDate(stage.id);
                    const isLast = index === STAGES.length - 1;

                    return (
                        <div key={stage.id} className="relative flex-1 flex flex-row md:flex-col items-center w-full md:w-auto mb-8 md:mb-0 last:mb-0 group">

                            {/* --- CONNECTING LINES (Segments) --- */}

                            {/* Desktop Line: Horizontal to the right */}
                            {!isLast && (
                                <div
                                    className="hidden md:block absolute top-6 left-[50%] right-[-50%] h-1 z-0 transition-colors duration-500"
                                    style={{
                                        backgroundColor: isNextCompleted ? 'hsl(var(--primary))' : '#e5e7eb' // coffee-600 vs gray-200
                                    }}
                                >
                                    {/* Use a dirty color variable hack or explicit if above fails. Tailwind colors might not be resolved in style if using class names. 
                                        Let's use classes.
                                    */}
                                    <div className={cn(
                                        "w-full h-full",
                                        isNextCompleted ? "bg-coffee-600" : "bg-gray-200 dark:bg-gray-800"
                                    )} />
                                </div>
                            )}

                            {/* Mobile Line: Vertical to the bottom */}
                            {!isLast && (
                                <div
                                    className={cn(
                                        "md:hidden absolute left-6 top-10 bottom-[-32px] w-1 z-0",
                                        isNextCompleted ? "bg-coffee-600" : "bg-gray-200 dark:bg-gray-800"
                                    )}
                                />
                            )}


                            {/* --- ICON --- */}

                            <div className={cn(
                                "relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-4 transition-all duration-300 shrink-0 mr-4 md:mr-0",
                                isCompleted
                                    ? "bg-coffee-600 border-coffee-200 text-white shadow-sm"
                                    : "bg-white border-gray-200 text-gray-300 dark:bg-gray-900 dark:border-gray-700"
                            )}>
                                <stage.icon className="w-5 h-5" />
                            </div>

                            {/* --- LABELS --- */}

                            <div className="md:mt-4 md:text-center">
                                <h4 className={cn(
                                    "text-sm font-bold",
                                    isCompleted ? "text-gray-900 dark:text-gray-100" : "text-gray-400"
                                )}>
                                    {stage.label}
                                </h4>
                                <p className="text-xs text-gray-500 block">{stage.description}</p>
                                {stageDate && (
                                    <span className="text-[10px] text-coffee-600 font-medium block mt-1">
                                        {format(stageDate, 'MMM d, yyyy')}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
