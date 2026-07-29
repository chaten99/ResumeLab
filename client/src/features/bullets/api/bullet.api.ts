import api from "@/lib/axios";
import type {
  ImproveBulletInput,
  ImproveBulletResponse,
  GetBulletHistoryResponse,
  UpdateBulletStatusInput,
} from "../types/bullet.types";

export const bulletApi = {
  improveBullet: async (
    resumeId: string,
    input: ImproveBulletInput,
    signal?: AbortSignal
  ): Promise<ImproveBulletResponse> => {
    const response = await api.post<ImproveBulletResponse>(
      `/resumes/${resumeId}/bullets/improve`,
      input,
      { signal }
    );
    return response.data;
  },

  getBulletHistory: async (resumeId: string, signal?: AbortSignal): Promise<GetBulletHistoryResponse> => {
    const response = await api.get<GetBulletHistoryResponse>(
      `/resumes/${resumeId}/bullets`,
      { signal }
    );
    return response.data;
  },

  updateBulletStatus: async (
    resumeId: string,
    bulletId: string,
    input: UpdateBulletStatusInput,
    signal?: AbortSignal
  ): Promise<ImproveBulletResponse> => {
    const response = await api.patch<ImproveBulletResponse>(
      `/resumes/${resumeId}/bullets/${bulletId}/status`,
      input,
      { signal }
    );
    return response.data;
  },

  regenerateBullet: async (
    resumeId: string,
    bulletId: string,
    signal?: AbortSignal
  ): Promise<ImproveBulletResponse> => {
    const response = await api.post<ImproveBulletResponse>(
      `/resumes/${resumeId}/bullets/${bulletId}/regenerate`,
      {},
      { signal }
    );
    return response.data;
  },
};
