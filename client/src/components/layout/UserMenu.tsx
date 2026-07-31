import React from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  ChevronDown,
  User as UserIcon,
  CreditCard,
  Sparkles,
  Zap,
  ShieldCheck,
  Users,
  FileText,
  BarChart3,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";

import { useCurrentUser, useLogout } from "@/features/auth/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function getInitials(name?: string): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export const UserMenu: React.FC = () => {
  const navigate = useNavigate();
  const { data: userResponse } = useCurrentUser();
  const logoutMutation = useLogout();

  const user = userResponse?.user;
  if (!user) return null;

  const initials = getInitials(user.name);
  const userPlan = user.plan || "FREE";
  const userCredits = user.credits ?? 10;
  const isAdmin = user.role === "admin";

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      toast.success("Logged out");
      navigate("/login", { replace: true });
    } catch {
      toast.error("Logout failed");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex items-center gap-2 p-1 rounded-full hover:bg-accent transition-colors outline-none cursor-pointer group"
        aria-label="User menu"
      >
        <Avatar className="size-7 border border-border">
          <AvatarFallback
            className={`font-semibold text-[11px] ${
              isAdmin ? "bg-primary text-primary-foreground font-extrabold" : "bg-primary/10 text-primary"
            }`}
          >
            {initials}
          </AvatarFallback>
        </Avatar>

        <span className="text-xs font-medium text-foreground hidden sm:inline-block max-w-[120px] truncate">
          {user.name}
        </span>

        <ChevronDown className="size-3.5 text-muted-foreground group-hover:text-foreground transition-colors hidden sm:inline-block" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-60 p-1.5 font-sans">
        <div className="px-2 py-2 space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-foreground truncate">{user.name}</p>
            {isAdmin ? (
              <Badge className="text-[9px] bg-primary text-primary-foreground font-bold uppercase tracking-wider">
                Admin
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-bold uppercase tracking-wider">
                {userPlan}
              </Badge>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
        </div>

        {!isAdmin && (
          <div
            onClick={() => navigate("/credits")}
            className="mx-1 my-1 p-2 rounded-md bg-muted/60 flex items-center justify-between text-xs cursor-pointer hover:bg-muted transition-colors"
          >
            <span className="text-muted-foreground flex items-center gap-1 font-medium">
              <Zap className="size-3.5 text-amber-500 fill-amber-500" />
              Credits
            </span>
            <span className="font-bold text-foreground">{userCredits}</span>
          </div>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => navigate("/profile")} className="cursor-pointer text-xs">
          <UserIcon className="size-3.5 mr-2 text-muted-foreground" />
          <span>Profile</span>
        </DropdownMenuItem>

        {isAdmin ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/dashboard")} className="cursor-pointer text-xs font-semibold text-primary">
              <ShieldCheck className="size-3.5 mr-2 text-primary" />
              <span>Admin Dashboard</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/dashboard/users")} className="cursor-pointer text-xs">
              <Users className="size-3.5 mr-2 text-muted-foreground" />
              <span>User Management</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/dashboard/resumes-manage")} className="cursor-pointer text-xs">
              <FileText className="size-3.5 mr-2 text-muted-foreground" />
              <span>Resumes Moderation</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/dashboard/credits-ledger")} className="cursor-pointer text-xs">
              <Zap className="size-3.5 mr-2 text-amber-500 fill-amber-500" />
              <span>Credit Ledger Audit</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/dashboard/transactions")} className="cursor-pointer text-xs">
              <CreditCard className="size-3.5 mr-2 text-muted-foreground" />
              <span>Transactions</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/dashboard/analytics")} className="cursor-pointer text-xs">
              <BarChart3 className="size-3.5 mr-2 text-muted-foreground" />
              <span>Analytics</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/dashboard/audit")} className="cursor-pointer text-xs">
              <ShieldAlert className="size-3.5 mr-2 text-muted-foreground" />
              <span>Security Audit Logs</span>
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem onClick={() => navigate("/billing")} className="cursor-pointer text-xs">
              <CreditCard className="size-3.5 mr-2 text-muted-foreground" />
              <span>Billing &amp; History</span>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => navigate("/subscription")} className="cursor-pointer text-xs">
              <Sparkles className="size-3.5 mr-2 text-muted-foreground" />
              <span>Subscription Plans</span>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => navigate("/credits")} className="cursor-pointer text-xs">
              <Zap className="size-3.5 mr-2 text-amber-500 fill-amber-500" />
              <span>Credits Ledger</span>
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          className="cursor-pointer text-xs text-destructive"
        >
          <LogOut className="size-3.5 mr-2" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
