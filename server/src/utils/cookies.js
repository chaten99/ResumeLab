import { env } from "../config/env.js";
import { parseDuration } from "./duration.js";

const isProduction = env.NODE_ENV === "production";

const baseCookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
};

export const setAccessTokenCookie = (res, accessToken) => {
    res.cookie("accessToken", accessToken, {
        ...baseCookieOptions,
        maxAge: parseDuration(env.JWT_ACCESS_EXPIRES_IN),
    });
};

export const setRefreshTokenCookie = (res, refreshToken) => {
    res.cookie("refreshToken", refreshToken, {
        ...baseCookieOptions,
        maxAge: parseDuration(env.JWT_REFRESH_EXPIRES_IN),
    });
};

export const setAuthCookies = (res, accessToken, refreshToken) => {
    setAccessTokenCookie(res, accessToken);
    setRefreshTokenCookie(res, refreshToken);
};

export const clearAuthCookies = (res) => {
    res.clearCookie("accessToken", baseCookieOptions);
    res.clearCookie("refreshToken", baseCookieOptions);
};