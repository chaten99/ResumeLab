import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    uploadResumeIntroApi,
    getLatestResumeIntroApi,
    confirmStep1Api,
    updateBuilderStateApi,
    exportPdfApi,
    exportDocxApi,
    updateTranscriptApi,
    updateStructuredResumeApi,
    retriggerExtractionApi,
    reprocessTranscriptApi,
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

export const useConfirmStep1 = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => confirmStep1Api(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: RESUME_INTRO_QUERY_KEYS.all });
            queryClient.invalidateQueries({ queryKey: RESUME_INTRO_QUERY_KEYS.latestIntro });
        },
    });
};

export const useUpdateBuilderState = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            id,
            currentStep,
            selectedTemplate,
            selectedColor,
            structuredResume,
        }: {
            id: string;
            currentStep?: number;
            selectedTemplate?: string;
            selectedColor?: string;
            structuredResume?: any;
        }) =>
            updateBuilderStateApi({ id, currentStep, selectedTemplate, selectedColor, structuredResume }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: RESUME_INTRO_QUERY_KEYS.latestIntro });
        },
    });
};

export const useExportPdf = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => exportPdfApi(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: RESUME_INTRO_QUERY_KEYS.latestIntro });
        },
    });
};

export const useExportDocx = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => exportDocxApi(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: RESUME_INTRO_QUERY_KEYS.latestIntro });
        },
    });
};

export const useUpdateTranscript = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, text }: { id: string; text: string }) => updateTranscriptApi({ id, text }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: RESUME_INTRO_QUERY_KEYS.all });
            queryClient.invalidateQueries({ queryKey: RESUME_INTRO_QUERY_KEYS.latestIntro });
        },
    });
};

export const useUpdateStructuredResume = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, structuredResume }: { id: string; structuredResume: any }) =>
            updateStructuredResumeApi({ id, structuredResume }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: RESUME_INTRO_QUERY_KEYS.all });
            queryClient.invalidateQueries({ queryKey: RESUME_INTRO_QUERY_KEYS.latestIntro });
        },
    });
};

export const useRetriggerExtraction = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => retriggerExtractionApi(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: RESUME_INTRO_QUERY_KEYS.all });
            queryClient.invalidateQueries({ queryKey: RESUME_INTRO_QUERY_KEYS.latestIntro });
        },
    });
};

export const useReprocessTranscript = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => reprocessTranscriptApi(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: RESUME_INTRO_QUERY_KEYS.all });
            queryClient.invalidateQueries({ queryKey: RESUME_INTRO_QUERY_KEYS.latestIntro });
        },
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
