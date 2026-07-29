import React from "react";
import type { AnalysisScores } from "../../types/resume.types";
import { cn } from "@/lib/utils";

interface ScoreOverviewCardProps {
  scores: AnalysisScores;
}

function getScoreColor(score: number): { text: string; bg: string; border: string } {
  if (score >= 80) {
    return {
      text: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    };
  }
  if (score >= 60) {
    return {
      text: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    };
  }
  return {
    text: "text-destructive",
    bg: "bg-destructive/10",
    border: "border-destructive/20",
  };
}

export const ScoreOverviewCard: React.FC<ScoreOverviewCardProps> = ({ scores }) => {
  const overallColor = getScoreColor(scores.overall);

  const subScores = [
    { label: "ATS Readiness", value: scores.ats },
    { label: "Role Relevance", value: scores.roleRelevance },
    { label: "Content Quality", value: scores.content },
    { label: "Impact & Action Verbs", value: scores.impact },
    { label: "Readability & Scanability", value: scores.readability },
  ];

  return (
    <div className="rounded-lg border border-border bg-card p-5 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h2 className="text-sm font-bold tracking-tight text-foreground">
            Analysis Score Overview
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Comprehensive evaluation breakdown and metrics out of 100.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex size-14 shrink-0 flex-col items-center justify-center rounded-lg border font-bold",
              overallColor.bg,
              overallColor.border,
              overallColor.text
            )}
          >
            <span className="text-xl leading-none">{scores.overall}</span>
            <span className="text-[10px] font-medium text-muted-foreground mt-0.5">OVERALL</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {subScores.map((item) => {
          const color = getScoreColor(item.value);
          return (
            <div
              key={item.label}
              className="flex flex-col justify-between p-3 rounded-md border border-border bg-muted/20 space-y-2"
            >
              <span className="text-[11px] font-medium text-muted-foreground leading-tight">
                {item.label}
              </span>
              <div className="flex items-baseline justify-between">
                <span className={cn("text-lg font-bold", color.text)}>
                  {item.value}
                </span>
                <span className="text-[10px] text-muted-foreground">/ 100</span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all duration-300",
                    item.value >= 80
                      ? "bg-emerald-500"
                      : item.value >= 60
                      ? "bg-amber-500"
                      : "bg-destructive"
                  )}
                  style={{ width: `${item.value}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
