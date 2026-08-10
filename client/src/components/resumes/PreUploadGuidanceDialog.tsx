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
  Sparkles,
  User,
  Briefcase,
  FolderGit2,
  GraduationCap,
  Award,
  ArrowRight,
  Clock,
  CheckCircle2,
} from "lucide-react";

interface PreUploadGuidanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProceed: () => void;
}

export const PreUploadGuidanceDialog: React.FC<PreUploadGuidanceDialogProps> = ({
  open,
  onOpenChange,
  onProceed,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto font-sans p-6 bg-card border-border shadow-2xl rounded-2xl">
        <DialogHeader className="border-b border-border/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Sparkles className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-foreground">
                Let's build your resume from your story
              </DialogTitle>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Clock className="size-3.5 text-primary" /> Speak naturally for approximately 1 to 3 minutes.
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-3 text-xs leading-relaxed">
          <div className="p-3.5 rounded-xl border border-primary/20 bg-primary/5 text-foreground space-y-1">
            <p className="font-bold text-xs flex items-center gap-1.5 text-primary">
              <CheckCircle2 className="size-4" /> AI Speech Extraction Active
            </p>
            <p className="text-[11px] text-muted-foreground">
              Don't worry about filling forms. Just speak about your background using the checklist below. Our AI will automatically organize your words into a professional resume.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground border-b border-border pb-1">
              Recommended Checklist to Mention
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-foreground">
                  <User className="size-3.5 text-primary" /> Personal Information
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Full name, target job role, email/phone, location, and professional links (LinkedIn, GitHub, Portfolio).
                </p>
              </div>

              <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-foreground">
                  <Briefcase className="size-3.5 text-primary" /> Work Experience
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Company names, job titles, start/end dates, key responsibilities, technologies used, and quantifiable metrics/achievements.
                </p>
              </div>

              <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-foreground">
                  <FolderGit2 className="size-3.5 text-primary" /> Key Projects
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Project names, problem solved, your role, tech stack (React, Node, etc.), major features built, and live links if any.
                </p>
              </div>

              <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-foreground">
                  <Sparkles className="size-3.5 text-primary" /> Technical Skills &amp; Tools
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Languages (TypeScript, Python), frameworks, databases (MongoDB, PostgreSQL), cloud (AWS, Docker), and DevOps tools.
                </p>
              </div>

              <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-foreground">
                  <GraduationCap className="size-3.5 text-primary" /> Education
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Degree, field of study, university/institution name, graduation year, and GPA/CGPA.
                </p>
              </div>

              <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-foreground">
                  <Award className="size-3.5 text-primary" /> Certifications &amp; Awards
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Industry certifications, hackathons, awards, scholarships, and special recognitions.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <Badge variant="outline" className="text-[10px] text-muted-foreground font-normal">
            Guidance for natural speech
          </Badge>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="text-xs">
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => {
                onOpenChange(false);
                onProceed();
              }}
              className="font-bold text-xs gap-1.5 shadow-md"
            >
              <span>Got it, Start Recording / Uploading</span>
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
