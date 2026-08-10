import api from "@/lib/axios";

export const uploadResumeIntroApi = async (formData: FormData) => {
    const response = await api.post("/resumes/upload-intro", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
};

export const getLatestResumeIntroApi = async () => {
    const response = await api.get("/resumes/intro/latest");
    return response.data;
};

export const confirmStep1Api = async (id: string) => {
    const response = await api.post(`/resumes/${id}/step1/confirm`);
    return response.data;
};

export const updateBuilderStateApi = async ({
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
}) => {
    const response = await api.put(`/resumes/${id}/builder-state`, {
        currentStep,
        selectedTemplate,
        selectedColor,
        structuredResume,
    });
    return response.data;
};

export const exportPdfApi = async (id: string) => {
    const response = await api.post(`/resumes/${id}/export/pdf`);
    return response.data;
};

export const exportDocxApi = async (id: string) => {
    const response = await api.post(`/resumes/${id}/export/docx`);
    return response.data;
};

export const updateTranscriptApi = async ({ id, text }: { id: string; text: string }) => {
    const response = await api.put(`/resumes/${id}/transcript`, { text });
    return response.data;
};

export const updateStructuredResumeApi = async ({ id, structuredResume }: { id: string; structuredResume: any }) => {
    const response = await api.put(`/resumes/${id}/structured`, { structuredResume });
    return response.data;
};

export const retriggerExtractionApi = async (id: string) => {
    const response = await api.post(`/resumes/${id}/extract`);
    return response.data;
};

export const reprocessTranscriptApi = async (id: string) => {
    const response = await api.post(`/resumes/${id}/transcript/reprocess`);
    return response.data;
};

export const getResumesListApi = async () => {
    const response = await api.get("/resumes");
    return response.data;
};

export const getResumeByIdApi = async (id: string) => {
    const response = await api.get(`/resumes/${id}`);
    return response.data;
};

export const deleteResumeApi = async (id: string) => {
    const response = await api.delete(`/resumes/${id}`);
    return response.data;
};
