import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bulletApi } from "../api/bullet.api";
import type { ImproveBulletInput, UpdateBulletStatusInput } from "../types/bullet.types";

export const BULLET_QUERY_KEYS = {
  all: ["bullets"] as const,
  history: (resumeId: string) => [...BULLET_QUERY_KEYS.all, "history", resumeId] as const,
};

export const useBulletHistory = (resumeId: string) => {
  return useQuery({
    queryKey: BULLET_QUERY_KEYS.history(resumeId),
    queryFn: ({ signal }) => bulletApi.getBulletHistory(resumeId, signal),
    enabled: !!resumeId,
    retry: (failureCount, error: any) => {
      if (error?.name === "CanceledError" || error?.code === "ERR_CANCELED") return false;
      if (error?.response?.status === 404) return false;
      return failureCount < 2;
    },
  });
};

export const useImproveBullet = (resumeId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["improveBullet", resumeId],
    mutationFn: (input: ImproveBulletInput) => bulletApi.improveBullet(resumeId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BULLET_QUERY_KEYS.history(resumeId) });
    },
  });
};

export const useUpdateBulletStatus = (resumeId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bulletId, input }: { bulletId: string; input: UpdateBulletStatusInput }) =>
      bulletApi.updateBulletStatus(resumeId, bulletId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BULLET_QUERY_KEYS.history(resumeId) });
    },
  });
};

export const useRegenerateBullet = (resumeId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["regenerateBullet", resumeId],
    mutationFn: (bulletId: string) => bulletApi.regenerateBullet(resumeId, bulletId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BULLET_QUERY_KEYS.history(resumeId) });
    },
  });
};
