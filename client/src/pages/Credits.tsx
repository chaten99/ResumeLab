import React from "react";
import { useNavigate } from "react-router-dom";
import { Zap, Sparkles, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageTransition } from "@/components/layout/PageTransition";
import { useUserCredits } from "@/features/user/hooks/useUser";

export const Credits: React.FC = () => {
  const navigate = useNavigate();
  const { data: creditsData, isLoading } = useUserCredits();

  const currentCredits = creditsData?.credits ?? 10;
  const lifetimeEarned = creditsData?.lifetimeEarned ?? 10;
  const lifetimeUsed = creditsData?.lifetimeUsed ?? 0;
  const history = creditsData?.history || [];

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6 font-sans">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <PageTransition className="container mx-auto px-4 py-8 max-w-4xl space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Zap className="size-6 text-amber-500 fill-amber-500" /> AI Credits &amp; Usage Ledger
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time audit log of your available credits, AI diagnostics consumption, and refills.
          </p>
        </div>
        <Button size="sm" onClick={() => navigate("/subscription")} className="text-xs font-semibold h-9 gap-1.5 shadow-xs">
          <Sparkles className="size-4" /> Get More Credits
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border bg-card p-5 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Available Credits</span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-foreground">{currentCredits}</span>
            <Zap className="size-5 text-amber-500 fill-amber-500" />
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Lifetime Earned</span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-foreground">{lifetimeEarned}</span>
            <TrendingUp className="size-5 text-emerald-500" />
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Lifetime Consumed</span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-foreground">{lifetimeUsed}</span>
            <TrendingDown className="size-5 text-rose-500" />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-bold text-foreground">Credit History Ledger</h2>

        <div className="rounded-xl border bg-card shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b text-muted-foreground font-semibold">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Credits</th>
                  <th className="py-3 px-4">Balance After</th>
                  <th className="py-3 px-4">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      No credit history recorded yet.
                    </td>
                  </tr>
                ) : (
                  history.map((h: any) => (
                    <tr key={h._id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 text-muted-foreground">{new Date(h.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4 font-bold text-foreground">{h.action}</td>
                      <td className="py-3 px-4 font-extrabold">
                        <span className={h.amount > 0 ? "text-emerald-600" : "text-rose-500"}>
                          {h.amount > 0 ? `+${h.amount}` : h.amount}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-foreground">{h.balanceAfter}</td>
                      <td className="py-3 px-4 text-muted-foreground">{h.reason}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Credits;
