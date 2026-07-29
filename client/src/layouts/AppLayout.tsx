import React from "react";
import { Outlet } from "react-router-dom";
import { AppNavbar } from "@/components/layout/AppNavbar";

export const AppLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans text-foreground">
      <AppNavbar />

      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>

      <footer className="border-t border-border/60 bg-muted/30">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-center px-4 py-5 sm:px-6 lg:px-8">
          <p className="text-center text-xs text-muted-foreground sm:text-sm">
            Designed &amp; developed by{" "}
            <a
              href="https://chaten.netlify.app"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-foreground underline-offset-4 transition-colors duration-200 hover:text-primary hover:underline"
            >
              Chaten
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};