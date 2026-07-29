import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { atsApi } from "../api/ats.api";
import type { RunAtsMatchInput } from "../types/ats.types";

export const ATS_QUERY_KEYS = {
  all: ["ats"] as const,
  match: (resumeId: string) => [...ATS_QUERY_KEYS.all, "match", resumeId] as const,
};

export const useAtsMatch = (resumeId: string) => {
  return useQuery({
    queryKey: ATS_QUERY_KEYS.match(resumeId),
    queryFn: ({ signal }) => atsApi.getAtsMatch(resumeId, signal),
    enabled: !!resumeId,
    retry: (failureCount, error: any) => {
      if (error?.name === "CanceledError" || error?.code === "ERR_CANCELED") return false;
      if (error?.response?.status === 404) return false;
      return failureCount < 2;
    },
  });
};

export const useRunAtsMatch = (resumeId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["atsMatch", resumeId],
    mutationFn: (input?: RunAtsMatchInput) => atsApi.runAtsMatch(resumeId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ATS_QUERY_KEYS.match(resumeId) });
    },
  });
};
