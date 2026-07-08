'use client';

import { useEffect, useState } from 'react';
import { clearSession, getCurrentUser, getToken } from '@/services/api';
import type { AuthSession } from '@/types/user';

type UseAuthOptions = {
    redirect?: boolean;
};

type UseAuthReturn = {
    user: AuthSession | null;
    authReady: boolean;
    logout: () => void;
};

export default function useAuth({ redirect = true }: UseAuthOptions = {}): UseAuthReturn {
    const [user, setUser] = useState<AuthSession | null>(null);
    const [authReady, setAuthReady] = useState(false);

    useEffect(() => {
        const token = getToken();
        const currentUser = getCurrentUser();

        if (!token || !currentUser) {
            if (redirect) window.location.replace('/login');
            setAuthReady(true);
            return;
        }

        setUser(currentUser);
        setAuthReady(true);
    }, [redirect]);

    function logout(): void {
        clearSession();
        window.location.href = '/login';
    }

    return { user, authReady, logout };
}