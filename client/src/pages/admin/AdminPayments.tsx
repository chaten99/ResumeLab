import React from "react";
import { CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageTransition } from "@/components/layout/PageTransition";
import { useAdminPayments } from "@/features/admin/hooks/useAdmin";

export const AdminPayments: React.FC = () => {
  const { data: paymentsData, isLoading } = useAdminPayments();
  const transactions = paymentsData?.transactions || [];

  return (
    <PageTransition className="p-6 space-y-6 font-sans max-w-7xl mx-auto">
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <CreditCard className="size-6 text-emerald-500" /> Transaction &amp; Revenue Audit
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Complete Stripe checkout session ledger, payment intents, and revenue fulfillment audit.
        </p>
      </div>

      <div className="rounded-xl border bg-card shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b text-muted-foreground font-semibold">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Plan</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Session ID</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      No payment transactions recorded.
                    </td>
                  </tr>
                ) : (
                  transactions.map((t: any) => (
                    <tr key={t._id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-bold text-foreground">{t.userId?.email || "Unknown User"}</td>
                      <td className="py-3 px-4">
                        <Badge className="text-[10px] font-bold uppercase">{t.plan}</Badge>
                      </td>
                      <td className="py-3 px-4 font-extrabold text-foreground">₹{t.amount}</td>
                      <td className="py-3 px-4 text-muted-foreground font-mono text-[11px]">{t.checkoutSessionId || "N/A"}</td>
                      <td className="py-3 px-4">
                        <Badge className="text-[9px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold uppercase">
                          {t.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{new Date(t.createdAt).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default AdminPayments;
