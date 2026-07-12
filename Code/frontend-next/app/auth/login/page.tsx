'use client';

import Link from 'next/link';
import { useState } from 'react';

import { login } from '@/services/authService';
import { saveSession } from '@/services/api';


export default function LoginPage() {

    const [form, setForm] = useState<any>({
        email: '',
        password: ''
    });

    const [message, setMessage] = useState('');


    async function onSubmit(e: any) {

        e.preventDefault();

        setMessage('');


        try {

            const data = await login(
                form.email,
                form.password
            );


            saveSession(data);


            window.location.href = '/dashboard';

        } catch (err: any) {

            setMessage(
                err.message || 'Đăng nhập không thành công'
            );
        }
    }


    return (
        <main className="auth-page">

            <section className="card auth-card">

                <span className="badge">
                    SEAL Hackathon
                </span>


                <h2>
                    Đăng nhập
                </h2>


                {message && (
                    <p className="error-text">
                        {message}
                    </p>
                )}


                <form
                    className="grid"
                    onSubmit={onSubmit}
                >

                    <label>
                        Email

                        <input
                            type="email"
                            required
                            value={form.email}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    email: e.target.value
                                })
                            }
                        />

                    </label>


                    <label>
                        Mật khẩu

                        <input
                            type="password"
                            required
                            value={form.password}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    password: e.target.value
                                })
                            }
                        />

                    </label>


                    <button>
                        Đăng nhập
                    </button>

                </form>


                <div className="inline-actions soft-gap">

                    <Link href="/auth/register">
                        Đăng ký
                    </Link>


                    <Link href="/auth/forgot-password">
                        Quên mật khẩu
                    </Link>

                </div>

            </section>

        </main>
    );
}