'use client';

import useAuth from '@/hooks/useAuth';
import { viRole } from '@/constants/role';

export default function ProfilePage() {
    const { user, logout } = useAuth() as any;

    return <section className="grid">
        <div className="page-title"><div><h2>Hồ sơ</h2><p className="muted">Thông tin tài khoản đang đăng nhập.</p></div><button className="secondary" onClick={logout}>Đăng xuất</button></div>
        <section className="card"><div className="metric-row"><div><strong>{user?.fullName||'-'}</strong><span>Họ tên</span></div><div><strong>{user?.email||'-'}</strong><span>Email</span></div><div><strong>{viRole(user?.role||user?.roleName)}</strong><span>Vai trò</span></div><div><strong>{user?.isApproved?'Đã duyệt':'Chưa duyệt'}</strong><span>Trạng thái</span></div></div></section>
        <section className="card"><h2>Dữ liệu user trong localStorage</h2><pre className="notice">{JSON.stringify(user,null,2)}</pre></section>
    </section>;
}