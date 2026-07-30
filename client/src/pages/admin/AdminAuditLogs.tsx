import React from "react";
import { ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageTransition } from "@/components/layout/PageTransition";
import { useAdminAuditLogs } from "@/features/admin/hooks/useAdmin";

export const AdminAuditLogs: React.FC = () => {
  const { data: logsData, isLoading } = useAdminAuditLogs();
  const logs = logsData?.logs || [];

  return (
    <PageTransition className="p-6 space-y-6 font-sans max-w-7xl mx-auto">
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <ShieldAlert className="size-6 text-primary" /> Admin Security Audit Trail
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Complete, unalterable log of every administrative state change, credit modification, and user status toggle.
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
                  <th className="py-3 px-4">Admin</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Target User</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      No admin audit logs recorded.
                    </td>
                  </tr>
                ) : (
                  logs.map((log: any) => (
                    <tr key={log._id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-bold text-foreground">{log.adminId?.name || "Super Admin"}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="text-[10px] font-bold uppercase">{log.action}</Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{log.targetEmail || "N/A"}</td>
                      <td className="py-3 px-4 text-muted-foreground font-mono text-[11px]">{log.ip || "127.0.0.1"}</td>
                      <td className="py-3 px-4 text-muted-foreground">{new Date(log.createdAt).toLocaleString()}</td>
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

export default AdminAuditLogs;
