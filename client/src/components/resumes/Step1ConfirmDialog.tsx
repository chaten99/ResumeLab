import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  AlertTriangle,
  Lock,
  ArrowRight,
  Briefcase,
  FolderGit2,
  Sparkles,
  GraduationCap,
  Award,
  Loader2,
} from "lucide-react";
import type { StructuredResumeData } from "@/components/templates/types";

interface Step1ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: StructuredResumeData;
  onConfirm: () => Promise<void>;
  isConfirming?: boolean;
}

export const Step1ConfirmDialog: React.FC<Step1ConfirmDialogProps> = ({
  open,
  onOpenChange,
  data,
  onConfirm,
  isConfirming = false,
}) => {
  const contact = data?.contact || {};
  const experienceCount = data?.experience?.length || 0;
  const projectsCount = data?.projects?.length || 0;
  const skillsCount =
    (data?.skills?.technicalSkills?.length || 0) +
    (data?.skills?.tools?.length || 0);
  const educationCount = data?.education?.length || 0;
  const certificationsCount = data?.certifications?.length || 0;

  const warnings: string[] = [];
  if (experienceCount === 0) {
    warnings.push("Your introduction does not contain any work experience records.");
  }
  if (!contact.linkedin && !contact.github && !contact.portfolio) {
    warnings.push("Your professional links (LinkedIn/GitHub) were not detected.");
  }
  if (skillsCount === 0) {
    warnings.push("No technical skills were extracted.");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg font-sans p-6 bg-card border-border shadow-2xl rounded-2xl">
        <DialogHeader className="border-b border-border/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <CheckCircle2 className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-foreground">
                Review before continuing
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Your introduction has been processed. We've extracted the information below and will use it to build your resume.
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-3 text-xs">
          <div className="space-y-2">
            <p className="font-bold text-xs text-foreground">Extracted Resume Summary:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div className="p-2.5 rounded-lg border border-border bg-muted/20 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                  <Briefcase className="size-3.5 text-primary" /> Experience
                </span>
                <Badge variant="secondary" className="font-bold text-xs">{experienceCount}</Badge>
              </div>

              <div className="p-2.5 rounded-lg border border-border bg-muted/20 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                  <FolderGit2 className="size-3.5 text-primary" /> Projects
                </span>
                <Badge variant="secondary" className="font-bold text-xs">{projectsCount}</Badge>
              </div>

              <div className="p-2.5 rounded-lg border border-border bg-muted/20 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                  <Sparkles className="size-3.5 text-primary" /> Skills
                </span>
                <Badge variant="secondary" className="font-bold text-xs">{skillsCount}</Badge>
              </div>

              <div className="p-2.5 rounded-lg border border-border bg-muted/20 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                  <GraduationCap className="size-3.5 text-primary" /> Education
                </span>
                <Badge variant="secondary" className="font-bold text-xs">{educationCount}</Badge>
              </div>

              <div className="p-2.5 rounded-lg border border-border bg-muted/20 flex items-center justify-between col-span-2 sm:col-span-2">
                <span className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                  <Award className="size-3.5 text-primary" /> Certifications
                </span>
                <Badge variant="secondary" className="font-bold text-xs">{certificationsCount}</Badge>
              </div>
            </div>
          </div>

          {warnings.length > 0 && (
            <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-1.5">
              <p className="font-bold text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="size-3.5" /> Informational Section Notices
              </p>
              <ul className="list-disc list-inside text-[11px] text-muted-foreground space-y-0.5">
                {warnings.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="p-3 rounded-xl border border-border bg-card space-y-1">
            <p className="font-bold text-[11px] text-foreground flex items-center gap-1">
              <Lock className="size-3 text-primary" /> Lock Confirmation Notice
            </p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Confirming will lock Step 1 and attach your media source to this resume builder session. You can edit details in Step 2 anytime.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isConfirming}
            className="text-xs"
          >
            Go Back &amp; Edit
          </Button>
          <Button
            size="sm"
            onClick={onConfirm}
            disabled={isConfirming}
            className="font-bold text-xs gap-1.5 shadow-md"
          >
            {isConfirming ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Confirming...</span>
              </>
            ) : (
              <>
                <span>Confirm &amp; Continue</span>
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
