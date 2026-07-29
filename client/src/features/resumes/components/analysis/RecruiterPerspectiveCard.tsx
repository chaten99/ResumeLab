import React from "react";
import { UserCheck, ShieldAlert, Award, AlertTriangle, Info, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { RecruiterPerspective } from "../../types/resume.types";

interface RecruiterPerspectiveCardProps {
  recruiter: RecruiterPerspective;
}

export const RecruiterPerspectiveCard: React.FC<RecruiterPerspectiveCardProps> = React.memo(({ recruiter }) => {
  const getProbabilityVariant = (category: string) => {
    if (category === "Very High" || category === "High") return "success";
    if (category === "Moderate") return "outline";
    return "destructive";
  };

  return (
    <div className="space-y-6 font-sans animate-in fade-in slide-in-from-bottom-2 duration-200">
      {/* AI Guidance Disclaimer Badge */}
      <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground">
        <Info className="size-4 text-primary shrink-0" />
        <span>
          <strong>Recruiter Perspective:</strong> AI-generated evaluation simulating recruiter scanning criteria. This represents diagnostic guidance rather than a guarantee of hiring outcomes.
        </span>
      </div>

      {/* Hero Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* First Impression Score Card */}
        <div className="rounded-lg border border-border bg-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <UserCheck className="size-4 text-primary" />
              <span>First Impression Score</span>
            </div>
            <span className="text-xl font-bold text-primary">{recruiter.firstImpressionScore}/100</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {recruiter.firstImpressionExplanation}
          </p>
        </div>

        {/* Shortlisting Probability Card */}
        <div className="rounded-lg border border-border bg-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Award className="size-4 text-emerald-500" />
              <span>Shortlisting Estimate</span>
            </div>
            <Badge variant={getProbabilityVariant(recruiter.shortlistingProbability.category)} className="text-xs px-2.5 py-0.5">
              {recruiter.shortlistingProbability.category}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {recruiter.shortlistingProbability.reasoning}
          </p>
        </div>
      </div>

      {/* Recruiter Summary Box */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
          Recruiter Screening Summary
        </h3>
        <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-line font-sans">
          {recruiter.recruiterSummary}
        </p>
      </div>

      {/* Strengths vs Weaknesses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Key Strengths */}
        <div className="rounded-lg border border-border bg-card p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-4" />
            <span>Top Recruiter Strengths ({recruiter.strengths.length})</span>
          </div>
          <div className="space-y-2.5">
            {recruiter.strengths.map((item, idx) => (
              <div key={idx} className="p-3 rounded-md border border-border bg-muted/20 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">{item.title}</span>
                  <Badge variant="outline" className="text-[10px] uppercase">{item.importance}</Badge>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Weaknesses */}
        <div className="rounded-lg border border-border bg-card p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-destructive">
            <ShieldAlert className="size-4" />
            <span>Screening Weaknesses ({recruiter.weaknesses.length})</span>
          </div>
          <div className="space-y-2.5">
            {recruiter.weaknesses.map((item, idx) => (
              <div key={idx} className="p-3 rounded-md border border-border bg-muted/20 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">{item.title}</span>
                  <Badge variant="destructive" className="text-[10px] uppercase">{item.severity}</Badge>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recruiter Concerns & Raw Notes */}
      {recruiter.concerns.length > 0 && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
            <AlertTriangle className="size-4" />
            <span>Recruiter Concerns & Risk Factors</span>
          </div>
          <ul className="space-y-1.5 pl-4 list-disc text-xs text-foreground/90">
            {recruiter.concerns.map((concern, idx) => (
              <li key={idx}>{concern}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
});
