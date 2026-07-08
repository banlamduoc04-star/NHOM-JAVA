'use client';

import { useEffect } from 'react';

export default function HomePage() {
    useEffect(() => {
        window.location.replace(
            localStorage.getItem('seal_token')
                ? '/dashboard'
                : '/auth/login'
        );
    }, []);

    return null;
}