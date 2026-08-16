export interface UserPayload {
    id: string;
    email: string;
    role: string;
}

export interface LoginDTO {
    email: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    user: UserPayload;
}