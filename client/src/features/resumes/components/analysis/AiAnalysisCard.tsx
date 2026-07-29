import React from "react";
import { CheckCircle2, AlertCircle, Sparkles, ShieldAlert, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { AiAnalysis } from "../../types/resume.types";

interface AiAnalysisCardProps {
  ai: AiAnalysis;
}

function getSeverityBadgeVariant(severity: string) {
  if (severity === "high") return "destructive";
  if (severity === "medium") return "outline";
  return "secondary";
}

export const AiAnalysisCard: React.FC<AiAnalysisCardProps> = ({ ai }) => {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
          <Sparkles className="size-4" />
          <span>Recruiter Evaluation Summary</span>
        </div>
        <p className="text-xs text-foreground/90 leading-relaxed font-sans">
          {ai.summary}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-border bg-card p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <Award className="size-4" />
            <span>Key Strengths ({ai.strengths.length})</span>
          </div>
          <ul className="space-y-2">
            {ai.strengths.map((item, index) => (
              <li key={index} className="flex items-start gap-2 text-xs text-muted-foreground leading-normal">
                <CheckCircle2 className="size-3.5 shrink-0 text-emerald-500 mt-0.5" />
                <span className="text-foreground/90">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-border bg-card p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-destructive">
            <ShieldAlert className="size-4" />
            <span>Areas for Improvement ({ai.weaknesses.length})</span>
          </div>
          <div className="space-y-2.5">
            {ai.weaknesses.map((item, index) => (
              <div key={index} className="p-2.5 rounded-md border border-border bg-muted/20 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-semibold text-foreground leading-tight">{item.title}</span>
                  <Badge variant={getSeverityBadgeVariant(item.severity)} className="text-[10px] uppercase py-0 px-1.5 font-semibold shrink-0">
                    {item.severity}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {ai.missingSkills.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <AlertCircle className="size-4 text-amber-500" />
            <span>Missing / Underrepresented Target Skills</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ai.missingSkills.map((skill, index) => (
              <Badge key={index} variant="outline" className="text-xs py-1 px-2.5 bg-background font-normal border-amber-500/30 text-foreground">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
