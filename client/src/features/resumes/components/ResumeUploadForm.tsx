import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { toast } from "sonner";
import { Briefcase, FileText, Upload, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

import {
  uploadResumeSchema,
  type UploadResumeFormData,
} from "../schemas/resume.schema";
import { useUploadResume } from "../hooks/useResumes";
import { ResumeDropzone } from "./ResumeDropzone";
import type { Resume } from "../types/resume.types";

interface ResumeUploadFormProps {
  onSuccess?: (resume: Resume) => void;
}

export const ResumeUploadForm: React.FC<ResumeUploadFormProps> = ({ onSuccess }) => {
  const uploadMutation = useUploadResume();

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<UploadResumeFormData>({
    resolver: zodResolver(uploadResumeSchema),
    mode: "onTouched",
    defaultValues: {
      file: undefined,
      targetRole: "",
      jobDescription: "",
    },
  });

  const selectedFile = watch("file");
  const jobDescriptionValue = watch("jobDescription") || "";

  const onSubmit = async (data: UploadResumeFormData) => {
    try {
      const response = await uploadMutation.mutateAsync({
        file: data.file,
        targetRole: data.targetRole,
        jobDescription: data.jobDescription,
      });

      if (onSuccess && response.resume) {
        onSuccess(response.resume);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message;
        if (error.response?.status === 413) {
          toast.error("Resume file too large (max 5 MB)");
          return;
        }
        toast.error(message || "Upload failed");
        return;
      }
      toast.error("Upload failed");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <FileText className="size-3.5 text-muted-foreground" />
          <span>Resume File</span>
          <span className="text-destructive">*</span>
        </Label>
        <Controller
          control={control}
          name="file"
          render={({ field, fieldState }) => (
            <ResumeDropzone
              selectedFile={field.value || null}
              onFileSelect={(file) => {
                field.onChange(file);
              }}
              error={fieldState.error?.message}
              disabled={uploadMutation.isPending}
            />
          )}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="targetRole" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <Briefcase className="size-3.5 text-muted-foreground" />
          <span>Target Role</span>
          <span className="text-destructive">*</span>
        </Label>
        <Input
          id="targetRole"
          placeholder="e.g. Software Developer, Data Engineer"
          aria-invalid={!!errors.targetRole}
          disabled={uploadMutation.isPending}
          className="h-9 text-xs"
          {...register("targetRole")}
        />
        <p className="text-[11px] text-muted-foreground">
          The position or career role you are targeting.
        </p>
        {errors.targetRole && (
          <p className="text-xs font-medium text-destructive mt-1">
            {errors.targetRole.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="jobDescription" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <FileText className="size-3.5 text-muted-foreground" />
            <span>Job Description</span>
            <span className="text-muted-foreground font-normal text-[11px]">(Optional)</span>
          </Label>
          <span className="text-[10px] text-muted-foreground">
            {jobDescriptionValue.length.toLocaleString()} / 10,000
          </span>
        </div>
        <Textarea
          id="jobDescription"
          placeholder="Paste the target job description here for tailored benchmarking..."
          rows={4}
          maxLength={10000}
          aria-invalid={!!errors.jobDescription}
          disabled={uploadMutation.isPending}
          className="text-xs"
          {...register("jobDescription")}
        />
        {errors.jobDescription && (
          <p className="text-xs font-medium text-destructive mt-1">
            {errors.jobDescription.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={uploadMutation.isPending || !selectedFile}
        className="w-full h-9 text-xs font-semibold mt-2 gap-2"
      >
        {uploadMutation.isPending ? (
          <>
            <Spinner />
            <span>Uploading & parsing resume...</span>
          </>
        ) : (
          <>
            <Upload className="size-3.5" />
            <span>Prepare Resume</span>
            <ArrowRight className="size-3.5" />
          </>
        )}
      </Button>
    </form>
  );
};
