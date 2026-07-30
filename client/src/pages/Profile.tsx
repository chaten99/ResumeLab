import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User as UserIcon, Lock, LogOut, Zap, Sparkles, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageTransition } from "@/components/layout/PageTransition";
import { useCurrentUser, useLogout } from "@/features/auth/hooks/useAuth";
import { useUpdateProfile, useChangePassword } from "@/features/user/hooks/useUser";

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { data: userResponse, isLoading } = useCurrentUser();
  const logoutMutation = useLogout();
  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();

  const user = userResponse?.user;
  const [name, setName] = useState(user?.name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  if (isLoading || !user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl space-y-6 font-sans">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || name.trim().length < 2) {
      toast.error("Name must be at least 2 characters long.");
      return;
    }
    try {
      await updateProfileMutation.mutateAsync({ name: name.trim() });
      toast.success("Name updated successfully!");
    } catch {
      toast.error("Failed to update profile name.");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error("Please enter your current password.");
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match!");
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({ currentPassword, newPassword });
      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to change password.");
    }
  };

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      toast.success("Logged out");
      navigate("/login", { replace: true });
    } catch {
      toast.error("Logout failed");
    }
  };

  const isAdmin = user.role === "admin";

  return (
    <PageTransition className="container mx-auto px-4 py-8 max-w-2xl space-y-6 font-sans">
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <UserIcon className="size-6 text-primary" /> Account Settings &amp; Profile
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Manage your account credentials, security preferences, and active subscription.
        </p>
      </div>

      {/* Account Overview Header */}
      <div className="rounded-xl border bg-card p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className={`size-12 rounded-full font-black text-lg flex items-center justify-center border ${
              isAdmin ? "bg-primary text-primary-foreground border-primary" : "bg-primary/10 text-primary border-primary/20"
            }`}>
              {user.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-foreground">{user.name}</h2>
                {isAdmin ? (
                  <Badge className="bg-primary text-primary-foreground text-[9px] font-extrabold uppercase">
                    Admin
                  </Badge>
                ) : user.isEmailVerified ? (
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[9px] font-bold">
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[9px] text-amber-500 border-amber-500/20">
                    Unverified
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold">
            {!isAdmin && (
              <>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
                  <Sparkles className="size-3.5" />
                  <span>{user.plan || "FREE"}</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-600 border border-amber-500/20">
                  <Zap className="size-3.5 fill-amber-500 text-amber-500" />
                  <span>{user.credits ?? 10} Credits</span>
                </div>
              </>
            )}
            {isAdmin && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
                <ShieldCheck className="size-3.5" />
                <span>Super Admin</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Update Name Form */}
      <div className="rounded-xl border bg-card p-6 shadow-2xs space-y-4">
        <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
          <UserIcon className="size-4 text-primary" /> Edit Profile Name
        </h2>
        <form onSubmit={handleUpdateName} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="h-9 text-xs" />
          </div>
          <Button size="sm" type="submit" disabled={updateProfileMutation.isPending} className="text-xs font-semibold h-8">
            {updateProfileMutation.isPending ? "Updating..." : "Save Name"}
          </Button>
        </form>
      </div>

      {/* Change Password Form with Confirm Password */}
      <div className="rounded-xl border bg-card p-6 shadow-2xs space-y-4">
        <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Lock className="size-4 text-primary" /> Security &amp; Change Password
        </h2>
        <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <Label htmlFor="currPass">Current Password</Label>
            <Input
              id="currPass"
              type="password"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="h-9 text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="newPass">New Password</Label>
            <Input
              id="newPass"
              type="password"
              placeholder="Min 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="h-9 text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirmPass">Confirm New Password</Label>
            <Input
              id="confirmPass"
              type="password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-9 text-xs"
            />
          </div>
          <Button size="sm" type="submit" disabled={changePasswordMutation.isPending} className="text-xs font-semibold h-8">
            {changePasswordMutation.isPending ? "Changing Password..." : "Update Password"}
          </Button>
        </form>
      </div>

      {/* Logout Action */}
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 shadow-2xs flex items-center justify-between">
        <div>
          <h2 className="text-xs font-bold text-foreground">Sign out of ResumeLab</h2>
          <p className="text-[11px] text-muted-foreground">Terminate active session on this device.</p>
        </div>
        <Button size="sm" variant="destructive" onClick={handleLogout} disabled={logoutMutation.isPending} className="text-xs font-semibold h-8 gap-1.5">
          <LogOut className="size-3.5" /> Log out
        </Button>
      </div>
    </PageTransition>
  );
};

export default Profile;
