import React, { useState } from "react";
import { useIsMutating } from "@tanstack/react-query";
import {
  Target,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RotateCcw,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { FullPageLoader } from "@/components/ui/loader";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAtsMatch, useRunAtsMatch } from "../hooks/useAtsMatch";
import type { AtsSkillItem } from "../types/ats.types";

interface AtsKeywordMatcherProps {
  resumeId: string;
  targetRole: string;
  jobDescription?: string;
}

type CategoryKey =
  | "all"
  | "technicalSkills"
  | "softSkills"
  | "tools"
  | "frameworks"
  | "databases"
  | "cloud"
  | "programmingLanguages";

const CATEGORY_LABELS: Record<CategoryKey, string> = {
  all: "All Skills",
  technicalSkills: "Technical",
  frameworks: "Frameworks",
  programmingLanguages: "Languages",
  databases: "Databases",
  cloud: "Cloud",
  tools: "Tools & DevOps",
  softSkills: "Soft Skills",
};

export const AtsKeywordMatcher: React.FC<AtsKeywordMatcherProps> = ({
  resumeId,
  targetRole,
  jobDescription,
}) => {
  const { data: atsData, isLoading, isError } = useAtsMatch(resumeId);
  const runAtsMutation = useRunAtsMatch(resumeId);

  const isGlobalAtsMutating = useIsMutating({ mutationKey: ["atsMatch", resumeId] }) > 0;
  const isPending = runAtsMutation.isPending || isGlobalAtsMutating;

  const [activeCategory, setActiveCategory] = useState<CategoryKey>("all");
  const [selectedMissingSkill, setSelectedMissingSkill] = useState<AtsSkillItem | null>(null);

  const atsMatch = atsData?.atsMatch;

  const handleRunAtsMatch = async () => {
    if (isPending) return;
    try {
      await runAtsMutation.mutateAsync({ jobDescription });
      toast.success("ATS keyword analysis completed!");
    } catch (err: any) {
      if (axios.isCancel(err) || err?.name === "CanceledError") return;
      toast.error(err?.response?.data?.message || "Failed to run ATS analysis");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6 rounded-lg border border-border bg-card">
        <FullPageLoader subtitle="Evaluating ATS keyword alignment..." />
      </div>
    );
  }

  if (isError || !atsMatch) {
    return (
      <div className="flex flex-col items-center justify-center p-10 rounded-lg border border-dashed border-border bg-card/50 text-center space-y-3 font-sans">
        <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Target className="size-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground">ATS Keyword Analysis</h3>
          <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
            Match your resume keywords against industry expectations for <span className="font-semibold text-foreground">{targetRole}</span> with semantic similarity detection.
          </p>
        </div>
        <Button
          size="sm"
          onClick={handleRunAtsMatch}
          disabled={isPending}
          className="gap-2 text-xs h-9 font-semibold px-4 mt-2"
        >
          {isPending ? (
            <>
              <Spinner />
              <span>Analyzing keywords...</span>
            </>
          ) : (
            <>
              <Sparkles className="size-4" />
              <span>Run ATS Keyword Match</span>
            </>
          )}
        </Button>
      </div>
    );
  }

  const catSkills = atsMatch.categorizedSkills || {};

  const allSkillsList: { category: string; item: AtsSkillItem }[] = [];
  (Object.keys(CATEGORY_LABELS) as CategoryKey[]).forEach((cat) => {
    if (cat === "all") return;
    const items = catSkills[cat] || [];
    items.forEach((item) => {
      allSkillsList.push({ category: CATEGORY_LABELS[cat], item });
    });
  });

  const getFilteredSkills = () => {
    if (activeCategory === "all") return allSkillsList;
    const items = catSkills[activeCategory] || [];
    return items.map((item) => ({
      category: CATEGORY_LABELS[activeCategory],
      item,
    }));
  };

  const filteredSkills = getFilteredSkills();
  const matchedCount = allSkillsList.filter((s) => s.item.matched).length;
  const totalCount = allSkillsList.length;

  return (
    <div className="space-y-6 font-sans">
      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Target className="size-4 text-primary" />
              <h2 className="text-sm font-bold tracking-tight text-foreground">
                ATS Keyword Coverage
              </h2>
            </div>
            <p className="text-xs text-muted-foreground">
              Semantic similarity matching against target role <span className="font-semibold text-foreground">{targetRole}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRunAtsMatch}
              disabled={isPending}
              className="gap-1.5 text-xs h-8"
            >
              {isPending ? (
                <>
                  <Spinner />
                  <span>Analyzing keywords...</span>
                </>
              ) : (
                <>
                  <RotateCcw className="size-3.5" />
                  <span>Re-run ATS Match</span>
                </>
              )}
            </Button>

            <div className="flex size-14 shrink-0 flex-col items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary font-bold">
              <span className="text-xl leading-none">{atsMatch.coveragePercentage}%</span>
              <span className="text-[10px] font-medium text-muted-foreground mt-0.5">MATCH</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>
              {matchedCount} of {totalCount} keywords matched
            </span>
            <span>{atsMatch.coveragePercentage}% coverage</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                atsMatch.coveragePercentage >= 75
                  ? "bg-emerald-500"
                  : atsMatch.coveragePercentage >= 50
                  ? "bg-amber-500"
                  : "bg-destructive"
              }`}
              style={{ width: `${atsMatch.coveragePercentage}%` }}
            />
          </div>
        </div>

        {atsMatch.summary && (
          <p className="text-xs text-muted-foreground leading-relaxed pt-1 border-t border-border/50">
            {atsMatch.summary}
          </p>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap min-w-full pb-1">
          {(Object.keys(CATEGORY_LABELS) as CategoryKey[]).map((catKey) => {
            const count =
              catKey === "all"
                ? allSkillsList.length
                : (catSkills[catKey] || []).length;

            if (catKey !== "all" && count === 0) return null;

            return (
              <button
                key={catKey}
                type="button"
                onClick={() => setActiveCategory(catKey)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border ${
                  activeCategory === catKey
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-card text-muted-foreground border-border hover:bg-accent hover:text-foreground"
                }`}
              >
                {CATEGORY_LABELS[catKey]} ({count})
              </button>
            );
          })}
        </div>

        <div className="rounded-lg border border-border bg-card p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {CATEGORY_LABELS[activeCategory]}
            </span>
            <span className="text-[11px] text-muted-foreground">
              Click missing keywords for role importance explanation
            </span>
          </div>

          {filteredSkills.length === 0 ? (
            <p className="text-xs text-muted-foreground italic py-2">
              No keywords detected in this category.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {filteredSkills.map(({ category, item }, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    if (!item.matched && item.importanceReason) {
                      setSelectedMissingSkill(item);
                    }
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                    item.matched
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                      : item.importanceReason
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300 cursor-pointer hover:bg-amber-500/20"
                      : "bg-destructive/10 border-destructive/20 text-destructive"
                  }`}
                >
                  {item.matched ? (
                    <CheckCircle2 className="size-3.5 shrink-0 text-emerald-500" />
                  ) : (
                    <AlertCircle className="size-3.5 shrink-0 text-amber-500" />
                  )}
                  <span>{item.name}</span>
                  {activeCategory === "all" && (
                    <span className="text-[10px] opacity-60">· {category}</span>
                  )}
                  {!item.matched && item.importanceReason && (
                    <Info className="size-3 shrink-0 ml-0.5 opacity-70" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedMissingSkill && (
        <Dialog open={!!selectedMissingSkill} onOpenChange={() => setSelectedMissingSkill(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-sm font-bold flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <AlertCircle className="size-4" />
                <span>Missing Keyword: {selectedMissingSkill.name}</span>
              </DialogTitle>
              <DialogDescription className="text-xs">
                Why this skill matters for your target role as <span className="font-semibold text-foreground">{targetRole}</span>
              </DialogDescription>
            </DialogHeader>

            <div className="p-3.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-xs text-foreground leading-relaxed font-sans">
              {selectedMissingSkill.importanceReason}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
