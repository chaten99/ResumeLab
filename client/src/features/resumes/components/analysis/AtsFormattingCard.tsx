import React from "react";
import { Layout, CheckCircle2, XCircle, AlertCircle, FileCode } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { AtsFormatting } from "../../types/resume.types";

interface AtsFormattingCardProps {
  formatting: AtsFormatting;
}

export const AtsFormattingCard: React.FC<AtsFormattingCardProps> = React.memo(({ formatting }) => {
  const feats = formatting.detectedFeatures || {};

  const getRiskVariant = (risk: string) => {
    if (risk === "Low") return "success";
    if (risk === "Medium") return "outline";
    return "destructive";
  };

  const featureChecklist = [
    { label: "Single Column Layout", ok: !feats.hasMultiColumnLayout },
    { label: "No Tables / Grid Scramble", ok: !feats.hasTables },
    { label: "No Emoji / Icon Glyphs", ok: !feats.hasIcons },
    { label: "Header/Footer Safe Contact", ok: !feats.hasHeaderFooterUsage },
    { label: "Email Recognizable", ok: feats.emailValid },
    { label: "Phone Number Parsed", ok: feats.phoneValid },
  ];

  return (
    <div className="space-y-6 font-sans animate-in fade-in slide-in-from-bottom-2 duration-200">
      {/* Header Score Card */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Layout className="size-4 text-primary" />
              <h3 className="text-sm font-bold tracking-tight text-foreground">
                ATS Layout & Formatting Compatibility
              </h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Evaluates parser safety, layout linearity, structure consistency, and contact field extraction.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex size-14 shrink-0 flex-col items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary font-bold">
              <span className="text-xl leading-none">{formatting.formattingScore}</span>
              <span className="text-[10px] font-medium text-muted-foreground mt-0.5">SCORE</span>
            </div>
            <Badge variant={getRiskVariant(formatting.riskLevel)} className="text-xs px-2.5 py-1">
              {formatting.riskLevel} Risk
            </Badge>
          </div>
        </div>

        {/* Feature Checklist Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
          {featureChecklist.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 p-2.5 rounded-md border border-border bg-muted/20 text-xs">
              {item.ok ? (
                <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
              ) : (
                <XCircle className="size-4 text-destructive shrink-0" />
              )}
              <span className="text-foreground font-medium truncate">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Formatting Issues */}
      {formatting.issues.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-5 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
            <AlertCircle className="size-4 text-amber-500" />
            <span>Detected Layout Compatibility Issues</span>
          </h4>
          <div className="space-y-2">
            {formatting.issues.map((iss, idx) => (
              <div key={idx} className="p-3 rounded-md border border-border bg-muted/20 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">{iss.category} Issue</span>
                  <Badge variant={iss.severity === "high" ? "destructive" : "outline"} className="text-[10px] uppercase">
                    {iss.severity}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{iss.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {formatting.suggestions.length > 0 && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-5 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
            <FileCode className="size-4" />
            <span>Formatting Optimization Actions</span>
          </h4>
          <ul className="space-y-1.5 pl-4 list-disc text-xs text-foreground/90 leading-relaxed">
            {formatting.suggestions.map((sug, idx) => (
              <li key={idx}>{sug}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
});
