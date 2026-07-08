'use client';

import type { ReactNode } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import useAuth from '@/hooks/useAuth';

export default function DashboardLayout({ children }: { children: ReactNode }) {
    const { user, authReady, logout } = useAuth() as any;
    if (!authReady) return null;

    return (
        <div className="app-shell">
            <Sidebar />
            <main className="app-content">
                <Navbar user={user} onLogout={logout} />
                {children}
                <Footer />
            </main>
        </div>
    );
}