import { BatchForm } from "@/roles/farmer/components/BatchForm";

export default function NewBatchPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">New Batch</h1>
            </div>

            <BatchForm />
        </div>
    );
}

