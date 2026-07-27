export type ResumeStatus = "parsed" | "analyzing" | "completed" | "failed";

export interface Resume {
  id?: string;
  _id?: string;
  userId?: string;
  originalName: string;
  targetRole: string;
  jobDescription?: string;
  extractedText?: string;
  pageCount?: number | null;
  status: ResumeStatus;
  createdAt: string;
  updatedAt?: string;
}

export function getResumeId(resume: Resume): string {
  return resume.id || resume._id || "";
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export interface UploadResumeInput {
  file: File;
  targetRole: string;
  jobDescription?: string;
}

export interface UploadResumeResponse {
  success: boolean;
  message: string;
  resume: Resume;
}

export interface GetResumesResponse {
  success: boolean;
  count: number;
  resumes: Resume[];
}

export interface GetResumeResponse {
  success: boolean;
  resume: Resume;
}

export interface DeleteResumeResponse {
  success: boolean;
  message: string;
}
