import api from "@/lib/axios";
import type {
  UploadResumeInput,
  UploadResumeResponse,
  GetResumesResponse,
  GetResumeResponse,
  DeleteResumeResponse,
} from "../types/resume.types";

export const resumeApi = {
  uploadResume: async (input: UploadResumeInput): Promise<UploadResumeResponse> => {
    const formData = new FormData();
    formData.append("resume", input.file);
    formData.append("targetRole", input.targetRole.trim());
    if (input.jobDescription && input.jobDescription.trim()) {
      formData.append("jobDescription", input.jobDescription.trim());
    }

    const response = await api.post<UploadResumeResponse>("/resumes/upload", formData);
    return response.data;
  },

  getResumes: async (): Promise<GetResumesResponse> => {
    const response = await api.get<GetResumesResponse>("/resumes");
    return response.data;
  },

  getResume: async (id: string): Promise<GetResumeResponse> => {
    const response = await api.get<GetResumeResponse>(`/resumes/${id}`);
    return response.data;
  },

  deleteResume: async (id: string): Promise<DeleteResumeResponse> => {
    const response = await api.delete<DeleteResumeResponse>(`/resumes/${id}`);
    return response.data;
  },
};
