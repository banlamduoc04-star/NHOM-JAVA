'use client';

import Link from 'next/link';
import { useState } from 'react';
import { requestPasswordReset, resetPassword } from '@/services/authService';

export default function ForgotPasswordPage() {
    const [step, setStep] = useState('request');
    const [form, setForm] = useState<any>({ email:'', resetCode:'', newPassword:'' });
    const [message, setMessage] = useState('');

    async function requestCode(e: any) {
        e.preventDefault();
        const data = await requestPasswordReset(form.email);
        setMessage(data.resetCodeForDemo ? `${data.message} Mã demo: ${data.resetCodeForDemo}` : data.message);
        setForm({...form, resetCode: data.resetCodeForDemo || ''});
        setStep('reset');
    }

    async function submitNewPassword(e: any) {
        e.preventDefault();
        const data = await resetPassword(form.email, form.resetCode, form.newPassword);
        setMessage(data.message);
    }

    return (
        <main className="auth-page">
            <section className="card auth-card">
                <span className="badge">Khôi phục tài khoản</span>
                <h2>Quên mật khẩu</h2>
                {message && <p className="success-text">{message}</p>}
                {step === 'request' ? (
                    <form className="grid" onSubmit={requestCode}>
                        <label>Email<input type="email" required value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})}/></label>
                        <button>Lấy mã đặt lại</button>
                    </form>
                ) : (
                    <form className="grid" onSubmit={submitNewPassword}>
                        <label>Email<input value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})}/></label>
                        <label>Mã đặt lại<input value={form.resetCode} onChange={(e)=>setForm({...form,resetCode:e.target.value})}/></label>
                        <label>Mật khẩu mới<input type="password" value={form.newPassword} onChange={(e)=>setForm({...form,newPassword:e.target.value})}/></label>
                        <button>Đặt lại mật khẩu</button>
                    </form>
                )}
                <p className="soft-gap"><Link className="text-link" href="/auth/login">Quay lại đăng nhập</Link></p>
            </section>
        </main>
    );
}