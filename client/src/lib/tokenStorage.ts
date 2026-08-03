const ACCESS_TOKEN_KEY = "resumelab_access_token";
const REFRESH_TOKEN_KEY = "resumelab_refresh_token";

let memoryAccessToken: string | null = null;
let memoryRefreshToken: string | null = null;

export const getAccessToken = (): string | null => {
  if (memoryAccessToken) return memoryAccessToken;
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
};

export const getRefreshToken = (): string | null => {
  if (memoryRefreshToken) return memoryRefreshToken;
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setTokens = (accessToken?: string | null, refreshToken?: string | null) => {
  if (accessToken) {
    memoryAccessToken = accessToken;
    try {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    } catch {}
  }
  if (refreshToken) {
    memoryRefreshToken = refreshToken;
    try {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    } catch {}
  }
};

export const clearTokens = () => {
  memoryAccessToken = null;
  memoryRefreshToken = null;
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {}
};
