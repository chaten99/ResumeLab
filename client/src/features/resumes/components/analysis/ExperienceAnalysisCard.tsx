import React from "react";
import { Briefcase, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ExperienceAnalysis } from "../../types/resume.types";

interface ExperienceAnalysisCardProps {
  experience: ExperienceAnalysis;
}

export const ExperienceAnalysisCard: React.FC<ExperienceAnalysisCardProps> = React.memo(({ experience }) => {
  return (
    <div className="space-y-6 font-sans animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Briefcase className="size-4 text-primary" />
              <h3 className="text-sm font-bold tracking-tight text-foreground">
                Work Experience Teardown & Assessment
              </h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Evaluates scope of ownership, leadership signals, technical depth, and business impact for each role.
            </p>
          </div>

          <div className="flex size-14 shrink-0 flex-col items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary font-bold">
            <span className="text-xl leading-none">{experience.overallExperienceScore}</span>
            <span className="text-[10px] font-medium text-muted-foreground mt-0.5">QUALITY</span>
          </div>
        </div>

        <div className="space-y-4 pt-1">
          {experience.items.map((item, idx) => (
            <div key={idx} className="rounded-lg border border-border bg-muted/10 p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-foreground">{item.roleTitle}</h4>
                  <p className="text-xs text-muted-foreground">{item.company}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs font-semibold">
                    Score: {item.qualityScore}/100
                  </Badge>
                  <Badge variant="success" className="text-xs">
                    Relevance: {item.roleRelevance}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-md border border-border bg-background space-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">Technical Complexity</span>
                  <p className="text-muted-foreground leading-relaxed">{item.technicalComplexity}</p>
                </div>

                <div className="p-3 rounded-md border border-border bg-background space-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Business Value</span>
                  <p className="text-muted-foreground leading-relaxed">{item.businessValue}</p>
                </div>

                <div className="p-3 rounded-md border border-border bg-background space-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground">Ownership & Scope</span>
                  <p className="text-muted-foreground leading-relaxed">{item.ownership}</p>
                </div>

                <div className="p-3 rounded-md border border-border bg-background space-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground">Leadership Signals</span>
                  <p className="text-muted-foreground leading-relaxed">{item.leadership}</p>
                </div>
              </div>

              {item.improvementSuggestions.length > 0 && (
                <div className="pt-1 space-y-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <Lightbulb className="size-3" />
                    <span>Role Specific Improvement Actions</span>
                  </span>
                  <ul className="space-y-1 pl-4 list-disc text-xs text-muted-foreground">
                    {item.improvementSuggestions.map((sug, sIdx) => (
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
