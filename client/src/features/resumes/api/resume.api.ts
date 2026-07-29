import api from "@/lib/axios";
import type {
  UploadResumeInput,
  UploadResumeResponse,
  GetResumesResponse,
  GetResumeResponse,
  DeleteResumeResponse,
  AnalyzeResumeResponse,
  GetAnalysisResponse,
} from "../types/resume.types";

export const resumeApi = {
  uploadResume: async (input: UploadResumeInput, signal?: AbortSignal): Promise<UploadResumeResponse> => {
    const formData = new FormData();
    formData.append("resume", input.file);
    formData.append("targetRole", input.targetRole.trim());
    if (input.jobDescription && input.jobDescription.trim()) {
      formData.append("jobDescription", input.jobDescription.trim());
    }

    const response = await api.post<UploadResumeResponse>("/resumes/upload", formData, { signal });
    return response.data;
  },

  getResumes: async (signal?: AbortSignal): Promise<GetResumesResponse> => {
    const response = await api.get<GetResumesResponse>("/resumes", { signal });
    return response.data;
  },

  getResume: async (id: string, signal?: AbortSignal): Promise<GetResumeResponse> => {
    const response = await api.get<GetResumeResponse>(`/resumes/${id}`, { signal });
    return response.data;
  },

  deleteResume: async (id: string, signal?: AbortSignal): Promise<DeleteResumeResponse> => {
    const response = await api.delete<DeleteResumeResponse>(`/resumes/${id}`, { signal });
    return response.data;
  },

  analyzeResume: async (id: string, signal?: AbortSignal): Promise<AnalyzeResumeResponse> => {
    const response = await api.post<AnalyzeResumeResponse>(`/resumes/${id}/analyze`, {}, { signal });
    return response.data;
  },

  getResumeAnalysis: async (id: string, signal?: AbortSignal): Promise<GetAnalysisResponse> => {
    const response = await api.get<GetAnalysisResponse>(`/resumes/${id}/analysis`, { signal });
    return response.data;
  },
};
