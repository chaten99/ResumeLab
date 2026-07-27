import React from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, ChevronDown } from "lucide-react";
import { toast } from "sonner";

import { useCurrentUser, useLogout } from "@/features/auth/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-[11px]">
            {initials}
          </AvatarFallback>
        </Avatar>

        <span className="text-xs font-medium text-foreground hidden sm:inline-block max-w-[120px] truncate">
          {user.name}
        </span>

        <ChevronDown className="size-3.5 text-muted-foreground group-hover:text-foreground transition-colors hidden sm:inline-block" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56 p-1.5">
        <div className="px-2 py-1.5 space-y-0.5">
          <p className="text-xs font-semibold text-foreground truncate">{user.name}</p>
          <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          destructive
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          className="cursor-pointer"
        >
          <LogOut className="size-3.5" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
