'use client';

import { useEffect, useState } from 'react';
import {
    useRouter,
    useSearchParams
} from 'next/navigation';

import Loading from '@/components/common/Loading';

import useAuth from '@/hooks/useAuth';

import {
    getEvent,
    updateEvent
} from '@/services/eventService';

import { canManageEvents } from '@/utils/rbac';

export default function EditEventPage() {
    const { user } = useAuth() as any;

    const id = useSearchParams().get('id');

    const router = useRouter();

    const [form, setForm] = useState<any>(null);

    const [message, setMessage] = useState('');

    useEffect(() => {
        if (id && canManageEvents(user)) {
            getEvent(id)
                .then((e) =>
                    setForm({
                        eventName: e.eventName || '',
                        season: e.season || 'Summer',
                        eventYear: e.eventYear || '',
                        startDate: e.startDate || '',
                        endDate: e.endDate || '',
                        status: e.status || 'Draft',
                        description: e.description || ''
                    })
                )
                .catch((e) => setMessage(e.message));
        }
    }, [id, user]);

    if (!canManageEvents(user)) {
        return (
            <section className="card">
                <span className="badge">
                    403 Forbidden
                </span>

                <h2>
                    Không có quyền sửa sự kiện
                </h2>
            </section>
        );
    }

    async function onSubmit(e: any) {
        e.preventDefault();

        if (!id) {
            return;
        }

        try {
            await updateEvent(id, {
                ...form,
                eventYear: Number(form.eventYear)
            });

            router.push('/dashboard/events');
        } catch (err: any) {
            setMessage(err.message);
        }
    }

    if (!id) {
        return (
            <div className="notice error">
                Thiếu id:
                /dashboard/events/edit?id=1
            </div>
        );
    }

    if (!form && !message) {
        return <Loading />;
    }

    return (
        <section className="card">
            <div className="section-title">
                <h2>Sửa sự kiện #{id}</h2>

                <span>Admin</span>
            </div>

            {message && (
                <p className="error-text">
                    {message}
                </p>
            )}

            {form && (
                <form
                    className="form-grid"
                    onSubmit={onSubmit}
                >
                    <label>
                        Tên sự kiện

                        <input
                            value={form.eventName}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    eventName:
                                    e.target.value
                                })
                            }
                        />
                    </label>

                    <label>
                        Mùa

                        <select
                            value={form.season}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    season:
                                    e.target.value
                                })
                            }
                        >
                            <option value="Spring">
                                Mùa Xuân
                            </option>

                            <option value="Summer">
                                Mùa Hè
                            </option>

                            <option value="Fall">
                                Mùa Thu
                            </option>
                        </select>
                    </label>

                    <label>
                        Năm

                        <input
                            value={form.eventYear}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    eventYear:
                                    e.target.value
                                })
                            }
                        />
                    </label>

                    <label>
                        Trạng thái

                        <select
                            value={form.status}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    status:
                                    e.target.value
                                })
                            }
                        >
                            <option value="Draft">
                                Bản nháp
                            </option>

                            <option value="Open">
                                Đang mở
                            </option>

                            <option value="Closed">
                                Đã đóng
                            </option>
                        </select>
                    </label>

                    <label>
                        Ngày bắt đầu

                        <input
                            type="date"
                            value={form.startDate}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    startDate:
                                    e.target.value
                                })
                            }
                        />
                    </label>

                    <label>
                        Ngày kết thúc

                        <input
                            type="date"
                            value={form.endDate}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    endDate:
                                    e.target.value
                                })
                            }
                        />
                    </label>

                    <label className="span-2">
                        Mô tả

                        <textarea
                            value={form.description}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    description:
                                    e.target.value
                                })
                            }
                        />
                    </label>

                    <button>
                        Cập nhật
                    </button>
                </form>
            )}
        </section>
    );
}