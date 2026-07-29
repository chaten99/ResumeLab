import api from "@/lib/axios";
import type {
  RunAtsMatchInput,
  GetAtsMatchResponse,
} from "../types/ats.types";

export const atsApi = {
  runAtsMatch: async (
    resumeId: string,
    input?: RunAtsMatchInput,
    signal?: AbortSignal
  ): Promise<GetAtsMatchResponse> => {
    const response = await api.post<GetAtsMatchResponse>(
      `/resumes/${resumeId}/ats-match`,
      input || {},
      { signal }
    );
    return response.data;
  },

  getAtsMatch: async (resumeId: string, signal?: AbortSignal): Promise<GetAtsMatchResponse> => {
    const response = await api.get<GetAtsMatchResponse>(
      `/resumes/${resumeId}/ats-match`,
      { signal }
    );
    return response.data;
  },
};
