import React from "react";
import { useNavigate } from "react-router-dom";
import { FileQuestion, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center font-sans">
      <div className="space-y-4 max-w-md">
        <div className="size-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto border border-primary/20">
          <FileQuestion className="size-8" />
        </div>
        <h1 className="text-4xl font-black text-foreground">404 - Page Not Found</h1>
        <p className="text-xs text-muted-foreground leading-relaxed">
          The page or resource you are looking for does not exist, has been removed, or is temporarily unavailable.
        </p>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Button size="sm" variant="outline" onClick={() => navigate(-1)} className="text-xs font-semibold h-9 gap-1.5">
            <ArrowLeft className="size-4" /> Go Back
          </Button>
          <Button size="sm" onClick={() => navigate("/dashboard")} className="text-xs font-semibold h-9 gap-1.5 shadow-xs">
            <Home className="size-4" /> Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
