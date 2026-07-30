import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Zap,
  CheckCircle2,
  Lock,
  UserX,
  UserCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { PageTransition } from "@/components/layout/PageTransition";
import {
  useAdminUserDetails,
  useDisableUser,
  useEnableUser,
  useVerifyUserEmail,
  useResetUserPassword,
  useChangeUserCredits,
  useChangeUserSubscription,
} from "@/features/admin/hooks/useAdmin";

export const AdminUserDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: userData, isLoading } = useAdminUserDetails(id || "");
  const disableMutation = useDisableUser();
  const enableMutation = useEnableUser();
  const verifyEmailMutation = useVerifyUserEmail();
  const resetPasswordMutation = useResetUserPassword();
  const changeCreditsMutation = useChangeUserCredits();
  const changeSubMutation = useChangeUserSubscription();

  const [creditAmount, setCreditAmount] = useState<number>(50);
  const [creditReason, setCreditReason] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const user = userData?.user;

  if (isLoading || !user) {
    return (
      <div className="p-6 space-y-6 max-w-5xl mx-auto font-sans">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const handleDisable = async () => {
    try {
      await disableMutation.mutateAsync(user._id);
      toast.success("User account disabled");
    } catch {
      toast.error("Failed to disable account");
    }
  };

  const handleEnable = async () => {
    try {
      await enableMutation.mutateAsync(user._id);
      toast.success("User account enabled");
    } catch {
      toast.error("Failed to enable account");
    }
  };

  const handleVerifyEmail = async () => {
    try {
      await verifyEmailMutation.mutateAsync(user._id);
      toast.success("Email force verified");
    } catch {
      toast.error("Failed to verify email");
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    try {
      await resetPasswordMutation.mutateAsync({ userId: user._id, newPassword });
      toast.success("Password reset successfully");
      setNewPassword("");
    } catch {
      toast.error("Failed to reset password");
    }
  };

  const handleCreditsChange = async (mode: "increase" | "decrease" | "set") => {
    try {
      await changeCreditsMutation.mutateAsync({
        userId: user._id,
        data: { mode, amount: creditAmount, reason: creditReason || "Admin manual adjustment" },
      });
      toast.success(`Credits updated (${mode})`);
      setCreditReason("");
    } catch {
      toast.error("Failed to update credits");
    }
  };

  const handlePlanChange = async (plan: "FREE" | "PRO" | "PREMIUM") => {
    try {
      await changeSubMutation.mutateAsync({ userId: user._id, plan });
      toast.success(`Plan updated to ${plan}`);
    } catch {
      toast.error("Failed to change plan");
    }
  };

  return (
    <PageTransition className="p-6 space-y-6 font-sans max-w-5xl mx-auto">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/dashboard/users")}
        className="text-xs h-8 gap-1.5"
      >
        <ArrowLeft className="size-3.5" /> Back to Users
      </Button>

      {/* User Header Profile */}
      <div className="rounded-xl border bg-card p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="size-14 rounded-full bg-primary/10 text-primary font-black text-xl flex items-center justify-center border border-primary/20 shrink-0">
            {user.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-foreground">{user.name}</h1>
              <Badge variant="outline" className="text-[10px] uppercase font-bold px-2">
                {user.plan}
              </Badge>
              {user.isDisabled ? (
                <Badge variant="destructive" className="text-[10px]">Disabled</Badge>
              ) : (
                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">Active</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{user.email}</p>
            <p className="text-[11px] text-muted-foreground">Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {!user.isEmailVerified && (
            <Button size="sm" variant="outline" onClick={handleVerifyEmail} className="text-xs h-8 text-emerald-600 border-emerald-500/30">
              <CheckCircle2 className="size-3.5 mr-1" /> Force Verify
            </Button>
          )}

          {user.isDisabled ? (
            <Button size="sm" onClick={handleEnable} className="text-xs h-8 bg-emerald-600 hover:bg-emerald-700">
              <UserCheck className="size-3.5 mr-1" /> Enable Account
            </Button>
          ) : (
            <Button size="sm" variant="destructive" onClick={handleDisable} className="text-xs h-8">
              <UserX className="size-3.5 mr-1" /> Disable Account
            </Button>
          )}
        </div>
      </div>

      {/* Grid: Actions & Subscriptions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Credits Management Card */}
        <div className="rounded-xl border bg-card p-5 space-y-4 shadow-2xs">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
            <Zap className="size-4 text-amber-500 fill-amber-500" /> Credit Balance Management
          </h2>

          <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">Current Balance</span>
            <span className="text-xl font-extrabold text-foreground">{user.credits} Credits</span>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Amount</label>
                <Input
                  type="number"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(Number(e.target.value))}
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Reason</label>
                <Input
                  type="text"
                  placeholder="Reason..."
                  value={creditReason}
                  onChange={(e) => setCreditReason(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button size="sm" onClick={() => handleCreditsChange("increase")} className="flex-1 text-xs h-8">
                + Add
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleCreditsChange("decrease")} className="flex-1 text-xs h-8 text-destructive border-destructive/30">
                - Deduct
              </Button>
              <Button size="sm" variant="secondary" onClick={() => handleCreditsChange("set")} className="flex-1 text-xs h-8">
                Set Exact
              </Button>
            </div>
          </div>
        </div>

        {/* Subscription Plan Management */}
        <div className="rounded-xl border bg-card p-5 space-y-4 shadow-2xs">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
            <Sparkles className="size-4 text-primary" /> Plan &amp; Subscription Override
          </h2>

          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-muted-foreground block">Assign Subscription Tier</label>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={user.plan === "FREE" ? "default" : "outline"}
                onClick={() => handlePlanChange("FREE")}
                className="flex-1 text-xs h-8 font-semibold"
              >
                FREE (10 Cr)
              </Button>
              <Button
                size="sm"
                variant={user.plan === "PRO" ? "default" : "outline"}
                onClick={() => handlePlanChange("PRO")}
                className="flex-1 text-xs h-8 font-semibold"
              >
                PRO (250 Cr)
              </Button>
              <Button
                size="sm"
                variant={user.plan === "PREMIUM" ? "default" : "outline"}
                onClick={() => handlePlanChange("PREMIUM")}
                className="flex-1 text-xs h-8 font-semibold"
              >
                PREMIUM (1000 Cr)
              </Button>
            </div>
          </div>

          <div className="pt-2 border-t border-border space-y-2">
            <label className="text-[11px] font-semibold text-muted-foreground block">Password Reset Override</label>
            <div className="flex items-center gap-2">
              <Input
                type="password"
                placeholder="New Password (min 8 chars)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-8 text-xs flex-1"
              />
              <Button size="sm" onClick={handleResetPassword} className="text-xs h-8 shrink-0">
                <Lock className="size-3 mr-1" /> Reset
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default AdminUserDetails;
