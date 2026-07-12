'use client';

import Link from 'next/link';
import { useState } from 'react';

import { register } from '@/services/authService';


export default function RegisterPage() {

    const [form, setForm] = useState<any>({
        email: '',
        password: '',
        fullName: '',
        studentType: 'FPT',
        fptStudentCode: '',
        externalStudentCode: '',
        universityName: ''
    });

    const [message, setMessage] = useState('');

    const [error, setError] = useState(false);


    async function onSubmit(e: any) {

        e.preventDefault();

        setMessage('');
        setError(false);


        try {

            await register({
                email: form.email,
                password: form.password,
                fullName: form.fullName,
                studentType: form.studentType,

                fptStudentCode:
                    form.studentType === 'FPT'
                        ? form.fptStudentCode
                        : undefined,

                externalStudentCode:
                    form.studentType === 'EXTERNAL'
                        ? form.externalStudentCode
                        : undefined,

                universityName:
                    form.studentType === 'EXTERNAL'
                        ? form.universityName
                        : undefined
            });


            setMessage(
                'Đăng ký thành công. Tài khoản cần Ban tổ chức phê duyệt.'
            );


        } catch (err: any) {

            setError(true);

            setMessage(
                err.message || 'Đăng ký không thành công'
            );
        }
    }


    return (
        <main className="auth-page">

            <section className="card auth-card">

                <span className="badge">
                    Tài khoản đội thi
                </span>


                <h2>
                    Đăng ký
                </h2>


                {message && (
                    <p className={error ? 'error-text' : 'success-text'}>
                        {message}
                    </p>
                )}


                <form
                    className="form-grid"
                    onSubmit={onSubmit}
                >

                    <label className="span-2">
                        Họ & tên

                        <input
                            required
                            value={form.fullName}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    fullName: e.target.value
                                })
                            }
                        />

                    </label>


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


                    <label>
                        Loại sinh viên

                        <select
                            value={form.studentType}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    studentType: e.target.value
                                })
                            }
                        >

                            <option value="FPT">
                                FPT
                            </option>

                            <option value="EXTERNAL">
                                Trường đối tác
                            </option>

                        </select>

                    </label>


                    {
                        form.studentType === 'FPT'

                            ? (

                                <label>
                                    Mã SV FPT

                                    <input
                                        value={form.fptStudentCode}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                fptStudentCode: e.target.value
                                            })
                                        }
                                    />

                                </label>

                            )

                            : (

                                <>

                                    <label>
                                        Mã SV đối tác

                                        <input
                                            value={form.externalStudentCode}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    externalStudentCode: e.target.value
                                                })
                                            }
                                        />

                                    </label>


                                    <label className="span-2">
                                        Tên trường

                                        <input
                                            value={form.universityName}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    universityName: e.target.value
                                                })
                                            }
                                        />

                                    </label>

                                </>

                            )
                    }


                    <button>
                        Gửi đăng ký
                    </button>

                </form>


                <p className="soft-gap">

                    <Link
                        className="text-link"
                        href="/auth/login"
                    >
                        Quay lại đăng nhập
                    </Link>

                </p>

            </section>

        </main>
    );
}