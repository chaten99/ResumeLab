import React from "react";
import { BarChart3, PieChart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageTransition } from "@/components/layout/PageTransition";
import { useAdminAnalytics } from "@/features/admin/hooks/useAdmin";

export const AdminAnalytics: React.FC = () => {
  const { data: analyticsData, isLoading } = useAdminAnalytics();
  const analytics = analyticsData?.analytics || {};
  const planDist = analytics?.planDistribution || [];

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto font-sans">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <PageTransition className="p-6 space-y-6 font-sans max-w-7xl mx-auto">
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <BarChart3 className="size-6 text-primary" /> Platform Analytics
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Detailed metrics on AI analyses, user plan distributions, and resume parsing trends.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border bg-card p-5 space-y-2 shadow-2xs">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Uploaded Resumes</span>
          <p className="text-3xl font-extrabold text-foreground">{analytics.totalResumes || 0}</p>
        </div>
        <div className="rounded-xl border bg-card p-5 space-y-2 shadow-2xs">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Completed AI Diagnostics</span>
          <p className="text-3xl font-extrabold text-foreground">{analytics.totalAnalyses || 0}</p>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-5 space-y-4 shadow-2xs">
        <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
          <PieChart className="size-4 text-primary" /> Subscription Plan Breakdown
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {planDist.map((item: any) => (
            <div key={item.plan} className="border rounded-lg p-4 bg-muted/40 flex items-center justify-between">
              <div>
                <Badge variant="outline" className="text-[10px] font-bold uppercase">{item.plan}</Badge>
                <p className="text-xs text-muted-foreground mt-1">Active Accounts</p>
              </div>
              <span className="text-2xl font-extrabold text-foreground">{item.count}</span>
            </div>
          ))}
        </div>
      </div>
    </PageTransition>
  );
};

export default AdminAnalytics;
