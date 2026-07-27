import React from "react";
import { Link } from "react-router-dom";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  showBackToLogin?: boolean;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  showBackToLogin = false,
}) => {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50/50 px-4 py-12 dark:bg-slate-950/50">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          {showBackToLogin && (
            <div className="w-full flex justify-start mb-2">
              <Link
                to="/login"
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
              >
                ← Back to login
              </Link>
            </div>
          )}

          <Link
            to="/"
            className="text-2xl font-bold tracking-tight text-primary hover:opacity-90 transition-opacity"
          >
            ResumeLab
          </Link>

          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>

          <p className="text-sm text-muted-foreground max-w-sm">
            {subtitle}
          </p>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm sm:p-8">
          {children}
        </div>
      </div>
    </main>
  );
};

export default AuthLayout;
