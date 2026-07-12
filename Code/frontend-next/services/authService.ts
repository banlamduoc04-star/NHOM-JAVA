import { apiFetch } from './api';
import type {
    AuthSession,
    MessageResponse,
    PasswordResetRequestResponse,
    RegisterPayload
} from '@/types/user';

export const login = async (
    email: string,
    password: string
): Promise<AuthSession> => {
    return apiFetch<AuthSession>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });
};

export const register = async (
    payload: RegisterPayload
): Promise<MessageResponse> => {
    return apiFetch<MessageResponse>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload)
    });
};

export const requestPasswordReset = async (
    email: string
): Promise<PasswordResetRequestResponse> => {
    return apiFetch<PasswordResetRequestResponse>('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email })
    });
};

export const resetPassword = async (
    email: string,
    resetCode: string,
    newPassword: string
): Promise<MessageResponse> => {
    return apiFetch<MessageResponse>('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email, resetCode, newPassword })
    });
};
