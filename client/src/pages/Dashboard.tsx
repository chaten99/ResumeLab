import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Upload,
  Sparkles,
  History,
  CreditCard,
  Zap,
  CheckCircle2,
  Clock,
  ArrowRight,
  BarChart3,
  Activity,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageTransition } from "@/components/layout/PageTransition";
import { useCurrentUser } from "@/features/auth/hooks/useAuth";
import { useResumes } from "@/features/resumes/hooks/useResumes";
import { useUserActivities } from "@/features/user/hooks/useUser";

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data: userResponse, isLoading: isUserLoading } = useCurrentUser();
  const { data: resumesResponse, isLoading: isResumesLoading } = useResumes();
  const { data: activityData, isLoading: isActivityLoading } =
    useUserActivities();

  const user = userResponse?.user;
  const resumes = resumesResponse?.resumes || [];
  const activities = activityData?.activities || [];

  if (isUserLoading || isResumesLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6 font-sans">
        <Skeleton className="h-44 w-full rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
      </div>
    );
  }

  const hour = new Date().getHours();
  let greeting = "Good morning";
  if (hour >= 12 && hour < 17) greeting = "Good afternoon";
  else if (hour >= 17) greeting = "Good evening";

  const credits = user?.credits ?? 10;
  const plan = user?.plan || "FREE";
  const status = user?.subscriptionStatus || "none";
  const completedAnalysesCount = resumes.filter(
    (r: any) => r.status === "completed",
  ).length;

  return (
    <PageTransition className="container mx-auto px-4 py-8 max-w-6xl space-y-8 font-sans">
      <div className="rounded-2xl border bg-card p-6 lg:p-8 shadow-xs relative overflow-hidden space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                {greeting}
              </span>
              <Badge
                variant="outline"
                className="text-[10px] uppercase font-bold px-2 py-0.5 tracking-wider"
              >
                {plan} Plan
              </Badge>
              {status === "active" && (
                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[9px] font-bold uppercase">
                  Active
                </Badge>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              Welcome back, {user?.name}
            </h1>

            <p className="text-xs text-muted-foreground max-w-xl">
              Optimize your resume for applicant tracking systems (ATS),
              generate metric-driven bullet points, and land interviews.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-muted/40 border border-border p-4 rounded-xl shrink-0">
            <div className="size-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
              <Zap className="size-5 fill-amber-500" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-muted-foreground block">
                Available AI Credits
              </span>
              <span className="text-2xl font-extrabold text-foreground">
                {credits}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="pt-4 border-t border-border flex flex-wrap items-center gap-2 text-xs">
          <Button
            size="sm"
            onClick={() => navigate("/resumes/new")}
            className="h-9 font-semibold text-xs gap-1.5 shadow-xs"
          >
            <Upload className="size-4" /> Upload Resume
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate("/analyze")}
            className="h-9 font-semibold text-xs gap-1.5"
          >
            <Sparkles className="size-4 text-primary" /> Analyze Resume
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate("/resumes/history")}
            className="h-9 font-semibold text-xs gap-1.5"
          >
            <History className="size-4" /> Resume History
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate("/billing")}
            className="h-9 font-semibold text-xs gap-1.5"
          >
            <CreditCard className="size-4" /> Billing &amp; Invoices
          </Button>

          {plan === "FREE" && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => navigate("/subscription")}
              className="h-9 font-semibold text-xs gap-1.5 ml-auto text-primary"
            >
              Upgrade to Pro <ArrowRight className="size-3.5" />
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border bg-card p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Uploaded Resumes
            </span>
            <FileText className="size-4 text-primary" />
          </div>
          <p className="text-3xl font-extrabold text-foreground">
            {resumes.length}
          </p>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Completed Analyses
            </span>
            <BarChart3 className="size-4 text-emerald-500" />
          </div>
          <p className="text-3xl font-extrabold text-foreground">
            {completedAnalysesCount}
          </p>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Credits Remaining
            </span>
            <Zap className="size-4 text-amber-500 fill-amber-500" />
          </div>
          <p className="text-3xl font-extrabold text-foreground">{credits}</p>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Active Plan
            </span>
            <CheckCircle2 className="size-4 text-primary" />
          </div>
          <p className="text-2xl font-extrabold text-foreground uppercase">
            {plan}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border bg-card p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <FileText className="size-4 text-primary" /> Your Resumes
            </h2>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => navigate("/resumes/new")}
              className="text-xs h-8 gap-1"
            >
              <Plus className="size-3.5" /> Upload New
            </Button>
          </div>

          {resumes.length === 0 ? (
            <div className="p-8 text-center border rounded-lg border-dashed bg-muted/30 space-y-3">
              <FileText className="size-10 text-muted-foreground/40 mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-foreground">
                  No Resumes Uploaded
                </p>
                <p className="text-xs text-muted-foreground">
                  Upload your PDF resume to start AI diagnostics and ATS
                  scoring.
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => navigate("/resumes/new")}
                className="text-xs font-semibold h-8 gap-1.5"
              >
                <Upload className="size-3.5" /> Upload First Resume
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {resumes.slice(0, 5).map((r: any) => (
                <div
                  key={r._id}
                  className="py-3 flex items-center justify-between gap-4 hover:bg-muted/30 px-2 rounded-lg transition-colors"
                >
                  <div className="space-y-0.5 min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">
                      {r.originalName}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {r.targetRole || "General Tech Role"}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Badge
                      variant="outline"
                      className="text-[10px] capitalize font-semibold"
                    >
                      {r.status}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => navigate(`/resumes/${r._id}`)}
                      className="text-xs h-7 gap-1"
                    >
                      View <ArrowRight className="size-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Activity className="size-4 text-primary" /> Recent Activity
          </h2>

          {isActivityLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : activities.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">
              No recent account activity logged.
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              {activities.slice(0, 6).map((act: any) => (
                <div
                  key={act._id}
                  className="p-2.5 rounded-lg bg-muted/40 border border-border/60 space-y-1"
                >
                  <p className="font-semibold text-foreground text-[11px] leading-snug">
                    {act.description}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span className="capitalize">
                      {act.type.replace(/_/g, " ")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="size-2.5" />
                      {new Date(act.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default Dashboard;
