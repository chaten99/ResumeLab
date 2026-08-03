import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";

export const MEDIA_QUERY_KEYS = {
  all: ["userMedia"] as const,
};

export const useUserMedia = () => {
  return useQuery({
    queryKey: MEDIA_QUERY_KEYS.all,
    queryFn: async () => {
      const response = await api.get("/media");
      return response.data;
    },
  });
};

export const useDeleteMedia = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/media/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEDIA_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
    },
  });
};
