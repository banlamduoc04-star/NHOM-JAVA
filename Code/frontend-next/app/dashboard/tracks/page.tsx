'use client';

import { useEffect, useMemo, useState } from 'react';
import DataTable from '@/components/table/DataTable';
import Loading from '@/components/common/Loading';
import Modal from '@/components/common/Modal';
import useAuth from '@/hooks/useAuth';
import { getEvents } from '@/services/eventService';
import { createTrack, deleteTrack, getTrackMentors, getTracks, updateTrack } from '@/services/trackService';
import { getMyAssignmentDetails } from '@/services/judgeService';
import { isAdminRole, roleOf } from '@/utils/rbac';

const EMPTY_FORM = { trackName: '', description: '', status: 'Active' };

export default function TracksPage() {
    const { user } = useAuth() as any;
    const isAdmin = isAdminRole(roleOf(user));
    const [events, setEvents] = useState<any[]>([]);
    const [tracks, setTracks] = useState<any[]>([]);
    const [eventId, setEventId] = useState('');
    const [form, setForm] = useState(EMPTY_FORM);
    const [selected, setSelected] = useState<any | null>(null);
    const [editForm, setEditForm] = useState(EMPTY_FORM);
    const [mode, setMode] = useState<'detail' | 'edit' | null>(null);
    const [allowedTrackIds, setAllowedTrackIds] = useState<Set<string> | null>(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    const eventName = (id: any) => events.find((event) => String(event.eventId) === String(id))?.eventName || `#${id}`;
    const visibleTracks = useMemo(() => {
        const byEvent = eventId ? tracks.filter((track) => String(track.eventId) === String(eventId)) : tracks;
        if (isAdmin || allowedTrackIds === null) return byEvent;
        return byEvent.filter((track) => allowedTrackIds.has(String(track.trackId)));
    }, [tracks, eventId, isAdmin, allowedTrackIds]);

    async function load() {
        setLoading(true);
        setMessage('');
        try {
            const [eventData, trackData] = await Promise.all([getEvents(), getTracks()]);
            setEvents(eventData);
            setTracks(trackData);
            setEventId((current) => current || String(eventData?.[0]?.eventId || ''));

            if (!isAdmin) {
                const [assignmentData, legacyMentors] = await Promise.all([
                    getMyAssignmentDetails().catch(() => []),
                    getTrackMentors().catch(() => [])
                ]);
                const ids = new Set<string>();
                assignmentData.forEach((item: any) => ids.add(String(item.trackId)));
                legacyMentors.forEach((item: any) => ids.add(String(item.trackId)));
                setAllowedTrackIds(ids);
            } else {
                setAllowedTrackIds(null);
            }
        } catch (error: any) {
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    }

    async function onCreate(event: React.FormEvent) {
        event.preventDefault();
        try {
            await createTrack({ ...form, eventId: Number(eventId) });
            setForm(EMPTY_FORM);
            setMessage('Đã tạo hạng mục.');
            setTracks(await getTracks());
        } catch (error: any) {
            setMessage(error.message);
        }
    }

    function openDetail(row: any) {
        setSelected(row);
        setMode('detail');
    }

    function openEdit(row: any) {
        setSelected(row);
        setEditForm({
            trackName: row.trackName || '',
            description: row.description || '',
            status: row.status || 'Active'
        });
        setMode('edit');
    }

    async function onUpdate(event: React.FormEvent) {
        event.preventDefault();
        if (!selected?.trackId) return;
        try {
            await updateTrack(selected.trackId, editForm);
            setMessage('Đã cập nhật hạng mục.');
            setMode(null);
            setTracks(await getTracks());
        } catch (error: any) {
            setMessage(error.message);
        }
    }

    async function onDelete(row: any) {
        if (!window.confirm(`Xóa hạng mục “${row.trackName}”?`)) return;
        try {
            await deleteTrack(row.trackId);
            setMessage('Đã xóa hạng mục.');
            setTracks(await getTracks());
        } catch (error: any) {
            setMessage(error.message);
        }
    }

    useEffect(() => { load(); }, [isAdmin]);

    if (loading) return <Loading />;

    return <section className="grid">
        <div className="page-title">
            <div>
                <h2>{isAdmin ? 'Quản lý Hạng mục' : 'Hạng mục được phân công'}</h2>
                <p className="muted">Hạng mục được quản lý độc lập theo sự kiện và trạng thái.</p>
            </div>
            <button className="compact-button" onClick={load}>Làm mới</button>
        </div>

        {message && <div className="notice">{message}</div>}

        <section className="control-bar card">
            <label>Sự kiện
                <select value={eventId} onChange={(event) => setEventId(event.target.value)}>
                    {events.map((item) => <option key={item.eventId} value={item.eventId}>{item.eventName}</option>)}
                </select>
            </label>
        </section>

        {isAdmin && <section className="card">
            <div className="section-title"><h2>Tạo hạng mục</h2><span>Admin</span></div>
            <form className="form-grid" onSubmit={onCreate}>
                <label>Tên hạng mục
                    <input required value={form.trackName} onChange={(event) => setForm({ ...form, trackName: event.target.value })} />
                </label>
                <label>Trạng thái
                    <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select>
                </label>
                <label className="span-2">Mô tả
                    <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
                </label>
                <button className="compact-button">Tạo hạng mục</button>
            </form>
        </section>}

        <section className="card">
            <div className="section-title"><h2>Danh sách hạng mục</h2><span>{visibleTracks.length} hạng mục</span></div>
            <DataTable
                columns={[
                    { title: 'Tên hạng mục', key: 'trackName' },
                    { title: 'Mô tả', render: (row) => row.description || '-' },
                    { title: 'Sự kiện', render: (row) => eventName(row.eventId) },
                    { title: 'Trạng thái', render: (row) => <span className="table-badge">{row.status || 'Active'}</span> },
                    {
                        title: 'Thao tác', render: (row) => <div className="mini-actions">
                            <button className="secondary" onClick={() => openDetail(row)}>Chi tiết</button>
                            {isAdmin && <button className="secondary" onClick={() => openEdit(row)}>Sửa</button>}
                            {isAdmin && <button className="danger-button" onClick={() => onDelete(row)}>Xóa</button>}
                        </div>
                    }
                ]}
                data={visibleTracks}
                rowKey="trackId"
            />
        </section>

        <Modal open={mode === 'detail'} title="Chi tiết hạng mục" onClose={() => setMode(null)}>
            {selected && <div className="detail-grid">
                <div><span>Tên hạng mục</span><strong>{selected.trackName}</strong></div>
                <div><span>Sự kiện</span><strong>{eventName(selected.eventId)}</strong></div>
                <div><span>Trạng thái</span><strong>{selected.status || 'Active'}</strong></div>
                <div className="span-2"><span>Mô tả</span><strong>{selected.description || '-'}</strong></div>
            </div>}
        </Modal>

        <Modal open={mode === 'edit'} title="Chỉnh sửa hạng mục" onClose={() => setMode(null)}>
            <form className="form-grid" onSubmit={onUpdate}>
                <label>Tên hạng mục
                    <input required value={editForm.trackName} onChange={(event) => setEditForm({ ...editForm, trackName: event.target.value })} />
                </label>
                <label>Trạng thái
                    <select value={editForm.status} onChange={(event) => setEditForm({ ...editForm, status: event.target.value })}>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select>
                </label>
                <label className="span-2">Mô tả
                    <textarea value={editForm.description} onChange={(event) => setEditForm({ ...editForm, description: event.target.value })} />
                </label>
                <button className="compact-button">Lưu thay đổi</button>
            </form>
        </Modal>
    </section>;
}
