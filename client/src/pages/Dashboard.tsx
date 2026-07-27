import React from "react";
import { useNavigate } from "react-router-dom";
import { Plus, FileText } from "lucide-react";

import { useResumes } from "@/features/resumes/hooks/useResumes";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ResumeList } from "@/features/resumes/components/ResumeList";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data: resumesResponse, isLoading } = useResumes();

  const resumes = resumesResponse?.resumes || [];
  const totalResumes = resumes.length;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="text-xs text-muted-foreground">
            {totalResumes === 1
              ? "1 uploaded resume prepared for role analysis."
              : `${totalResumes} uploaded resumes prepared for role analysis.`}
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => navigate("/resumes/new")}
          className="gap-1.5 text-xs font-medium h-8 shrink-0"
        >
          <Plus className="size-3.5" />
          <span>Upload resume</span>
        </Button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <FileText className="size-3.5" />
            <span>Your Resumes</span>
          </h2>
        </div>

        <ResumeList limit={20} />
      </div>
    </div>
  );
};

export default Dashboard;
