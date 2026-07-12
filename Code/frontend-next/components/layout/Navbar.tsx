import Link from 'next/link';
import type { AuthSession } from '@/types/user';
import { viRole } from '@/constants/role';
import { roleOf } from '@/utils/rbac';

interface NavbarProps {
    user: AuthSession | null;
    onLogout: () => void;
}

export default function Navbar({ user, onLogout }: NavbarProps) {
    return (
        <header className="navbar">
            <div className="navbar-main">
                <div>
                    <span className="eyebrow">Dashboard</span>
                    <h1>SEAL Hackathon</h1>
                </div>

                <nav className="navbar-nav" aria-label="Main navigation">
                </nav>
            </div>

            <div className="navbar-user">
                <div className="user-meta">
                    <strong>{user?.fullName || 'Người dùng'}</strong>
                    <span>{viRole(roleOf(user))}</span>
                </div>
                <button className="secondary compact-button" type="button" onClick={onLogout}>
                    Đăng xuất
                </button>
            </div>
        </header>
    );
}
