import React from "react";
import { Link, NavLink } from "react-router-dom";
import { FileText, Zap, ShieldCheck } from "lucide-react";
import { UserMenu } from "./UserMenu";
import { NotificationCenter } from "./NotificationCenter";
import { useCurrentUser } from "@/features/auth/hooks/useAuth";
import { Badge } from "@/components/ui/badge";

export const AppNavbar: React.FC = () => {
  const { data: userResponse } = useCurrentUser();
  const user = userResponse?.user;
  const credits = user?.credits ?? 10;
  const isAdmin = user?.role === "admin";

  return (
    <header className="border-b bg-card/80 backdrop-blur-xs sticky top-0 z-40">
      <div className="container mx-auto flex h-14 items-center justify-between px-4 max-w-6xl">
        <div className="flex items-center gap-6">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 font-bold tracking-tight text-foreground hover:opacity-90 transition-opacity text-sm"
          >
            <div className={`flex size-7 items-center justify-center rounded-md text-primary-foreground ${isAdmin ? "bg-primary font-extrabold" : "bg-primary"}`}>
              {isAdmin ? <ShieldCheck className="size-4" /> : <FileText className="size-3.5" />}
            </div>
            <span>ResumeLab</span>
            {isAdmin && (
              <Badge variant="outline" className="text-[9px] uppercase font-bold border-primary/30 text-primary ml-1">
                Admin
              </Badge>
            )}
          </Link>

          {isAdmin && (
            <nav className="hidden md:flex items-center gap-1 text-xs font-medium">
              <NavLink
                to="/dashboard"
                end
                className={({ isActive }) =>
                  `px-2.5 py-1 rounded-md transition-colors ${isActive ? "bg-primary/10 text-primary font-bold" : "text-muted-foreground hover:text-foreground"}`
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/dashboard/users"
                className={({ isActive }) =>
                  `px-2.5 py-1 rounded-md transition-colors ${isActive ? "bg-primary/10 text-primary font-bold" : "text-muted-foreground hover:text-foreground"}`
                }
              >
                Users
              </NavLink>
              <NavLink
                to="/dashboard/resumes-manage"
                className={({ isActive }) =>
                  `px-2.5 py-1 rounded-md transition-colors ${isActive ? "bg-primary/10 text-primary font-bold" : "text-muted-foreground hover:text-foreground"}`
                }
              >
                Resumes
              </NavLink>
              <NavLink
                to="/dashboard/credits-ledger"
                className={({ isActive }) =>
                  `px-2.5 py-1 rounded-md transition-colors ${isActive ? "bg-primary/10 text-primary font-bold" : "text-muted-foreground hover:text-foreground"}`
                }
              >
                Ledger
              </NavLink>
              <NavLink
                to="/dashboard/transactions"
                className={({ isActive }) =>
                  `px-2.5 py-1 rounded-md transition-colors ${isActive ? "bg-primary/10 text-primary font-bold" : "text-muted-foreground hover:text-foreground"}`
                }
              >
                Transactions
              </NavLink>
              <NavLink
                to="/dashboard/analytics"
                className={({ isActive }) =>
                  `px-2.5 py-1 rounded-md transition-colors ${isActive ? "bg-primary/10 text-primary font-bold" : "text-muted-foreground hover:text-foreground"}`
                }
              >
                Analytics
              </NavLink>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user && !isAdmin && (
            <Link
              to="/credits"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-semibold hover:bg-amber-500/20 transition-colors"
              title="View credits and billing"
            >
              <Zap className="size-3.5 fill-amber-500 text-amber-500" />
              <span>{credits} Credits</span>
            </Link>
          )}

          {user && <NotificationCenter />}
          <UserMenu />
        </div>
      </div>
    </header>
  );
};
