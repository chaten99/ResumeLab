import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { resumeApi } from "../api/resume.api";
import type { UploadResumeInput } from "../types/resume.types";

const isValidMongoId = (id: string) => Boolean(id && /^[0-9a-fA-F]{24}$/.test(id));

export const RESUME_QUERY_KEYS = {
  all: ["resumes"] as const,
  lists: () => [...RESUME_QUERY_KEYS.all, "list"] as const,
  detail: (id: string) => [...RESUME_QUERY_KEYS.all, "detail", id] as const,
  analysis: (id: string) => [...RESUME_QUERY_KEYS.all, "analysis", id] as const,
};

export const useResumes = () => {
  return useQuery({
    queryKey: RESUME_QUERY_KEYS.lists(),
    queryFn: ({ signal }) => resumeApi.getResumes(signal),
    staleTime: 1000 * 60 * 5,
  });
};

export const useResume = (id: string) => {
  return useQuery({
    queryKey: RESUME_QUERY_KEYS.detail(id),
    queryFn: ({ signal }) => resumeApi.getResume(id, signal),
    enabled: isValidMongoId(id),
    staleTime: 1000 * 60 * 5,
  });
};

export const useResumeAnalysis = (id: string) => {
  return useQuery({
    queryKey: RESUME_QUERY_KEYS.analysis(id),
    queryFn: ({ signal }) => resumeApi.getResumeAnalysis(id, signal),
    enabled: isValidMongoId(id),
    staleTime: 1000 * 60 * 15,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: (query) => {
      const status = query.state.data?.analysis?.status;
      return status === "processing" || status === "pending" ? 3000 : false;
    },
    retry: (failureCount, error: any) => {
      if (error?.name === "CanceledError" || error?.code === "ERR_CANCELED") return false;
      if (error?.response?.status === 404 || error?.response?.status === 400) return false;
      return failureCount < 2;
    },
  });
};

export const useUploadResume = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UploadResumeInput) => resumeApi.uploadResume(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESUME_QUERY_KEYS.lists() });
    },
  });
};

export const useAnalyzeResume = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["analyzeResume"],
    mutationFn: (id: string) => resumeApi.analyzeResume(id),
    onSuccess: (data, id) => {
      if (data?.analysis) {
        queryClient.setQueryData(RESUME_QUERY_KEYS.analysis(id), {
          success: true,
          analysis: data.analysis,
        });
      }
      queryClient.invalidateQueries({ queryKey: RESUME_QUERY_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: RESUME_QUERY_KEYS.lists() });
    },
  });
};

export const useDeleteResume = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => resumeApi.deleteResume(id),
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: RESUME_QUERY_KEYS.detail(deletedId) });
      await queryClient.cancelQueries({ queryKey: RESUME_QUERY_KEYS.analysis(deletedId) });
    },
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: RESUME_QUERY_KEYS.lists() });
      queryClient.removeQueries({ queryKey: RESUME_QUERY_KEYS.detail(deletedId) });
      queryClient.removeQueries({ queryKey: RESUME_QUERY_KEYS.analysis(deletedId) });
    },
  });
};
