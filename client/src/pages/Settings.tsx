import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User as UserIcon,
  Lock,
  Sun,
  Moon,
  Laptop,
  Download,
  AlertTriangle,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageTransition } from "@/components/layout/PageTransition";
import { useCurrentUser, useLogout } from "@/features/auth/hooks/useAuth";
import {
  useUpdateProfile,
  useChangePassword,
  useExportUserData,
  useDeactivateAccount,
} from "@/features/user/hooks/useUser";

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { setTheme, theme } = useTheme();
  const { data: userResponse, isLoading } = useCurrentUser();
  const logoutMutation = useLogout();
  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();
  const exportDataMutation = useExportUserData();
  const deactivateAccountMutation = useDeactivateAccount();

  const user = userResponse?.user;

  const [name, setName] = useState(user?.name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  if (isLoading || !user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl space-y-6 font-sans">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
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
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to change password.");
    }
  };

  const handleExportData = async () => {
    try {
      toast.loading("Exporting account data JSON...");
      const data = await exportDataMutation.mutateAsync();
      toast.dismiss();

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `resumelab-user-export-${user.id}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success("Data exported successfully!");
    } catch {
      toast.dismiss();
      toast.error("Failed to export account data.");
    }
  };

  const handleDeactivate = async () => {
    if (!confirm("Are you sure you want to deactivate your account? You will be logged out immediately.")) return;
    try {
      await deactivateAccountMutation.mutateAsync();
      toast.success("Account deactivated.");
      await logoutMutation.mutateAsync();
      navigate("/login", { replace: true });
    } catch {
      toast.error("Failed to deactivate account.");
    }
  };

  return (
    <PageTransition className="container mx-auto px-4 py-8 max-w-3xl space-y-6 font-sans">
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <UserIcon className="size-6 text-primary" /> Application Settings
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Manage your personal profile, security options, theme appearance, data privacy, and account status.
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full bg-muted/60 h-10 p-1 text-xs">
          <TabsTrigger value="general" className="text-xs font-semibold">General</TabsTrigger>
          <TabsTrigger value="security" className="text-xs font-semibold">Security</TabsTrigger>
          <TabsTrigger value="appearance" className="text-xs font-semibold">Appearance</TabsTrigger>
          <TabsTrigger value="privacy" className="text-xs font-semibold">Privacy</TabsTrigger>
          <TabsTrigger value="danger" className="text-xs font-semibold text-destructive">Danger</TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-4">
          <div className="rounded-xl border bg-card p-6 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-foreground">General Profile Information</h2>
            <form onSubmit={handleUpdateName} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="h-9 text-xs" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" value={user.email} disabled className="h-9 text-xs opacity-70 bg-muted" />
                <p className="text-[10px] text-muted-foreground">Email address cannot be changed directly.</p>
              </div>
              <Button size="sm" type="submit" disabled={updateProfileMutation.isPending} className="text-xs font-semibold h-8">
                {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <div className="rounded-xl border bg-card p-6 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Lock className="size-4 text-primary" /> Security &amp; Password
            </h2>
            <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <Label htmlFor="currPass">Current Password</Label>
                <Input
                  id="currPass"
                  type="password"
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
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
              <Button size="sm" type="submit" disabled={changePasswordMutation.isPending} className="text-xs font-semibold h-8">
                {changePasswordMutation.isPending ? "Updating Password..." : "Update Password"}
              </Button>
            </form>
          </div>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-4">
          <div className="rounded-xl border bg-card p-6 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-foreground">Theme &amp; Appearance</h2>
            <p className="text-xs text-muted-foreground">Select your preferred color theme across ResumeLab.</p>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <div
                onClick={() => setTheme("light")}
                className={`p-4 border rounded-xl flex flex-col items-center gap-2 cursor-pointer transition-all ${
                  theme === "light" ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "hover:bg-muted/40"
                }`}
              >
                <Sun className="size-5 text-amber-500" />
                <span className="text-xs font-semibold">Light</span>
              </div>

              <div
                onClick={() => setTheme("dark")}
                className={`p-4 border rounded-xl flex flex-col items-center gap-2 cursor-pointer transition-all ${
                  theme === "dark" ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "hover:bg-muted/40"
                }`}
              >
                <Moon className="size-5 text-primary" />
                <span className="text-xs font-semibold">Dark</span>
              </div>

              <div
                onClick={() => setTheme("system")}
                className={`p-4 border rounded-xl flex flex-col items-center gap-2 cursor-pointer transition-all ${
                  theme === "system" ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "hover:bg-muted/40"
                }`}
              >
                <Laptop className="size-5 text-muted-foreground" />
                <span className="text-xs font-semibold">System</span>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy" className="space-y-4">
          <div className="rounded-xl border bg-card p-6 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Download className="size-4 text-primary" /> Data Privacy &amp; Export
            </h2>
            <p className="text-xs text-muted-foreground">
              Download a complete JSON export of your profile, resumes, AI analysis reports, and credit ledger audit entries.
            </p>
            <Button size="sm" onClick={handleExportData} disabled={exportDataMutation.isPending} className="text-xs font-semibold h-9 gap-1.5 shadow-xs">
              <Download className="size-4" /> Export My Account Data (JSON)
            </Button>
          </div>
        </TabsContent>

        {/* Danger Zone Tab */}
        <TabsContent value="danger" className="space-y-4">
          <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-6 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-destructive flex items-center gap-2">
              <ShieldAlert className="size-4" /> Danger Zone
            </h2>
            <p className="text-xs text-muted-foreground">
              Deactivating your account will block access to AI feature execution and terminate all active sessions.
            </p>
            <Button size="sm" variant="destructive" onClick={handleDeactivate} disabled={deactivateAccountMutation.isPending} className="text-xs font-semibold h-8 gap-1.5">
              <AlertTriangle className="size-3.5" /> Deactivate Account
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </PageTransition>
  );
};

export default Settings;
