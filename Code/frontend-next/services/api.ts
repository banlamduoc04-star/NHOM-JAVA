import type { AuthSession } from '@/types/user';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export type ApiId = number | string;
export type ApiPrimitive = string | number | boolean | null | undefined;
export type QueryParams = Record<string, ApiPrimitive>;
export type JsonRecord = Record<string, unknown>;

export function getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('seal_token');
}

export function getCurrentUser(): AuthSession | null {
    if (typeof window === 'undefined') return null;
    try {
        return JSON.parse(localStorage.getItem('seal_user') || 'null') as AuthSession | null;
    } catch {
        return null;
    }
}

export function saveSession(data: AuthSession): void {
    localStorage.setItem('seal_token', data.token);
    localStorage.setItem('seal_user', JSON.stringify(data));
}

export function clearSession(): void {
    localStorage.removeItem('seal_token');
    localStorage.removeItem('seal_user');
}

async function readError(res: Response): Promise<string> {
    const text = await res.text();
    try {
        const json = JSON.parse(text) as { message?: string; error?: string; errorCode?: string };
        return json.message || json.error || json.errorCode || text;
    } catch {
        return text || `Lỗi HTTP ${res.status}`;
    }
}

export async function apiFetch<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
    const token = getToken();
    const headers = new Headers(init.headers);

    if (init.body && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json; charset=utf-8');
    }

    if (!headers.has('Accept')) {
        headers.set('Accept', 'application/json; charset=utf-8');
    }

    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    const res = await fetch(`${API_BASE}${path}`, {
        ...init,
        headers
    });

    if (!res.ok) throw new Error(await readError(res));
    if (res.status === 204) return null as T;

    const text = await res.text();
    return (text ? JSON.parse(text) : null) as T;
}

function fileNameFromDisposition(disposition: string | null): string | null {
    if (!disposition) return null;
    const utf8 = disposition.match(/filename\*=UTF-8''([^;]+)/i);
    if (utf8?.[1]) return decodeURIComponent(utf8[1].replace(/"/g, ''));
    const normal = disposition.match(/filename="?([^";]+)"?/i);
    return normal?.[1] || null;
}

export async function downloadFile(path: string, fallbackFileName: string): Promise<void> {
    const token = getToken();
    const headers = new Headers();
    headers.set('Accept', '*/*');
    if (token) headers.set('Authorization', `Bearer ${token}`);

    const res = await fetch(`${API_BASE}${path}`, { headers });
    if (!res.ok) throw new Error(await readError(res));
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileNameFromDisposition(res.headers.get('Content-Disposition')) || fallbackFileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
}

export function query(params: QueryParams = {}): string {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== '' && value !== undefined && value !== null) {
            qs.set(key, String(value));
        }
    });
    const search = qs.toString();
    return search ? `?${search}` : '';
}

export const API_BASE_URL = API_BASE;