export interface User {
    id: string;
    _id?: string;
    name: string;
    email: string;
    isEmailVerified: boolean;
    role?: "user" | "admin";
    isDisabled?: boolean;
    plan?: "FREE" | "PRO" | "PREMIUM";
    credits?: number;
    subscriptionStatus?: "none" | "active" | "canceled" | "past_due";
    createdAt?: string;
}

export interface RegisterInput {
    name: string;
    email: string;
    password: string;
}

export interface LoginInput {
    email: string;
    password: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    accessToken?: string;
    refreshToken?: string;
    user: User;
}

export interface MeResponse {
    success: boolean;
    user: User;
}

export interface MessageResponse {
    success: boolean;
    message: string;
    accessToken?: string;
    refreshToken?: string;
}

export interface VerifyEmailInput {
    email: string;
    otp: string;
}

export interface ResendVerificationInput {
    email: string;
}

export interface ForgotPasswordInput {
    email: string;
}

export interface ResetPasswordInput {
    email: string;
    otp: string;
    newPassword: string;
}