import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Copy,
  Check,
  Ellipsis,
  Trash2,
  Plus,
  FileText,
  Briefcase,
  Layers,
  Calendar,
  CheckCircle2,
  Sparkles,
  RotateCcw,
  AlertCircle,
  Target,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";

import { useResume, useResumeAnalysis, useAnalyzeResume } from "@/features/resumes/hooks/useResumes";
import { getResumeId } from "@/features/resumes/types/resume.types";
import { DeleteResumeDialog } from "@/features/resumes/components/DeleteResumeDialog";
import { ScoreOverviewCard } from "@/features/resumes/components/analysis/ScoreOverviewCard";
import { AiAnalysisCard } from "@/features/resumes/components/analysis/AiAnalysisCard";
import { AiFeedbackDetails } from "@/features/resumes/components/analysis/AiFeedbackDetails";
import { DeterministicIssuesCard } from "@/features/resumes/components/analysis/DeterministicIssuesCard";
import { AnalysisLoadingSkeleton } from "@/features/resumes/components/analysis/AnalysisLoadingSkeleton";
import { RecruiterPerspectiveCard } from "@/features/resumes/components/analysis/RecruiterPerspectiveCard";
import { AtsFormattingCard } from "@/features/resumes/components/analysis/AtsFormattingCard";
import { GrammarWritingCard } from "@/features/resumes/components/analysis/GrammarWritingCard";
import { AchievementImpactCard } from "@/features/resumes/components/analysis/AchievementImpactCard";
import { ExperienceAnalysisCard } from "@/features/resumes/components/analysis/ExperienceAnalysisCard";
import { ProjectAnalysisCard } from "@/features/resumes/components/analysis/ProjectAnalysisCard";
import { AtsKeywordMatcher } from "@/features/ats/components/AtsKeywordMatcher";
import { BulletImprover } from "@/features/bullets/components/BulletImprover";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { FullPageLoader } from "@/components/ui/loader";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ResumeDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: resumeData, isLoading: isResumeLoading, isError: isResumeError } = useResume(id || "");
  const resume = resumeData?.resume;

  const { data: analysisData } = useResumeAnalysis(id || "");
  const analysis = analysisData?.analysis;

  const analyzeMutation = useAnalyzeResume();

  const [isCopied, setIsCopied] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<"analysis" | "ats" | "bullets" | "text">("analysis");

  const handleCopyText = async () => {
    if (!resume?.extractedText) return;
    try {
      await navigator.clipboard.writeText(resume.extractedText);
      setIsCopied(true);
      toast.success("Extracted PDF text copied to clipboard!");
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast.error("Failed to copy text");
    }
  };

  const isAnalyzing = analyzeMutation.isPending || analysis?.status === "processing" || analysis?.status === "pending";

  const handleAnalyze = async () => {
    if (!id || isAnalyzing) return;
    try {
      await analyzeMutation.mutateAsync(id);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Resume analysis failed");
    }
  };

  if (isResumeLoading) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-5xl">
        <FullPageLoader subtitle="Loading resume workspace..." />
      </div>
    );
  }

  if (isResumeError || !resume) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-5xl text-center space-y-3">
        <h1 className="text-lg font-semibold text-foreground">Resume not found</h1>
        <p className="text-xs text-muted-foreground">
          The resume you are looking for does not exist or has been deleted.
        </p>
        <Button size="sm" variant="outline" onClick={() => navigate("/dashboard")} className="gap-2 text-xs">
          <ArrowLeft className="size-3.5" />
          <span>Return to Dashboard</span>
        </Button>
      </div>
    );
  }

  const resumeIdStr = getResumeId(resume);
  const pageText = resume.pageCount
    ? `${resume.pageCount} ${resume.pageCount === 1 ? "page" : "pages"}`
    : "1 page";

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/dashboard")}
          className="gap-1.5 text-xs text-muted-foreground hover:text-foreground p-0 h-auto shrink-0 self-start sm:self-auto"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to Dashboard</span>
        </Button>

        <div className="flex items-center gap-2 flex-wrap">
          {!analysis && !isAnalyzing && (
            <Button
              size="sm"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="gap-1.5 text-xs h-8 font-semibold bg-primary text-primary-foreground shadow-xs shrink-0"
            >
              <Sparkles className="size-3.5" />
              <span>Analyze Resume</span>
            </Button>
          )}

          {isAnalyzing && (
            <Button
              size="sm"
              disabled
              className="gap-1.5 text-xs h-8 font-semibold bg-primary/70 text-primary-foreground shrink-0"
            >
              <Spinner />
              <span>Analyzing resume...</span>
            </Button>
          )}

          {analysis && !isAnalyzing && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="gap-1.5 text-xs h-7 text-muted-foreground hover:text-foreground shrink-0"
            >
              <RotateCcw className="size-3.5" />
              <span>Re-analyze</span>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/resumes/new")}
            className="gap-1.5 text-xs h-7 shrink-0"
          >
            <Plus className="size-3.5" />
            <span>Upload new</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger
              className="flex size-7 items-center justify-center rounded-md border border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground transition-colors shrink-0"
              aria-label="More actions"
            >
              <Ellipsis className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-38">
              <DropdownMenuItem destructive onClick={() => setShowDeleteDialog(true)}>
                <Trash2 className="size-3.5" />
                <span>Delete resume</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {isAnalyzing && (
        <div className="flex items-center justify-between gap-3 p-3.5 rounded-lg border border-primary/30 bg-primary/10 text-xs font-medium text-foreground animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Spinner />
            <span>Analyzing resume in background... Diagnostic metrics will update automatically.</span>
          </div>
          <Badge variant="outline" className="text-[10px] uppercase font-bold border-primary/40 text-primary shrink-0">
            Processing
          </Badge>
        </div>
      )}

      <div className="space-y-3 border-b border-border pb-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-primary border border-border">
              <FileText className="size-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground truncate max-w-[240px] sm:max-w-md">
              {resume.originalName}
            </h1>
          </div>

          <Badge variant="success" className="text-xs font-medium px-2.5 py-0.5 flex items-center gap-1 shrink-0">
            <CheckCircle2 className="size-3.5" />
            <span>{resume.status || "Parsed"}</span>
          </Badge>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap pt-1">
          <div className="flex items-center gap-1.5 text-foreground font-medium">
            <Briefcase className="size-3.5 text-muted-foreground shrink-0" />
            <span className="truncate">{resume.targetRole}</span>
          </div>
          <span>·</span>
          <div className="flex items-center gap-1.5">
            <Layers className="size-3.5 text-muted-foreground shrink-0" />
            <span>{pageText}</span>
          </div>
          <span>·</span>
          <div className="flex items-center gap-1.5">
            <Calendar className="size-3.5 text-muted-foreground shrink-0" />
            <span>
              Uploaded{" "}
              {new Date(resume.createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-border pb-px overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap min-w-full">
        <button
          type="button"
          onClick={() => setActiveTab("analysis")}
          className={`shrink-0 flex items-center gap-2 px-3 py-2 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "analysis"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sparkles className="size-3.5 shrink-0" />
          <span>Analysis & Diagnostics</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("ats")}
          className={`shrink-0 flex items-center gap-2 px-3 py-2 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "ats"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Target className="size-3.5 shrink-0" />
          <span>ATS Keyword Matcher</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("bullets")}
          className={`shrink-0 flex items-center gap-2 px-3 py-2 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "bullets"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Wand2 className="size-3.5 shrink-0" />
          <span>Bullet Improver</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("text")}
          className={`shrink-0 flex items-center gap-2 px-3 py-2 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "text"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileText className="size-3.5 shrink-0" />
          <span>Extracted PDF Text</span>
        </button>
      </div>

      {activeTab === "analysis" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
          {isAnalyzing && !analysis ? (
            <AnalysisLoadingSkeleton />
          ) : analysis && analysis.status === "completed" ? (
            <>
              <ScoreOverviewCard scores={analysis.scores} />

              {analysis.recruiterPerspective && (
                <RecruiterPerspectiveCard recruiter={analysis.recruiterPerspective} />
              )}

              {analysis.atsFormatting && (
                <AtsFormattingCard formatting={analysis.atsFormatting} />
              )}

              {analysis.grammarWriting && (
                <GrammarWritingCard grammar={analysis.grammarWriting} />
              )}

              {analysis.achievementImpact && (
                <AchievementImpactCard achievement={analysis.achievementImpact} />
              )}

              {analysis.experienceAnalysis && (
                <ExperienceAnalysisCard experience={analysis.experienceAnalysis} />
              )}

              {analysis.projectAnalysis && (
                <ProjectAnalysisCard project={analysis.projectAnalysis} />
              )}

              {analysis.aiAnalysis && <AiAnalysisCard ai={analysis.aiAnalysis} />}
              {analysis.aiAnalysis && <AiFeedbackDetails ai={analysis.aiAnalysis} />}
              <DeterministicIssuesCard issues={analysis.issues || []} />
            </>
          ) : analysis && analysis.status === "failed" ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center space-y-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive mx-auto">
                <AlertCircle className="size-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-foreground">Analysis Failed</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  {analysis.errorMessage || "Something went wrong while evaluating your resume."}
                </p>
              </div>
              <Button size="sm" onClick={handleAnalyze} className="gap-2 text-xs h-8">
                <RotateCcw className="size-3.5" />
                <span>Retry Analysis</span>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-10 rounded-lg border border-dashed border-border bg-card/50 text-center space-y-3">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Sparkles className="size-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-foreground">No analysis generated yet</h3>
                <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
                  Run comprehensive diagnostic checks and evaluation to analyze your resume against target role requirements.
                </p>
              </div>
              <Button
                size="sm"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="gap-2 text-xs h-9 font-semibold px-4 mt-2"
              >
                <Sparkles className="size-4" />
                <span>Analyze Resume</span>
              </Button>
            </div>
          )}
        </div>
      )}

      {activeTab === "ats" && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
          <AtsKeywordMatcher
            resumeId={resumeIdStr}
            targetRole={resume.targetRole}
            jobDescription={resume.jobDescription}
          />
        </div>
      )}

      {activeTab === "bullets" && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
          <BulletImprover
            resumeId={resumeIdStr}
            targetRole={resume.targetRole}
            extractedText={resume.extractedText}
          />
        </div>
      )}

      {activeTab === "text" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
          {resume.jobDescription && (
            <div className="rounded-lg border border-border bg-card p-4 space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Target Role Job Description
              </h3>
              <p className="text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed font-sans">
                {resume.jobDescription}
              </p>
            </div>
          )}

          <div className="rounded-lg border border-border bg-card p-4 space-y-3 font-sans">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Parsed PDF Content
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyText}
                className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
              >
                {isCopied ? (
                  <>
                    <Check className="size-3.5 text-emerald-600" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5" />
                    <span>Copy Text</span>
                  </>
                )}
              </Button>
            </div>

            <div className="max-h-[500px] overflow-y-auto p-3 bg-muted/30 rounded font-mono text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap">
              {resume.extractedText || "No text extracted."}
            </div>
          </div>
        </div>
      )}

      {showDeleteDialog && (
        <DeleteResumeDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          resume={{ id: resumeIdStr, originalName: resume.originalName }}
          onSuccess={() => navigate("/dashboard")}
        />
      )}
    </div>
  );
};

export default ResumeDetails;
