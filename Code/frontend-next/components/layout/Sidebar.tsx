'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { ADMIN_MENU, JUDGE_MENU, LEADER_MENU, MEMBER_MENU, MENTOR_MENU, type MenuItem } from '@/constants/menu';
import { useTeamContext } from '@/contexts/TeamContext';
import { getCurrentUser } from '@/services/api';
import { isAdminRole, isJudgeRole, isMentorRole, roleOf } from '@/utils/rbac';

export default function Sidebar() {
    const pathname = usePathname();
    const user = getCurrentUser();
    const role = roleOf(user);
    const { isLeader } = useTeamContext();

    const menu: MenuItem[] = useMemo(() => {
        if (isAdminRole(role)) return ADMIN_MENU;
        if (isMentorRole(role)) return MENTOR_MENU;
        if (isJudgeRole(role)) return JUDGE_MENU;
        return isLeader ? LEADER_MENU : MEMBER_MENU;
    }, [role, isLeader]);

    return (
        <aside className="sidebar">
            <Link className="sidebar-brand" href="/dashboard" aria-label="SEAL Dashboard">
                <span className="brand-mark">S</span>
                <span>
                    <strong>SEAL</strong>
                    <small>Hackathon RBAC</small>
                </span>
            </Link>

            <nav className="sidebar-nav" aria-label="Dashboard navigation">
                {menu.filter((item) => item.href !== '/dashboard/profile').map((item: MenuItem, index) => {
                    const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                    return (
                        <Link key={`${item.title}-${item.href}-${index}`} href={item.href} className={active ? 'active' : ''}>
                            {item.title}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
