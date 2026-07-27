import React from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, FileText, ArrowRight, RotateCcw, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import type { Resume } from "../types/resume.types";
import { getResumeId } from "../types/resume.types";

interface ResumeUploadSuccessProps {
  resume: Resume;
  onReset: () => void;
}

export const ResumeUploadSuccess: React.FC<ResumeUploadSuccessProps> = ({
  resume,
  onReset,
}) => {
  const navigate = useNavigate();
  const resumeId = getResumeId(resume);

  return (
    <div className="space-y-5 text-center py-2">
      <div className="flex flex-col items-center space-y-1.5">
        <div className="flex size-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-1 border border-emerald-500/20">
          <CheckCircle2 className="size-5" />
        </div>
        <h2 className="text-base font-bold text-foreground">
          Resume ready
        </h2>
        <p className="text-xs text-muted-foreground max-w-sm">
          Extracted PDF text is saved and prepared for target role analysis.
        </p>
      </div>

      <div className="text-left rounded-lg border border-border bg-card p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-foreground border border-border">
              <FileText className="size-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-semibold text-foreground truncate">
                {resume.originalName}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Target: <span className="font-medium text-foreground">{resume.targetRole}</span>
              </p>
            </div>
          </div>

          <Badge variant="success" className="text-[10px] py-0 px-2 font-medium flex items-center gap-1">
            <CheckCircle2 className="size-3" />
            <span>{resume.status || "Parsed"}</span>
          </Badge>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
        {resumeId && (
          <Button
            size="sm"
            className="w-full sm:w-auto gap-1.5 text-xs h-8 font-medium"
            onClick={() => navigate(`/resumes/${resumeId}`)}
          >
            <Eye className="size-3.5" />
            <span>View parsed resume</span>
            <ArrowRight className="size-3.5" />
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          className="w-full sm:w-auto gap-1.5 text-xs h-8"
          onClick={onReset}
        >
          <RotateCcw className="size-3.5" />
          <span>Upload another</span>
        </Button>
      </div>
    </div>
  );
};
