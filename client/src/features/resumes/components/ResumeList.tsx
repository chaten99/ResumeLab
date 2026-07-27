import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FileText,
  Plus,
  Ellipsis,
  Eye,
  Trash2,
  RefreshCw,
  CheckCircle2,
  Calendar,
  Layers,
  Briefcase,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useResumes } from "../hooks/useResumes";
import type { Resume } from "../types/resume.types";
import { getResumeId } from "../types/resume.types";
import { DeleteResumeDialog } from "./DeleteResumeDialog";

interface ResumeListProps {
  limit?: number;
  showUploadCta?: boolean;
}

export const ResumeList: React.FC<ResumeListProps> = ({
  limit,
  showUploadCta = true,
}) => {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useResumes();
  const [selectedResumeToDelete, setSelectedResumeToDelete] = useState<Resume | null>(null);

  const resumes = data?.resumes || [];
  const displayedResumes = limit ? resumes.slice(0, limit) : resumes;

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between p-4 rounded-lg border border-border bg-card"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="size-9 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <Skeleton className="h-7 w-7 rounded-md" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 rounded-lg border border-border bg-card text-center space-y-3">
        <p className="text-xs font-semibold text-foreground">
          Unable to load resumes
        </p>
        <p className="text-xs text-muted-foreground max-w-xs">
          Something went wrong while fetching your uploaded resumes.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="gap-2 text-xs h-8"
        >
          <RefreshCw className="size-3.5" />
          <span>Retry</span>
        </Button>
      </div>
    );
  }

  if (resumes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-10 rounded-lg border border-dashed border-border bg-card/50 text-center space-y-2">
        <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground mb-1">
          <FileText className="size-5" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">No resumes yet</h3>
        <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
          Upload your first resume to start preparing it for target role analysis.
        </p>
        {showUploadCta && (
          <Button
            size="sm"
            onClick={() => navigate("/resumes/new")}
            className="mt-3 gap-1.5 text-xs h-8 font-medium"
          >
            <Plus className="size-3.5" />
            <span>Upload resume</span>
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {displayedResumes.map((resume) => {
        const id = getResumeId(resume);
        const pageText = resume.pageCount
          ? `${resume.pageCount} ${resume.pageCount === 1 ? "page" : "pages"}`
          : "1 page";

        return (
          <div
            key={id || resume.originalName}
            className="group relative flex items-start justify-between p-4 rounded-lg border border-border bg-card hover:bg-muted/40 hover:border-border/80 transition-all duration-200"
          >
            <div className="flex items-start gap-3.5 min-w-0 pr-2">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground group-hover:text-foreground transition-colors mt-0.5">
                <FileText className="size-4" />
              </div>

              <div className="min-w-0 space-y-1">
                <Link
                  to={`/resumes/${id}`}
                  className="text-sm font-semibold text-foreground hover:underline truncate block max-w-xs sm:max-w-md"
                >
                  {resume.originalName}
                </Link>

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                  <Briefcase className="size-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate">{resume.targetRole}</span>
                </div>

                <div className="flex items-center gap-2.5 pt-1 text-[11px] text-muted-foreground flex-wrap">
                  <Badge variant="success" className="text-[10px] py-0 px-2 font-medium flex items-center gap-1">
                    <CheckCircle2 className="size-3" />
                    <span>{resume.status || "Parsed"}</span>
                  </Badge>

                  <span>·</span>

                  <div className="flex items-center gap-1">
                    <Layers className="size-3" />
                    <span>{pageText}</span>
                  </div>

                  <span>·</span>

                  <div className="flex items-center gap-1">
                    <Calendar className="size-3" />
                    <span>
                      {new Date(resume.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="shrink-0 pt-0.5">
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="flex size-7 items-center justify-center rounded-md border border-transparent hover:border-border text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                  aria-label={`Actions for ${resume.originalName}`}
                >
                  <Ellipsis className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-38">
                  <DropdownMenuItem onClick={() => navigate(`/resumes/${id}`)}>
                    <Eye className="size-3.5" />
                    <span>View</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    destructive
                    onClick={() => setSelectedResumeToDelete(resume)}
                  >
                    <Trash2 className="size-3.5" />
                    <span>Delete resume</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        );
      })}

      <DeleteResumeDialog
        resume={
          selectedResumeToDelete
            ? {
                id: getResumeId(selectedResumeToDelete),
                originalName: selectedResumeToDelete.originalName,
              }
            : null
        }
        open={!!selectedResumeToDelete}
        onOpenChange={(open) => {
          if (!open) setSelectedResumeToDelete(null);
        }}
      />
    </div>
  );
};
