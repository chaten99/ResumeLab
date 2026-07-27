import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Copy,
  Check,
  Ellipsis,
  Trash2,
  Plus,
  FileText,
  Briefcase,
  Layers,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

import { useResume } from "@/features/resumes/hooks/useResumes";
import { getResumeId } from "@/features/resumes/types/resume.types";
import { DeleteResumeDialog } from "@/features/resumes/components/DeleteResumeDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ResumeDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useResume(id || "");

  const [isCopied, setIsCopied] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const resume = data?.resume;

  const handleCopyText = async () => {
    if (!resume?.extractedText) return;
    try {
      await navigator.clipboard.writeText(resume.extractedText);
      setIsCopied(true);
      toast.success("Text copied to clipboard");
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast.error("Copy failed");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (isError || !resume) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl text-center space-y-3">
        <h1 className="text-lg font-semibold text-foreground">Resume not found</h1>
        <p className="text-xs text-muted-foreground">
          The resume you are looking for does not exist or has been deleted.
        </p>
        <Button size="sm" variant="outline" onClick={() => navigate("/dashboard")} className="gap-2 text-xs">
          <ArrowLeft className="size-3.5" />
          <span>Return to Dashboard</span>
        </Button>
      </div>
    );
  }

  const pageText = resume.pageCount
    ? `${resume.pageCount} ${resume.pageCount === 1 ? "page" : "pages"}`
    : "1 page";

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/dashboard")}
          className="gap-1.5 text-xs text-muted-foreground hover:text-foreground p-0 h-auto"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to Dashboard</span>
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/resumes/new")}
            className="gap-1.5 text-xs h-7"
          >
            <Plus className="size-3.5" />
            <span>Upload new</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger
              className="flex size-7 items-center justify-center rounded-md border border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              aria-label="More actions"
            >
              <Ellipsis className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-38">
              <DropdownMenuItem destructive onClick={() => setShowDeleteDialog(true)}>
                <Trash2 className="size-3.5" />
                <span>Delete resume</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-3 border-b border-border pb-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-primary border border-border">
                <FileText className="size-4" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground truncate">
                {resume.originalName}
              </h1>
            </div>

            <Badge variant="success" className="text-xs font-medium px-2.5 py-0.5 flex items-center gap-1">
              <CheckCircle2 className="size-3.5" />
              <span>{resume.status || "Parsed"}</span>
            </Badge>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap pt-1">
            <div className="flex items-center gap-1.5 text-foreground font-medium">
              <Briefcase className="size-3.5 text-muted-foreground" />
              <span>{resume.targetRole}</span>
            </div>
            <span>·</span>
            <div className="flex items-center gap-1.5">
              <Layers className="size-3.5 text-muted-foreground" />
              <span>{pageText}</span>
            </div>
            <span>·</span>
            <div className="flex items-center gap-1.5">
              <Calendar className="size-3.5 text-muted-foreground" />
              <span>
                Uploaded{" "}
                {new Date(resume.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>

        {resume.jobDescription && (
          <div className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <FileText className="size-3.5" />
              <span>Target Job Description</span>
            </h2>
            <div className="p-4 rounded-lg border border-border bg-card text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {resume.jobDescription}
            </div>
          </div>
        )}

        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <FileText className="size-3.5" />
              <span>Extracted Resume Text</span>
            </h2>

            {resume.extractedText && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyText}
                className="gap-1.5 text-xs h-7 text-muted-foreground hover:text-foreground"
              >
                {isCopied ? (
                  <>
                    <Check className="size-3.5 text-emerald-600" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5" />
                    <span>Copy text</span>
                  </>
                )}
              </Button>
            )}
          </div>

          {resume.extractedText ? (
            <div className="rounded-lg border border-border bg-muted/30 p-4 font-mono text-xs text-foreground/90 max-h-[500px] overflow-y-auto whitespace-pre-wrap leading-relaxed select-text">
              {resume.extractedText}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">
              No extracted text available for this resume.
            </p>
          )}
        </div>
      </div>

      <DeleteResumeDialog
        resume={{
          id: getResumeId(resume),
          originalName: resume.originalName,
        }}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onSuccess={() => navigate("/dashboard", { replace: true })}
      />
    </div>
  );
};

export default ResumeDetails;
