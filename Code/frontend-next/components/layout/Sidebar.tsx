'use client';

import Link from 'next/link';
import { MENU } from '@/constants/menu';
import type { MenuItem } from '@/constants/menu';
import { getCurrentUser } from '@/services/api';
import type { UserRole } from '@/types/user';

export default function Sidebar() {

    const user = getCurrentUser();

    const role: UserRole = (user?.role ?? 'TeamMember') as UserRole;

    const menu: MenuItem[] = MENU[role] ?? [];

    return (
        <aside className="sidebar">

            <h2>SEAL</h2>

            <ul>

                {menu.map((item: MenuItem) => (

                    <li key={item.href}>
                        <Link href={item.href}>
                            {item.title}
                        </Link>
                    </li>

                ))}

            </ul>

        </aside>
    );
}