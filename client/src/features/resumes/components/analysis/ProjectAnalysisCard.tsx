import React from "react";
import { FolderGit2, UserCheck, AlertTriangle, Lightbulb, CheckCircle2, ShieldAlert, Cpu } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ProjectAnalysis } from "../../types/resume.types";

interface ProjectAnalysisCardProps {
  project: ProjectAnalysis;
}

export const ProjectAnalysisCard: React.FC<ProjectAnalysisCardProps> = React.memo(({ project }) => {
  const getResumeValueVariant = (level: string) => {
    if (level === "Excellent Resume Project" || level === "Strong Resume Project") return "success";
    if (level === "Average Resume Project") return "outline";
    return "destructive";
  };

  const getDifficultyVariant = (level: string) => {
    if (level === "High") return "destructive";
    if (level === "Medium") return "outline";
    return "secondary";
  };

  return (
    <div className="space-y-6 font-sans animate-in fade-in slide-in-from-bottom-2 duration-200">
      {/* Header Overview Banner */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <FolderGit2 className="size-4 text-primary" />
              <h3 className="text-sm font-bold tracking-tight text-foreground">
                Technical Projects Recruiter Audit
              </h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Evaluates portfolio project depth, recruiter impression, missing opportunities, and resume impact.
            </p>
          </div>

          <div className="flex size-14 shrink-0 flex-col items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary font-bold">
            <span className="text-xl leading-none">{project.overallProjectScore}</span>
            <span className="text-[10px] font-medium text-muted-foreground mt-0.5">SCORE</span>
          </div>
        </div>

        {/* Project Reviews List */}
        <div className="space-y-6 pt-1">
          {project.items.map((item, idx) => (
            <div key={idx} className="rounded-lg border border-border bg-card p-6 space-y-5">
              {/* Project Header Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-foreground tracking-tight">{item.projectName}</h4>
                  <p className="text-xs text-muted-foreground">{item.resumeValue.reasoning}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  <Badge variant={getResumeValueVariant(item.resumeValue.level)} className="text-xs px-2.5 py-0.5 font-semibold">
                    {item.resumeValue.level}
                  </Badge>
                  <Badge variant="outline" className="text-xs font-semibold">
                    Score: {item.projectScore}/100
                  </Badge>
                </div>
              </div>

              {/* 1. Recruiter Impression */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
                  <UserCheck className="size-4 text-primary shrink-0" />
                  <span>Recruiter Impression</span>
                </div>
                <p className="text-xs text-foreground/90 leading-relaxed bg-muted/20 p-3.5 rounded-md border border-border/60">
                  {item.recruiterImpression}
                </p>
              </div>

              {/* 2 & 3. Technical Highlights & Difficulty Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Technical Highlights */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="size-4 shrink-0" />
                    <span>Technical Highlights</span>
                  </div>
                  <div className="space-y-1.5">
                    {item.technicalHighlights.map((hl, hIdx) => (
                      <div key={hIdx} className="text-xs font-medium text-foreground/90 p-2 rounded-md border border-emerald-500/20 bg-emerald-500/5">
                        {hl}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Technical Difficulty Assessment */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
                      <Cpu className="size-4 text-primary shrink-0" />
                      <span>Technical Difficulty</span>
                    </div>
                    <Badge variant={getDifficultyVariant(item.technicalDifficulty.level)} className="text-[10px] uppercase">
                      {item.technicalDifficulty.level} Complexity
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed p-3 rounded-md border border-border bg-background">
                    {item.technicalDifficulty.reasoning}
                  </p>
                </div>
              </div>

              {/* 4 & 5. Missing Opportunities & Recruiter Concerns Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Missing Opportunities */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="size-4 shrink-0" />
                    <span>Missing Opportunities ({item.missingOpportunities.length})</span>
                  </div>
                  <ul className="space-y-1.5 pl-4 list-disc text-xs text-muted-foreground leading-relaxed">
                    {item.missingOpportunities.map((miss, mIdx) => (
                      <li key={mIdx}>{miss}</li>
                    ))}
                  </ul>
                </div>

                {/* Recruiter Concerns */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-destructive">
                    <ShieldAlert className="size-4 shrink-0" />
                    <span>Recruiter Risk Notes</span>
                  </div>
                  <ul className="space-y-1.5 pl-4 list-disc text-xs text-muted-foreground leading-relaxed">
                    {item.recruiterConcerns.map((concern, cIdx) => (
                      <li key={cIdx}>{concern}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 6. AI Improvement Suggestions */}
              {item.aiImprovementSuggestions.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-border/60">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                    <Lightbulb className="size-4 shrink-0" />
                    <span>Actionable Improvements</span>
                  </div>
                  <ul className="space-y-1.5 pl-4 list-disc text-xs text-foreground/90 leading-relaxed">
                    {item.aiImprovementSuggestions.map((sug, sIdx) => (
                      <li key={sIdx}>{sug}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
