import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { FullPageLoader } from "@/components/ui/loader";

export const AnalysisLoadingSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 font-sans">
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-6">
        <FullPageLoader subtitle="Analyzing your resume..." />
      </div>

      <div className="space-y-3">
        <Skeleton className="h-28 w-full rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-44 w-full rounded-lg" />
          <Skeleton className="h-44 w-full rounded-lg" />
        </div>
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    </div>
  );
};
