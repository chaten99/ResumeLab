import React from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Forbidden: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center font-sans">
      <div className="space-y-4 max-w-md">
        <div className="size-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto border border-destructive/20">
          <ShieldAlert className="size-8" />
        </div>
        <h1 className="text-3xl font-black text-foreground">403 - Access Restricted</h1>
        <p className="text-xs text-muted-foreground leading-relaxed">
          You do not have administrative permissions to view this resource.
        </p>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Button size="sm" variant="outline" onClick={() => navigate(-1)} className="text-xs font-semibold h-9 gap-1.5">
            <ArrowLeft className="size-4" /> Go Back
          </Button>
          <Button size="sm" onClick={() => navigate("/dashboard")} className="text-xs font-semibold h-9 gap-1.5 shadow-xs">
            <Home className="size-4" /> User Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Forbidden;
