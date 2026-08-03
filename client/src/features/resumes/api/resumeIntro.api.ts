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
