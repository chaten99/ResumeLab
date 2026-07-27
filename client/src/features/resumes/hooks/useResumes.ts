import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { resumeApi } from "../api/resume.api";
import type { UploadResumeInput } from "../types/resume.types";

export const RESUME_QUERY_KEYS = {
  all: ["resumes"] as const,
  lists: () => [...RESUME_QUERY_KEYS.all, "list"] as const,
  detail: (id: string) => [...RESUME_QUERY_KEYS.all, "detail", id] as const,
};

export const useResumes = () => {
  return useQuery({
    queryKey: RESUME_QUERY_KEYS.lists(),
    queryFn: resumeApi.getResumes,
    staleTime: 1000 * 60 * 5,
  });
};

export const useResume = (id: string) => {
  return useQuery({
    queryKey: RESUME_QUERY_KEYS.detail(id),
    queryFn: () => resumeApi.getResume(id),
    enabled: !!id,
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

export const useDeleteResume = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => resumeApi.deleteResume(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: RESUME_QUERY_KEYS.lists() });
      queryClient.removeQueries({ queryKey: RESUME_QUERY_KEYS.detail(deletedId) });
    },
  });
};
