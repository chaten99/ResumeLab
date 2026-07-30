import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Search, CheckCircle2, Eye, UserX, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageTransition } from "@/components/layout/PageTransition";
import {
  useAdminUsers,
  useDisableUser,
  useEnableUser,
  useVerifyUserEmail,
} from "@/features/admin/hooks/useAdmin";

export const AdminUsers: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [verifiedFilter, setVerifiedFilter] = useState("");
  const [page, setPage] = useState(1);

  const { data: usersData, isLoading } = useAdminUsers({
    search,
    plan: planFilter,
    status: statusFilter,
    verified: verifiedFilter,
    page,
    limit: 10,
  });

  const disableMutation = useDisableUser();
  const enableMutation = useEnableUser();
  const verifyEmailMutation = useVerifyUserEmail();

  const handleDisable = async (userId: string) => {
    try {
      await disableMutation.mutateAsync(userId);
      toast.success("User account disabled");
    } catch {
      toast.error("Failed to disable user");
    }
  };

  const handleEnable = async (userId: string) => {
    try {
      await enableMutation.mutateAsync(userId);
      toast.success("User account enabled");
    } catch {
      toast.error("Failed to enable user");
    }
  };

  const handleVerifyEmail = async (userId: string) => {
    try {
      await verifyEmailMutation.mutateAsync(userId);
      toast.success("User email force verified");
    } catch {
      toast.error("Failed to verify email");
    }
  };

  const users = usersData?.users || [];
  const pagination = usersData?.pagination || {};

  return (
    <PageTransition className="p-6 space-y-6 font-sans max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="size-6 text-primary" /> User Management
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Search, filter, manage account status, modify credits, and inspect subscription details.
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-4 space-y-4 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="relative">
            <Search className="size-4 absolute left-3 top-2.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Name, Email, or ID..."
              className="pl-9 text-xs h-9"
            />
          </div>

          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="h-9 px-3 rounded-md border border-input bg-background text-xs font-medium text-foreground outline-none"
          >
            <option value="">All Plans (FREE, PRO, PREMIUM)</option>
            <option value="FREE">FREE</option>
            <option value="PRO">PRO</option>
            <option value="PREMIUM">PREMIUM</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 rounded-md border border-input bg-background text-xs font-medium text-foreground outline-none"
          >
            <option value="">All Statuses (Active &amp; Disabled)</option>
            <option value="active">Active Accounts</option>
            <option value="disabled">Disabled Accounts</option>
          </select>

          <select
            value={verifiedFilter}
            onChange={(e) => setVerifiedFilter(e.target.value)}
            className="h-9 px-3 rounded-md border border-input bg-background text-xs font-medium text-foreground outline-none"
          >
            <option value="">All Verification States</option>
            <option value="true">Verified Email</option>
            <option value="false">Unverified Email</option>
          </select>
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            <Skeleton className="h-10 w-full" />
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
                  <th className="py-3 px-4">Credits</th>
                  <th className="py-3 px-4">Email Status</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      No users found in database.
                    </td>
                  </tr>
                ) : (
                  users.map((u: any) => (
                    <tr key={u._id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center border border-primary/20 shrink-0">
                            {u.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-foreground">{u.name}</p>
                            <p className="text-[11px] text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="text-[10px] uppercase font-bold">
                          {u.plan}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 font-bold text-foreground">
                        {u.credits}
                      </td>
                      <td className="py-3 px-4">
                        {u.isEmailVerified ? (
                          <Badge className="text-[9px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[9px] text-amber-500 border-amber-500/20">
                            Unverified
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {u.isDisabled ? (
                          <Badge variant="destructive" className="text-[9px]">
                            Disabled
                          </Badge>
                        ) : (
                          <Badge className="text-[9px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                            Active
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/dashboard/users/${u._id}`)}
                            className="h-7 text-xs px-2 gap-1"
                            title="View Details"
                          >
                            <Eye className="size-3.5 text-muted-foreground" />
                            <span className="hidden sm:inline">Details</span>
                          </Button>

                          {!u.isEmailVerified && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleVerifyEmail(u._id)}
                              className="h-7 text-xs px-2 text-emerald-600 hover:bg-emerald-500/10"
                              title="Force Verify Email"
                            >
                              <CheckCircle2 className="size-3.5" />
                            </Button>
                          )}

                          {u.isDisabled ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEnable(u._id)}
                              className="h-7 text-xs px-2 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10 gap-1"
                            >
                              <UserCheck className="size-3.5" />
                              <span>Enable</span>
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDisable(u._id)}
                              className="h-7 text-xs px-2 text-destructive hover:bg-destructive/10 gap-1"
                            >
                              <UserX className="size-3.5" />
                              <span>Disable</span>
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {pagination.pages > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <span>Page {pagination.page} of {pagination.pages}</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="text-xs h-8"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pagination.pages}
                onClick={() => setPage((p) => p + 1)}
                className="text-xs h-8"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default AdminUsers;
