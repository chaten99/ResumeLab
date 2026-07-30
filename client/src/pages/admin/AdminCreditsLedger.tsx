import React from "react";
import { Zap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { PageTransition } from "@/components/layout/PageTransition";
import { useAdminCreditLedger } from "@/features/admin/hooks/useAdmin";

export const AdminCreditsLedger: React.FC = () => {
  const { data: ledgerData, isLoading } = useAdminCreditLedger();
  const history = ledgerData?.history || [];

  return (
    <PageTransition className="p-6 space-y-6 font-sans max-w-7xl mx-auto">
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Zap className="size-6 text-amber-500 fill-amber-500" /> Global Credit Ledger Audit
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Complete platform-wide audit log of every credit addition, AI feature deduction, refund, and admin override.
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
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Change</th>
                  <th className="py-3 px-4">Balance After</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      No credit ledger entries recorded.
                    </td>
                  </tr>
                ) : (
                  history.map((h: any) => (
                    <tr key={h._id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-bold text-foreground">{h.userId?.email || "System User"}</td>
                      <td className="py-3 px-4 font-semibold">{h.action}</td>
                      <td className="py-3 px-4">
                        <span className={`font-extrabold ${h.amount > 0 ? "text-emerald-600" : "text-rose-500"}`}>
                          {h.amount > 0 ? `+${h.amount}` : h.amount}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-foreground">{h.balanceAfter}</td>
                      <td className="py-3 px-4 text-muted-foreground">{h.reason}</td>
                      <td className="py-3 px-4 text-muted-foreground">{new Date(h.createdAt).toLocaleString()}</td>
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

export default AdminCreditsLedger;
