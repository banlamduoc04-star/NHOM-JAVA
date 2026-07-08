export type JwtPayload = Record<string, unknown> & {
    sub?: string;
    email?: string;
    exp?: number;
    iat?: number;
};

export function getJwtPayload(token: string): JwtPayload | null {
    try {
        return JSON.parse(atob(token.split('.')[1])) as JwtPayload;
    } catch {
        return null;
    }
}