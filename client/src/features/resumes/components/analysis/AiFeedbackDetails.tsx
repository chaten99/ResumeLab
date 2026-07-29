import React, { useState } from "react";
import {
  ListCheck,
  Briefcase,
  FolderGit2,
  FileText,
  ArrowRight,
  Copy,
  Check,
  Maximize2,
  CheckSquare,
  Square,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { AiAnalysis, AiBulletFeedback } from "../../types/resume.types";

interface AiFeedbackDetailsProps {
  ai: AiAnalysis;
}

export const AiFeedbackDetails: React.FC<AiFeedbackDetailsProps> = ({ ai }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [expandedBullet, setExpandedBullet] = useState<AiBulletFeedback | null>(null);
  const [checkedSuggestions, setCheckedSuggestions] = useState<Record<number, boolean>>({});

  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      toast.success("Improved bullet copied to clipboard!");
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      toast.error("Failed to copy bullet");
    }
  };

  const toggleCheck = (index: number) => {
    setCheckedSuggestions((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="space-y-6 font-sans">
      {ai.prioritizedSuggestions.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wider">
              <ListCheck className="size-4 text-primary" />
              <span>Highest Priority Action Items</span>
            </div>
            <span className="text-[11px] text-muted-foreground">
              {Object.values(checkedSuggestions).filter(Boolean).length} / {ai.prioritizedSuggestions.length} completed
            </span>
          </div>

          <div className="space-y-2">
            {ai.prioritizedSuggestions.map((item, index) => {
              const isChecked = !!checkedSuggestions[index];
              return (
                <div
                  key={index}
                  onClick={() => toggleCheck(index)}
                  className={`flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-colors ${
                    isChecked
                      ? "bg-muted/40 border-border text-muted-foreground line-through"
                      : "bg-background border-border/70 hover:bg-accent/40 text-foreground"
                  }`}
                >
                  <button type="button" className="mt-0.5 shrink-0 text-primary">
                    {isChecked ? (
                      <CheckSquare className="size-4 text-emerald-500" />
                    ) : (
                      <Square className="size-4 text-muted-foreground" />
                    )}
                  </button>
                  <span className="text-xs leading-relaxed font-medium">
                    {index + 1}. {item}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {ai.bulletFeedback.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wider">
              <FileText className="size-4 text-primary" />
              <span>Resume Bullet Feedback & Rewrites</span>
            </div>
            <span className="text-[11px] text-muted-foreground">
              {ai.bulletFeedback.length} bullets evaluated
            </span>
          </div>

          <div className="space-y-4">
            {ai.bulletFeedback.map((bullet, index) => (
              <div key={index} className="p-4 rounded-lg border border-border bg-muted/20 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Original Bullet
                  </span>
                  <div className="flex items-center gap-1.5">
                    {bullet.improvedExample && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(bullet.improvedExample!, index)}
                        className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-foreground px-2"
                      >
                        {copiedIndex === index ? (
                          <>
                            <Check className="size-3.5 text-emerald-600" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="size-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedBullet(bullet)}
                      className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground px-2"
                    >
                      <Maximize2 className="size-3.5" />
                      <span>Expand</span>
                    </Button>
                  </div>
                </div>

                <p className="text-xs font-mono bg-background p-2.5 rounded border border-border text-foreground/90 leading-relaxed">
                  "{bullet.original}"
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-destructive">
                      Issue Identified
                    </span>
                    <p className="text-muted-foreground leading-relaxed">
                      {bullet.problem}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                      Actionable Suggestion
                    </span>
                    <p className="text-muted-foreground leading-relaxed">
                      {bullet.suggestion}
                    </p>
                  </div>
                </div>

                {bullet.improvedExample && (
                  <div className="pt-1 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      <div className="flex items-center gap-1">
                        <span>Improved Example</span>
                        <ArrowRight className="size-3" />
                      </div>
                    </div>
                    <p className="text-xs font-mono bg-emerald-500/5 p-2.5 rounded border border-emerald-500/20 text-foreground leading-relaxed">
                      "{bullet.improvedExample}"
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ai.experienceFeedback.length > 0 && (
          <div className="rounded-lg border border-border bg-card p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <Briefcase className="size-4 text-primary" />
              <span>Work Experience Feedback</span>
            </div>
            <div className="space-y-2.5">
              {ai.experienceFeedback.map((item, index) => (
                <div key={index} className="p-3 rounded-md border border-border bg-muted/20 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-foreground">{item.title}</span>
                    <Badge variant="outline" className="text-[10px] uppercase py-0 px-1.5 font-normal">
                      {item.severity}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {ai.projectFeedback.length > 0 && (
          <div className="rounded-lg border border-border bg-card p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <FolderGit2 className="size-4 text-primary" />
              <span>Projects Feedback</span>
            </div>
            <div className="space-y-2.5">
              {ai.projectFeedback.map((item, index) => (
                <div key={index} className="p-3 rounded-md border border-border bg-muted/20 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-foreground">{item.title}</span>
                    <Badge variant="outline" className="text-[10px] uppercase py-0 px-1.5 font-normal">
                      {item.severity}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {expandedBullet && (
        <Dialog open={!!expandedBullet} onOpenChange={() => setExpandedBullet(null)}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="text-sm font-bold">Bullet Point Detailed Critique</DialogTitle>
              <DialogDescription className="text-xs">
                Detailed comparison of the original bullet, detected issue, suggestion, and revised version.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Original Bullet Text
                </span>
                <p className="text-xs font-mono bg-muted p-3 rounded-md border border-border text-foreground">
                  "{expandedBullet.original}"
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-destructive">
                  Recruiter Screening Issue
                </span>
                <p className="text-xs text-muted-foreground leading-relaxed bg-destructive/5 p-3 rounded-md border border-destructive/20">
                  {expandedBullet.problem}
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                  Actionable Recommendation
                </span>
                <p className="text-xs text-muted-foreground leading-relaxed bg-primary/5 p-3 rounded-md border border-primary/20">
                  {expandedBullet.suggestion}
                </p>
              </div>

              {expandedBullet.improvedExample && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Recommended Rewrite Example
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopy(expandedBullet.improvedExample!, -1)}
                      className="h-7 text-xs gap-1.5"
                    >
                      <Copy className="size-3.5" />
                      <span>Copy</span>
                    </Button>
                  </div>
                  <p className="text-xs font-mono bg-emerald-500/10 p-3 rounded-md border border-emerald-500/20 text-foreground leading-relaxed">
                    "{expandedBullet.improvedExample}"
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
