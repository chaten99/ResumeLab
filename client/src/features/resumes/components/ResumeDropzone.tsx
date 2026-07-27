import React, { useRef, useState } from "react";
import { Upload, FileText, X, AlertCircle } from "lucide-react";
import { formatBytes } from "../types/resume.types";
import { cn } from "@/lib/utils";

interface ResumeDropzoneProps {
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
  error?: string;
  disabled?: boolean;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export const ResumeDropzone: React.FC<ResumeDropzoneProps> = ({
  selectedFile,
  onFileSelect,
  error,
  disabled = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndSelectFile = (file: File) => {
    setLocalError(null);

    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setLocalError("Only PDF files are allowed.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setLocalError("Resume PDF cannot exceed 5 MB.");
      return;
    }

    onFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 1) {
      setLocalError("Please upload only one resume at a time.");
      return;
    }

    if (files.length === 1) {
      validateAndSelectFile(files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndSelectFile(files[0]);
    }
  };

  const handleClick = () => {
    if (disabled || selectedFile) return;
    inputRef.current?.click();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLocalError(null);
    onFileSelect(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const activeError = error || localError;

  return (
    <div className="space-y-1.5">
      <input
        type="file"
        ref={inputRef}
        onChange={handleInputChange}
        accept="application/pdf,.pdf"
        className="hidden"
        disabled={disabled}
        aria-hidden="true"
      />

      {selectedFile ? (
        <div className="flex items-center justify-between p-3.5 rounded-lg border border-border bg-card shadow-xs transition-all">
          <div className="flex items-center gap-3 min-w-0 pr-2">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-primary border border-border">
              <FileText className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">
                {selectedFile.name}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                PDF · {formatBytes(selectedFile.size)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled}
            className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-destructive transition-colors disabled:pointer-events-none disabled:opacity-50 p-1.5 rounded-md hover:bg-destructive/10"
            aria-label="Remove selected file"
          >
            <X className="size-4" />
            <span className="hidden sm:inline">Remove</span>
          </button>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "flex flex-col items-center justify-center p-8 rounded-lg border border-dashed border-border bg-card/40 transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring",
            isDragOver
              ? "border-primary bg-primary/5"
              : "hover:bg-accent/40 hover:border-muted-foreground/40",
            activeError && "border-destructive/60 bg-destructive/5",
            disabled && "cursor-not-allowed opacity-60"
          )}
        >
          <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground mb-2.5">
            <Upload className="size-5" />
          </div>

          <p className="text-xs font-medium text-foreground text-center">
            {isDragOver ? "Drop your resume here" : "Drop your resume here"}
            {!isDragOver && <span className="text-muted-foreground"> or click to browse</span>}
          </p>
          <p className="text-[11px] text-muted-foreground text-center mt-1">
            PDF · Maximum 5 MB
          </p>
        </div>
      )}

      {activeError && (
        <div className="flex items-center gap-1 text-xs text-destructive font-medium mt-1">
          <AlertCircle className="size-3.5 shrink-0" />
          <span>{activeError}</span>
        </div>
      )}
    </div>
  );
};
