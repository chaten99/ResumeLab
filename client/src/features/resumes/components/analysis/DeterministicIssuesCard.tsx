import React from "react";
import { AlertTriangle, Info, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { AnalysisIssue } from "../../types/resume.types";

interface DeterministicIssuesCardProps {
  issues: AnalysisIssue[];
}

function getSeverityBadge(severity: string) {
  if (severity === "high") return <Badge variant="destructive" className="text-[10px] uppercase py-0 px-1.5 font-semibold">High</Badge>;
  if (severity === "medium") return <Badge variant="outline" className="text-[10px] uppercase py-0 px-1.5 border-amber-500/30 text-amber-600 dark:text-amber-400">Medium</Badge>;
  return <Badge variant="secondary" className="text-[10px] uppercase py-0 px-1.5 font-normal">Low</Badge>;
}

export const DeterministicIssuesCard: React.FC<DeterministicIssuesCardProps> = ({ issues }) => {
  if (issues.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-4 flex items-center gap-3">
        <Info className="size-4 text-emerald-500 shrink-0" />
        <p className="text-xs text-muted-foreground">
          No deterministic rule violations detected! Your resume passes standard structure and contact checks.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wider">
          <AlertTriangle className="size-4 text-amber-500" />
          <span>Rule-Based Diagnostic Checks ({issues.length})</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {issues.map((issue, index) => (
          <div
            key={index}
            className="flex items-start justify-between gap-3 p-3 rounded-md border border-border bg-muted/20 text-xs"
          >
            <div className="flex items-start gap-2.5 min-w-0">
              <ShieldAlert className="size-3.5 shrink-0 text-muted-foreground mt-0.5" />
              <div className="space-y-0.5 min-w-0">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
                  {issue.type}
                </span>
                <p className="text-foreground/90 leading-snug">{issue.message}</p>
              </div>
            </div>

            <div className="shrink-0">{getSeverityBadge(issue.severity)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
