'use client';

import { useEffect, useState } from 'react';
import { login, register, requestPasswordReset, resetPassword } from '@/lib/api';

type AuthMode = 'login' | 'register' | 'forgot' | 'reset';

const features = [
    'Quản lý sự kiện SEAL Spring, Summer, Fall và nhiều vòng thi trong từng sự kiện.',
    'Đăng ký đội 3–5 thành viên, phân loại sinh viên FPT/sinh viên trường đối tác và phê duyệt tài khoản.',
    'Chấm điểm theo tiêu chí, lưu riêng điểm từng giám khảo, tự động xếp hạng và xét thăng vòng.',
    'Nhật ký kiểm tra cho hành động chấm điểm, loại bài, công bố kết quả và trao giải.',
    'Xuất dữ liệu RBL đã ẩn danh để nghiên cứu độ tin cậy liên đánh giá viên.'
];

const actors = ['Thành viên đội', 'Trưởng nhóm', 'Mentor', 'Giám khảo', 'Ban tổ chức SE/PDP'];

export default function HomePage() {
    const [mode, setMode] = useState<AuthMode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [studentType, setStudentType] = useState('FPT');
    const [fptStudentCode, setFptStudentCode] = useState('');
    const [externalStudentCode, setExternalStudentCode] = useState('');
    const [universityName, setUniversityName] = useState('');
    const [resetCode, setResetCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [notice, setNotice] = useState('');
    const [error, setError] = useState('');
    const [checkingAuth, setCheckingAuth] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('seal_token');
        const storedUser = localStorage.getItem('seal_user');
        if (token && storedUser) {
            window.location.replace('/dashboard');
            return;
        }
        setCheckingAuth(false);
    }, []);

    function switchMode(nextMode: AuthMode) {
        setMode(nextMode);
        setError('');
        setNotice('');
    }

    async function onLogin(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setNotice('');
        try {
            const data = await login(email, password);
            localStorage.setItem('seal_token', data.token);
            localStorage.setItem('seal_user', JSON.stringify(data));
            window.location.href = '/dashboard';
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Đăng nhập không thành công');
        }
    }

    async function onRegister(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setNotice('');
        try {
            await register({
                email,
                password,
                fullName,
                studentType,
                fptStudentCode: studentType === 'FPT' ? fptStudentCode : undefined,
                externalStudentCode: studentType === 'External' ? externalStudentCode : undefined,
                universityName: studentType === 'External' ? universityName : undefined
            });
            setNotice('Đăng ký thành công. Tài khoản cần Ban tổ chức phê duyệt trước khi tham gia thi.');
            setMode('login');
            setPassword('');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Đăng ký không thành công');
        }
    }

    async function onForgotPassword(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setNotice('');
        try {
            const data = await requestPasswordReset(email);
            if (data.resetCodeForDemo) {
                setResetCode(data.resetCodeForDemo);
                setNotice(`${data.message} Mã đặt lại demo: ${data.resetCodeForDemo}`);
            } else {
                setNotice(data.message);
            }
            setMode('reset');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Không thể tạo yêu cầu đặt lại mật khẩu');
        }
    }

    async function onResetPassword(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setNotice('');
        try {
            const data = await resetPassword(email, resetCode, newPassword);
            setNotice(data.message);
            setPassword('');
            setNewPassword('');
            setResetCode('');
            setMode('login');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Đặt lại mật khẩu không thành công');
        }
    }

    if (checkingAuth) return null;

    return (
        <main>
            <section className="hero">
                <div className="container hero-grid">
                    <div className="hero-copy">
                        <span className="badge">SU26SWP04 · SEAL Hackathon</span>
                        <h1>Hệ thống quản lý cuộc thi SEAL Hackathon ngành Kỹ thuật Phần mềm</h1>
                        <p>
                            Nền tảng web hỗ trợ Ban tổ chức quản lý sự kiện, vòng thi, hạng mục, đội thi, mentor,
                            giám khảo, bài nộp, chấm điểm, xếp hạng, công bố giải thưởng và thu thập dữ liệu nghiên cứu RBL.
                        </p>
                        <div className="hero-actions">
                            <a className="button-link" href="#dang-nhap">Vào hệ thống</a>
                            <a className="button-link secondary-link" href="#chuc-nang">Xem chức năng</a>
                        </div>
                    </div>

                    <div className="card auth-card" id="dang-nhap">
                        <div className="tab-row">
                            <button className={mode === 'login' || mode === 'forgot' || mode === 'reset' ? 'tab active' : 'tab'} onClick={() => switchMode('login')} type="button">Đăng nhập</button>
                            <button className={mode === 'register' ? 'tab active' : 'tab'} onClick={() => switchMode('register')} type="button">Đăng ký sinh viên</button>
                        </div>

                        {mode === 'login' && (
                            <form className="grid" onSubmit={onLogin}>
                                <h2>Đăng nhập</h2>
                                <label>Email<input type="email" autoComplete="username" required value={email} placeholder="Nhập email tài khoản" onChange={e => setEmail(e.target.value)} /></label>
                                <label>Mật khẩu<input type="password" autoComplete="current-password" required value={password} placeholder="Nhập mật khẩu" onChange={e => setPassword(e.target.value)} /></label>
                                {error && <p className="error-text">{error}</p>}
                                {notice && <p className="success-text">{notice}</p>}
                                <button type="submit">Đăng nhập vào dashboard</button>
                                <button className="link-button" type="button" onClick={() => switchMode('forgot')}>Quên mật khẩu?</button>
                            </form>
                        )}

                        {mode === 'forgot' && (
                            <form className="grid" onSubmit={onForgotPassword}>
                                <h2>Quên mật khẩu</h2>
                                <p className="muted small">Nhập email đã đăng ký. Hệ thống sẽ tạo mã đặt lại mật khẩu có hiệu lực trong 15 phút.</p>
                                <label>Email<input type="email" autoComplete="username" required value={email} placeholder="Nhập email cần đặt lại" onChange={e => setEmail(e.target.value)} /></label>
                                {error && <p className="error-text">{error}</p>}
                                {notice && <p className="success-text">{notice}</p>}
                                <button type="submit">Tạo mã đặt lại mật khẩu</button>
                                <button className="link-button" type="button" onClick={() => switchMode('login')}>Quay lại đăng nhập</button>
                            </form>
                        )}

                        {mode === 'reset' && (
                            <form className="grid" onSubmit={onResetPassword}>
                                <h2>Đặt lại mật khẩu</h2>
                                <label>Email<input type="email" autoComplete="username" required value={email} placeholder="Nhập email tài khoản" onChange={e => setEmail(e.target.value)} /></label>
                                <label>Mã đặt lại<input required value={resetCode} placeholder="Nhập mã đặt lại" onChange={e => setResetCode(e.target.value)} /></label>
                                <label>Mật khẩu mới<input type="password" autoComplete="new-password" required value={newPassword} placeholder="Ít nhất 6 ký tự" onChange={e => setNewPassword(e.target.value)} /></label>
                                {error && <p className="error-text">{error}</p>}
                                {notice && <p className="success-text">{notice}</p>}
                                <button type="submit">Cập nhật mật khẩu mới</button>
                                <button className="link-button" type="button" onClick={() => switchMode('login')}>Quay lại đăng nhập</button>
                            </form>
                        )}

                        {mode === 'register' && (
                            <form className="grid" onSubmit={onRegister}>
                                <h2>Đăng ký tham gia</h2>
                                <label>Họ và tên<input required value={fullName} placeholder="Nhập họ và tên" onChange={e => setFullName(e.target.value)} /></label>
                                <label>Email<input type="email" autoComplete="username" required value={email} placeholder="Nhập email" onChange={e => setEmail(e.target.value)} /></label>
                                <label>Mật khẩu<input type="password" autoComplete="new-password" required value={password} placeholder="Tạo mật khẩu" onChange={e => setPassword(e.target.value)} /></label>
                                <label>Loại sinh viên
                                    <select value={studentType} onChange={e => setStudentType(e.target.value)}>
                                        <option value="FPT">Sinh viên FPT</option>
                                        <option value="External">Sinh viên ngoài trường</option>
                                    </select>
                                </label>
                                {studentType === 'FPT' ? (
                                    <label>Mã số sinh viên FPT<input required value={fptStudentCode} placeholder="Nhập mã số sinh viên FPT" onChange={e => setFptStudentCode(e.target.value)} /></label>
                                ) : (
                                    <>
                                        <label>Mã số sinh viên<input required value={externalStudentCode} placeholder="Nhập mã số sinh viên" onChange={e => setExternalStudentCode(e.target.value)} /></label>
                                        <label>Tên trường<input required value={universityName} placeholder="Nhập tên trường" onChange={e => setUniversityName(e.target.value)} /></label>
                                    </>
                                )}
                                {error && <p className="error-text">{error}</p>}
                                {notice && <p className="success-text">{notice}</p>}
                                <button type="submit">Gửi đăng ký chờ phê duyệt</button>
                            </form>
                        )}
                    </div>
                </div>
            </section>

            <section className="container section-grid" id="chuc-nang">
                <div className="card">
                    <h2>Vấn đề hệ thống giải quyết</h2>
                    <p className="muted">
                        Quy trình thủ công bằng Excel dễ gây sai sót, chậm tổng hợp điểm, thiếu kênh liên lạc và thiếu minh bạch.
                        Hệ thống này số hóa toàn bộ quy trình tổ chức SEAL, đồng thời lưu dữ liệu chấm điểm phục vụ nghiên cứu công bằng trong đánh giá.
                    </p>
                </div>
                <div className="card">
                    <h2>Tác nhân chính</h2>
                    <div className="pill-list">{actors.map(actor => <span className="pill" key={actor}>{actor}</span>)}</div>
                </div>
            </section>

            <section className="container grid grid-2">
                <div className="card feature-card">
                    <h2>Chức năng nghiệp vụ</h2>
                    <ul className="check-list">{features.map(item => <li key={item}>{item}</li>)}</ul>
                </div>
                <div className="card feature-card">
                    <h2>Hướng nghiên cứu RBL</h2>
                    <p className="muted">
                        Dữ liệu điểm được lưu theo từng tiêu chí, từng giám khảo và từng bài nộp thay vì gộp chung. Dashboard hỗ trợ quan sát phương sai điểm,
                        phân bố điểm vòng hiệu chuẩn và xuất CSV ẩn danh để phân tích độ tin cậy liên đánh giá viên.
                    </p>
                    <div className="metric-row">
                        <div><strong>Top N</strong><span>Quy tắc thăng vòng</span></div>
                        <div><strong>CSV</strong><span>Xuất dữ liệu ẩn danh</span></div>
                        <div><strong>Audit</strong><span>Nhật ký minh bạch</span></div>
                    </div>
                </div>
            </section>
        </main>
    );
}
