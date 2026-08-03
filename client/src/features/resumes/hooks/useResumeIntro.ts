import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    uploadResumeIntroApi,
    getLatestResumeIntroApi,
    getResumesListApi,
    getResumeByIdApi,
    deleteResumeApi,
} from "../api/resumeIntro.api";

export const RESUME_INTRO_QUERY_KEYS = {
    all: ["resumes"] as const,
    latestIntro: ["resumes", "latestIntro"] as const,
    detail: (id: string) => ["resumes", id] as const,
};

export const useUploadResumeIntro = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (formData: FormData) => uploadResumeIntroApi(formData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: RESUME_INTRO_QUERY_KEYS.all });
            queryClient.invalidateQueries({ queryKey: RESUME_INTRO_QUERY_KEYS.latestIntro });
        },
    });
};

export const useLatestResumeIntro = () => {
    return useQuery({
        queryKey: RESUME_INTRO_QUERY_KEYS.latestIntro,
        queryFn: getLatestResumeIntroApi,
        staleTime: 1000 * 60 * 5,
    });
};

export const useResumesList = () => {
    return useQuery({
        queryKey: RESUME_INTRO_QUERY_KEYS.all,
        queryFn: getResumesListApi,
    });
};

export const useResumeDetails = (id: string) => {
    return useQuery({
        queryKey: RESUME_INTRO_QUERY_KEYS.detail(id),
        queryFn: () => getResumeByIdApi(id),
        enabled: Boolean(id),
    });
};

export const useDeleteResumeIntro = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteResumeApi(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: RESUME_INTRO_QUERY_KEYS.all });
            queryClient.invalidateQueries({ queryKey: RESUME_INTRO_QUERY_KEYS.latestIntro });
        },
    });
};
