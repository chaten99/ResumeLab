import React from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageTransition } from "@/components/layout/PageTransition";
import { useCurrentUser } from "@/features/auth/hooks/useAuth";
import { useBillingHistory, useCurrentSubscription } from "@/features/subscription/hooks/useSubscription";

export const Billing: React.FC = () => {
  const navigate = useNavigate();
  const { data: userResponse } = useCurrentUser();
  const { data: subResponse } = useCurrentSubscription();
  const { data: billingData, isLoading } = useBillingHistory();

  const user = userResponse?.user;
  const subscription = subResponse?.subscription;
  const transactions = billingData?.transactions || [];

  const plan = subscription?.plan || user?.plan || "FREE";
  const status = subscription?.subscriptionStatus || "none";
  const renewalDate = subscription?.subscriptionEnd
    ? new Date(subscription.subscriptionEnd).toLocaleDateString()
    : "N/A";

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6 font-sans">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <PageTransition className="container mx-auto px-4 py-8 max-w-4xl space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <CreditCard className="size-6 text-primary" /> Billing &amp; Subscriptions
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage your active subscription plan, payment methods, and invoice transaction history.
          </p>
        </div>
        <Button size="sm" onClick={() => navigate("/subscription")} className="text-xs font-semibold h-9 gap-1.5 shadow-xs">
          <Sparkles className="size-4" /> Change Plan
        </Button>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-foreground">Current Plan:</span>
              <Badge variant="outline" className="text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
                {plan}
              </Badge>
              {status === "active" && (
                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[9px] uppercase font-bold">
                  Active
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {plan === "FREE" ? "Free tier with 10 initial credits" : `Subscription renewal date: ${renewalDate}`}
            </p>
          </div>

          {plan === "FREE" && (
            <Button size="sm" onClick={() => navigate("/subscription")} className="text-xs font-semibold h-8 gap-1">
              Upgrade to Pro <ArrowRight className="size-3.5" />
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-bold text-foreground">Transaction History</h2>

        <div className="rounded-xl border bg-card shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b text-muted-foreground font-semibold">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Plan</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Provider</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      No payment transactions found.
                    </td>
                  </tr>
                ) : (
                  transactions.map((t: any) => (
                    <tr key={t._id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 text-muted-foreground">{new Date(t.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4 font-bold">{t.plan}</td>
                      <td className="py-3 px-4 font-extrabold text-foreground">₹{t.amount}</td>
                      <td className="py-3 px-4 capitalize text-muted-foreground">{t.paymentProvider}</td>
                      <td className="py-3 px-4">
                        <Badge className="text-[9px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold uppercase">
                          {t.status}
                        </Badge>
                      </td>
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

export default Billing;
