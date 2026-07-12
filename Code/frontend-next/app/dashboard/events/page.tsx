'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import Loading from '@/components/common/Loading';
import DataTable from '@/components/table/DataTable';

import useAuth from '@/hooks/useAuth';

import { seasonVi, viStatus } from '@/constants/role';

import { deleteEvent, getEvents } from '@/services/eventService';

import { formatDate } from '@/utils/formatDate';
import { canManageEvents } from '@/utils/rbac';

export default function EventsPage() {
    const { user } = useAuth() as any;

    const isAdmin = canManageEvents(user);

    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    async function load() {
        try {
            setEvents(await getEvents());
        } catch (e: any) {
            setMessage(e.message);
        } finally {
            setLoading(false);
        }
    }

    async function onDelete(row: any) {
        if (!confirm(`Xóa sự kiện ${row.eventName}?`)) {
            return;
        }

        try {
            await deleteEvent(row.eventId);

            setMessage('Đã xóa sự kiện');

            load();
        } catch (e: any) {
            setMessage(e.message);
        }
    }

    useEffect(() => {
        load();
    }, []);

    if (loading) {
        return <Loading />;
    }

    const columns: any[] = [
        {
            title: 'ID',
            key: 'eventId'
        },
        {
            title: 'Tên sự kiện',
            render: (r: any) => (
                <Link href={`/dashboard/events/${r.eventId}`}>
                    {r.eventName}
                </Link>
            )
        },
        {
            title: 'Mùa',
            render: (r: any) => seasonVi(r.season)
        },
        {
            title: 'Năm',
            key: 'eventYear'
        },
        {
            title: 'Trạng thái',
            render: (r: any) => (
                <span className="table-badge">
                    {viStatus(r.status)}
                </span>
            )
        },
        {
            title: 'Thời gian',
            render: (r: any) =>
                `${formatDate(r.startDate)} → ${formatDate(r.endDate)}`
        }
    ];

    if (isAdmin) {
        columns.push({
            title: 'Thao tác',
            render: (r: any) => (
                <div className="mini-actions">
                    <Link
                        className="text-link"
                        href={`/dashboard/events/edit?id=${r.eventId}`}
                    >
                        Sửa
                    </Link>

                    <button
                        className="secondary"
                        onClick={() => onDelete(r)}
                    >
                        Xóa
                    </button>
                </div>
            )
        });
    }

    return (
        <section className="grid">
            <div className="page-title">
                <div>
                    <h2>Sự kiện</h2>

                    <p className="muted">
                        Danh sách và trạng thái các event.
                    </p>
                </div>

                {isAdmin && (
                    <Link
                        className="button-link"
                        href="/dashboard/events/create"
                    >
                        Tạo sự kiện
                    </Link>
                )}
            </div>

            {message && (
                <div className="notice">
                    {message}
                </div>
            )}

            <section className="card">
                <DataTable
                    columns={columns}
                    data={events}
                    rowKey="eventId"
                />
            </section>
        </section>
    );
}