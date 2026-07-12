'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import useAuth from '@/hooks/useAuth';
import { TeamProvider } from '@/contexts/TeamContext';
import { isAdminRole, isJudgeRole, isMentorRole, roleOf } from '@/utils/rbac';

function canAccessPath(role: string | undefined, pathname: string): boolean {
    if (pathname === '/dashboard' || pathname === '/dashboard/profile' || pathname.startsWith('/dashboard/ranking')) return true;
    if (isAdminRole(role)) return true;
    if (isMentorRole(role)) {
        return pathname.startsWith('/dashboard/tracks') || pathname.startsWith('/dashboard/teams') || pathname.startsWith('/dashboard/submissions');
    }
    if (isJudgeRole(role)) {
        return pathname.startsWith('/dashboard/judges')
            || pathname.startsWith('/dashboard/scores')
            || pathname.startsWith('/dashboard/scoring-criteria')
            || pathname.startsWith('/dashboard/submissions');
    }
    if (role === 'TeamMember') {
        return pathname.startsWith('/dashboard/teams') || pathname.startsWith('/dashboard/submissions');
    }
    return false;
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const { user, authReady, logout } = useAuth() as any;
    if (!authReady) return null;

    const role = roleOf(user);
    const allowed = canAccessPath(role, pathname);

    return (
        <TeamProvider user={user}>
            <div className="app-shell">
                <Sidebar />
                <main className="app-content">
                    <Navbar user={user} onLogout={logout} />
                    {allowed ? children : (
                        <section className="card forbidden-card">
                            <span className="badge">403 Forbidden</span>
                            <h2>Không có quyền truy cập trang này</h2>
                            <p className="muted">Menu, route và API đã được giới hạn theo RBAC. Vui lòng dùng đúng tài khoản được phân quyền.</p>
                        </section>
                    )}
                    <Footer />
                </main>
            </div>
        </TeamProvider>
    );
}
