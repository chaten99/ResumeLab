export interface User {
    id: string;
    name: string;
    email: string;
    isEmailVerified: boolean;
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
    user: User;
}

export interface MeResponse {
    success: boolean;
    user: User;
}

export interface MessageResponse {
    success: boolean;
    message: string;
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