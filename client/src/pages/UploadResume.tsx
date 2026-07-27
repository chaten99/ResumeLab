import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

import { ResumeUploadForm } from "@/features/resumes/components/ResumeUploadForm";
import { ResumeUploadSuccess } from "@/features/resumes/components/ResumeUploadSuccess";
import type { Resume } from "@/features/resumes/types/resume.types";

const UploadResume: React.FC = () => {
  const navigate = useNavigate();
  const [uploadedResume, setUploadedResume] = useState<Resume | null>(null);

  return (
    <div className="container mx-auto px-4 py-8 max-w-xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Analyze your resume
          </h1>
          <p className="text-xs text-muted-foreground">
            Upload your resume and specify your target role to parse text for analysis.
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/dashboard")}
          className="gap-1.5 text-xs h-7 text-muted-foreground hover:text-foreground hidden sm:inline-flex"
        >
          <ArrowLeft className="size-3.5" />
          <span>Dashboard</span>
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-card p-6 shadow-xs">
        {uploadedResume ? (
          <ResumeUploadSuccess
            resume={uploadedResume}
            onReset={() => setUploadedResume(null)}
          />
        ) : (
          <ResumeUploadForm
            onSuccess={(resume) => setUploadedResume(resume)}
          />
        )}
      </div>
    </div>
  );
};

export default UploadResume;
