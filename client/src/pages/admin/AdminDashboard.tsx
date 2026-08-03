import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  CreditCard,
  Zap,
  TrendingUp,
  UserCheck,
  Activity,
  ArrowRight,
  ShieldCheck,
  Server,
  Database,
  Cpu,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageTransition } from "@/components/layout/PageTransition";
import { useAdminOverview } from "@/features/admin/hooks/useAdmin";

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data: overviewData, isLoading } = useAdminOverview();

  const stats = overviewData?.stats || {};
  const recentRegistrations = overviewData?.recentRegistrations || [];
  const recentPayments = overviewData?.recentPayments || [];

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto font-sans">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
      </div>
    );
  }

  const healthServices = [
    { name: "MongoDB Cluster", status: "Operational", icon: Database, color: "text-emerald-500" },
    { name: "Redis Cache", status: "Operational", icon: Server, color: "text-emerald-500" },
    { name: "Stripe Payment Gateway", status: "Operational", icon: CreditCard, color: "text-emerald-500" },
    { name: "Resend Email Dispatch", status: "Operational", icon: Mail, color: "text-emerald-500" },
    { name: "Google Gemini 2.5 AI Engine", status: "Operational", icon: Cpu, color: "text-emerald-500" },
  ];

  return (
    <PageTransition className="p-6 space-y-6 font-sans max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShieldCheck className="size-6 text-primary" /> Admin Control Center
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time telemetry, user management, credit flows, revenue tracking, and system status.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => navigate("/dashboard/users")} className="text-xs h-9 gap-1.5 font-semibold">
            <Users className="size-4" /> Manage Users
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border bg-card p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Users</span>
            <Users className="size-4 text-primary" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-foreground">{stats.totalUsers || 0}</span>
            <Badge variant="outline" className="text-[10px] border-emerald-500/20 text-emerald-600 bg-emerald-500/10 font-bold">
              {stats.verifiedUsers || 0} Verified
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground">{stats.unverifiedUsers || 0} pending email verification</p>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Subscriptions</span>
            <UserCheck className="size-4 text-primary" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-foreground">{stats.activeSubscriptions || 0}</span>
            <div className="flex items-center gap-1">
              <Badge variant="outline" className="text-[10px] font-bold">{stats.proUsers || 0} Pro</Badge>
              <Badge className="text-[10px] font-bold bg-primary text-primary-foreground">{stats.premiumUsers || 0} Premium</Badge>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground">{stats.freeUsers || 0} accounts on Free plan</p>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Revenue</span>
            <TrendingUp className="size-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-foreground">₹{stats.totalRevenue || 0}</span>
            <Badge className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold">
              Stripe Verified
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground">Direct webhook confirmed transactions</p>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Credits Telemetry</span>
            <Zap className="size-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-foreground">{stats.creditsConsumed || 0}</span>
            <Badge variant="outline" className="text-[10px] text-amber-500 border-amber-500/20 font-bold">
              Consumed
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground">{stats.creditsIssued || 0} total credits issued</p>
        </div>
      </div>

      {/* System Health Status Widget (PART 21) */}
      <div className="rounded-xl border bg-card p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Activity className="size-4 text-emerald-500" /> System Health &amp; Infrastructure
          </h2>
          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-bold">
            All Systems Operational
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {healthServices.map((srv) => {
            const Icon = srv.icon;
            return (
              <div key={srv.name} className="rounded-lg border bg-muted/40 p-3 flex flex-col justify-between space-y-2">
                <div className="flex items-center justify-between">
                  <Icon className="size-4 text-primary" />
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground truncate">{srv.name}</p>
                  <span className={`text-[10px] font-semibold ${srv.color}`}>{srv.status}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: Recent Registrations & Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Registrations */}
        <div className="rounded-xl border bg-card p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Users className="size-4 text-primary" /> Recent User Registrations
            </h2>
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/users")} className="text-xs h-7 gap-1">
              View All <ArrowRight className="size-3" />
            </Button>
          </div>

          <div className="divide-y divide-border/60">
            {recentRegistrations.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">No registrations recorded.</p>
            ) : (
              recentRegistrations.map((u: any) => (
                <div key={u._id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                      {u.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">{u.name}</p>
                      <p className="text-[11px] text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[9px] uppercase font-bold">
                      {u.plan}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="rounded-xl border bg-card p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <CreditCard className="size-4 text-emerald-500" /> Recent Transactions
            </h2>
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/transactions")} className="text-xs h-7 gap-1">
              View All <ArrowRight className="size-3" />
            </Button>
          </div>

          <div className="divide-y divide-border/60">
            {recentPayments.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">No payment transactions recorded.</p>
            ) : (
              recentPayments.map((t: any) => (
                <div key={t._id} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-foreground">{t.userId?.name || "User"}</p>
                    <p className="text-[11px] text-muted-foreground">{t.userId?.email || "N/A"}</p>
                  </div>
                  <div className="text-right space-y-0.5">
                    <p className="text-xs font-extrabold text-foreground">₹{t.amount}</p>
                    <Badge className="text-[9px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold uppercase">
                      {t.plan}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default AdminDashboard;
