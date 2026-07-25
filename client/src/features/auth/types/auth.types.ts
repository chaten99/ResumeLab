export interface User {
    id: string;
    name: string;
    email: string;
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