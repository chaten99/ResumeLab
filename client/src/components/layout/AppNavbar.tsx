import React from "react";
import { Link } from "react-router-dom";
import { FileText } from "lucide-react";
import { UserMenu } from "./UserMenu";

export const AppNavbar: React.FC = () => {

  return (
    <header className="border-b bg-card/80 backdrop-blur-xs sticky top-0 z-40">
      <div className="container mx-auto flex h-14 items-center justify-between px-4 max-w-5xl">
        <div className="flex items-center gap-6">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 font-bold tracking-tight text-foreground hover:opacity-90 transition-opacity text-sm"
          >
            <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <FileText className="size-3.5" />
            </div>
            <span>ResumeLab</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <UserMenu />
        </div>
      </div>
    </header>
  );
};
