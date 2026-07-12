'use client';

import { useEffect, useMemo, useState } from 'react';

import Loading from '@/components/common/Loading';
import Modal from '@/components/common/Modal';
import DataTable from '@/components/table/DataTable';

import useAuth from '@/hooks/useAuth';

import {
    applyTemplate,
    createCriterion,
    deactivateCriterion,
    deleteCriterion,
    getCriteria,
    getTemplates,
    updateCriterion
} from '@/services/criteriaService';

import { getEvents } from '@/services/eventService';
import { getRounds } from '@/services/roundService';
import { getTracks } from '@/services/trackService';

import { isAdminRole, roleOf } from '@/utils/rbac';

const EMPTY_FORM = {
    criterionName: '',
    description: '',
    maxScore: '10',
    weight: '1',
    trackId: '',
    roundId: '',
    isActive: true
};

export default function CriteriaPage() {
    const { user } = useAuth() as any;

    const isAdmin = isAdminRole(roleOf(user));

    const [events, setEvents] = useState<any[]>([]);
    const [tracks, setTracks] = useState<any[]>([]);
    const [rounds, setRounds] = useState<any[]>([]);
    const [criteria, setCriteria] = useState<any[]>([]);
    const [templates, setTemplates] = useState<any[]>([]);

    const [eventId, setEventId] = useState('');
    const [filterTrackId, setFilterTrackId] =
        useState('');

    const [filterRoundId, setFilterRoundId] =
        useState('');

    const [templateId, setTemplateId] =
        useState('');

    const [form, setForm] =
        useState(EMPTY_FORM);

    const [editForm, setEditForm] =
        useState(EMPTY_FORM);

    const [selected, setSelected] =
        useState<any | null>(null);

    const [modal, setModal] = useState<
        'detail' | 'edit' | null
    >(null);

    const [loading, setLoading] =
        useState(true);

    const [message, setMessage] =
        useState('');

    const visibleCriteria = useMemo(
        () =>
            criteria.filter((item) => {
                if (
                    filterTrackId &&
                    String(
                        item.trackId || ''
                    ) !== filterTrackId
                ) {
                    return false;
                }

                if (
                    filterRoundId &&
                    String(
                        item.roundId || ''
                    ) !== filterRoundId
                ) {
                    return false;
                }

                return true;
            }),
        [
            criteria,
            filterTrackId,
            filterRoundId
        ]
    );

    const trackName = (id: any) =>
        id
            ? tracks.find(
                (track) =>
                    String(
                        track.trackId
                    ) === String(id)
            )?.trackName ||
            `#${id}`
            : 'Tất cả hạng mục';

    const roundName = (id: any) =>
        id
            ? rounds.find(
                (round) =>
                    String(
                        round.roundId
                    ) === String(id)
            )?.roundName ||
            `#${id}`
            : 'Tất cả vòng';

    const eventName = (id: any) =>
        events.find(
            (event) =>
                String(
                    event.eventId
                ) === String(id)
        )?.eventName || `#${id}`;

    async function loadEventData(
        nextEventId: string
    ) {
        if (!nextEventId) {
            setTracks([]);
            setRounds([]);
            setCriteria([]);

            return;
        }

        const [
            trackData,
            roundData,
            criterionData
        ] = await Promise.all([
            getTracks(nextEventId),
            getRounds(nextEventId),
            getCriteria(
                nextEventId,
                true
            )
        ]);

        setTracks(trackData);
        setRounds(roundData);
        setCriteria(criterionData);

        setForm((current) => ({
            ...current,
            trackId: String(
                trackData?.[0]
                    ?.trackId || ''
            ),
            roundId: String(
                roundData?.[0]
                    ?.roundId || ''
            )
        }));
    }

    async function load() {
        setLoading(true);
        setMessage('');

        try {
            const [
                eventData,
                templateData
            ] = await Promise.all([
                getEvents(),
                getTemplates()
            ]);

            const nextEventId =
                eventId ||
                String(
                    eventData?.[0]
                        ?.eventId || ''
                );

            setEvents(eventData);
            setEventId(nextEventId);
            setTemplates(templateData);

            setTemplateId(
                (current) =>
                    current ||
                    String(
                        templateData?.[0]
                            ?.templateId ||
                        ''
                    )
            );

            await loadEventData(
                nextEventId
            );
        } catch (error: any) {
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    }

    async function refreshCriteria() {
        if (eventId) {
            setCriteria(
                await getCriteria(
                    eventId,
                    true
                )
            );
        }
    }

    async function onCreate(
        event: React.FormEvent
    ) {
        event.preventDefault();

        try {
            await createCriterion({
                eventId: Number(
                    eventId
                ),
                trackId: Number(
                    form.trackId
                ),
                roundId: Number(
                    form.roundId
                ),
                criterionName:
                form.criterionName,
                description:
                form.description,
                maxScore: Number(
                    form.maxScore
                ),
                weight: Number(
                    form.weight
                )
            });

            setMessage(
                'Đã tạo tiêu chí.'
            );

            setForm({
                ...EMPTY_FORM,
                trackId:
                form.trackId,
                roundId:
                form.roundId
            });

            await refreshCriteria();
        } catch (error: any) {
            setMessage(error.message);
        }
    }

    function openDetail(
        row: any
    ) {
        setSelected(row);
        setModal('detail');
    }

    function openEdit(
        row: any
    ) {
        setSelected(row);

        setEditForm({
            criterionName:
                row.criterionName ||
                '',
            description:
                row.description ||
                '',
            maxScore: String(
                row.maxScore ??
                10
            ),
            weight: String(
                row.weight ?? 1
            ),
            trackId: String(
                row.trackId ||
                tracks?.[0]
                    ?.trackId ||
                ''
            ),
            roundId: String(
                row.roundId ||
                rounds?.[0]
                    ?.roundId ||
                ''
            ),
            isActive: Boolean(
                row.isActive
            )
        });

        setModal('edit');
    }

    async function onUpdate(
        event: React.FormEvent
    ) {
        event.preventDefault();

        try {
            await updateCriterion(
                selected.criterionId,
                {
                    trackId: Number(
                        editForm.trackId
                    ),
                    roundId: Number(
                        editForm.roundId
                    ),
                    criterionName:
                    editForm.criterionName,
                    description:
                    editForm.description,
                    maxScore: Number(
                        editForm.maxScore
                    ),
                    weight: Number(
                        editForm.weight
                    ),
                    isActive:
                    editForm.isActive
                }
            );

            setMessage(
                'Đã cập nhật tiêu chí.'
            );

            setModal(null);

            await refreshCriteria();
        } catch (error: any) {
            setMessage(error.message);
        }
    }

    async function onDeactivate(
        row: any
    ) {
        try {
            if (row.isActive) {
                await deactivateCriterion(
                    row.criterionId
                );
            } else {
                await updateCriterion(
                    row.criterionId,
                    {
                        isActive:
                            true
                    }
                );
            }

            setMessage(
                row.isActive
                    ? 'Đã chuyển tiêu chí sang Inactive.'
                    : 'Đã kích hoạt tiêu chí.'
            );

            await refreshCriteria();
        } catch (error: any) {
            setMessage(error.message);
        }
    }

    async function onDelete(
        row: any
    ) {
        if (
            !window.confirm(
                `Xóa tiêu chí “${row.criterionName}”?`
            )
        ) {
            return;
        }

        try {
            await deleteCriterion(
                row.criterionId
            );

            setMessage(
                'Đã xóa tiêu chí.'
            );

            await refreshCriteria();
        } catch (error: any) {
            setMessage(error.message);
        }
    }

    async function onApplyTemplate() {
        if (
            !templateId ||
            !eventId
        ) {
            return;
        }

        try {
            await applyTemplate(
                templateId,
                eventId,
                false
            );

            setMessage(
                'Đã bổ sung tiêu chí từ mẫu. Các tiêu chí mẫu áp dụng chung cho sự kiện.'
            );

            await refreshCriteria();
        } catch (error: any) {
            setMessage(error.message);
        }
    }

    useEffect(() => {
        load();
    }, []);

    useEffect(() => {
        if (
            eventId &&
            !loading
        ) {
            loadEventData(
                eventId
            ).catch(
                (error) =>
                    setMessage(
                        error.message
                    )
            );
        }
    }, [eventId]);

    if (loading) {
        return <Loading />;
    }

    if (!isAdmin) {
        return (
            <section className="card forbidden-card">
                <h2>
                    Không có quyền
                    truy cập
                </h2>

                <p className="muted">
                    Chỉ Admin/Điều
                    phối viên được
                    quản lý tiêu
                    chí.
                </p>
            </section>
        );
    }
    return <section className="grid">
        <div className="page-title">
            <div><h2>Quản lý Tiêu chí</h2><p className="muted">Mỗi tiêu chí được gắn với sự kiện, hạng mục và vòng thi cụ thể.</p></div>
            <button className="compact-button" onClick={load}>Làm mới</button>
        </div>
        {message && <div className="notice">{message}</div>}

        <section className="control-bar card">
            <label>Sự kiện<select value={eventId} onChange={(event) => setEventId(event.target.value)}>{events.map((item) => <option key={item.eventId} value={item.eventId}>{item.eventName}</option>)}</select></label>
            <label>Lọc hạng mục<select value={filterTrackId} onChange={(event) => setFilterTrackId(event.target.value)}><option value="">Tất cả</option>{tracks.map((item) => <option key={item.trackId} value={item.trackId}>{item.trackName}</option>)}</select></label>
            <label>Lọc vòng<select value={filterRoundId} onChange={(event) => setFilterRoundId(event.target.value)}><option value="">Tất cả</option>{rounds.map((item) => <option key={item.roundId} value={item.roundId}>{item.roundName}</option>)}</select></label>
        </section>

        <section className="grid grid-2">
            <div className="card">
                <h2>Tạo tiêu chí</h2>
                <form className="form-grid" onSubmit={onCreate}>
                    <label>Tên tiêu chí<input required value={form.criterionName} onChange={(event) => setForm({ ...form, criterionName: event.target.value })} /></label>
                    <label>Điểm tối đa<input required type="number" min="0.25" step="0.25" value={form.maxScore} onChange={(event) => setForm({ ...form, maxScore: event.target.value })} /></label>
                    <label>Hạng mục<select required value={form.trackId} onChange={(event) => setForm({ ...form, trackId: event.target.value })}>{tracks.map((item) => <option key={item.trackId} value={item.trackId}>{item.trackName}</option>)}</select></label>
                    <label>Vòng áp dụng<select required value={form.roundId} onChange={(event) => setForm({ ...form, roundId: event.target.value })}>{rounds.map((item) => <option key={item.roundId} value={item.roundId}>{item.roundName}</option>)}</select></label>
                    <label>Trọng số<input required type="number" min="0" step="0.01" value={form.weight} onChange={(event) => setForm({ ...form, weight: event.target.value })} /></label>
                    <label className="span-2">Mô tả<textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
                    <button className="compact-button">Tạo tiêu chí</button>
                </form>
            </div>
            <div className="card">
                <h2>Áp dụng mẫu có sẵn</h2>
                <p className="muted">Giữ lại chức năng mẫu tiêu chí hiện có. Tiêu chí từ mẫu áp dụng chung cho toàn sự kiện và có thể chỉnh sửa sau.</p>
                <div className="inline-actions">
                    <select value={templateId} onChange={(event) => setTemplateId(event.target.value)}>{templates.map((item) => <option key={item.templateId} value={item.templateId}>{item.templateName}</option>)}</select>
                    <button className="compact-button" onClick={onApplyTemplate}>Áp dụng</button>
                </div>
            </div>
        </section>

        <section className="card">
            <div className="section-title"><h2>Danh sách tiêu chí</h2><span>{visibleCriteria.length} tiêu chí</span></div>
            <DataTable
                columns={[
                    { title: 'Tên tiêu chí', key: 'criterionName' },
                    { title: 'Hạng mục', render: (row) => trackName(row.trackId) },
                    { title: 'Vòng', render: (row) => roundName(row.roundId) },
                    { title: 'Điểm tối đa', key: 'maxScore' },
                    { title: 'Trạng thái', render: (row) => <span className="table-badge">{row.isActive ? 'Active' : 'Inactive'}</span> },
                    { title: 'Thao tác', render: (row) => <div className="mini-actions"><button className="secondary" onClick={() => openDetail(row)}>Chi tiết</button><button className="secondary" onClick={() => openEdit(row)}>Sửa</button><button className="secondary" onClick={() => onDeactivate(row)}>{row.isActive ? 'Ngưng dùng' : 'Kích hoạt'}</button><button className="danger-button" onClick={() => onDelete(row)}>Xóa</button></div> }
                ]}
                data={visibleCriteria}
                rowKey="criterionId"
            />
        </section>

        <Modal open={modal === 'detail'} title="Chi tiết tiêu chí" onClose={() => setModal(null)}>
            {selected && <div className="detail-grid">
                <div><span>Tên tiêu chí</span><strong>{selected.criterionName}</strong></div>
                <div><span>Sự kiện</span><strong>{eventName(selected.eventId)}</strong></div>
                <div><span>Hạng mục</span><strong>{trackName(selected.trackId)}</strong></div>
                <div><span>Vòng áp dụng</span><strong>{roundName(selected.roundId)}</strong></div>
                <div><span>Điểm tối đa</span><strong>{selected.maxScore}</strong></div>
                <div><span>Trạng thái</span><strong>{selected.isActive ? 'Active' : 'Inactive'}</strong></div>
                <div className="span-2"><span>Mô tả</span><strong>{selected.description || '-'}</strong></div>
            </div>}
        </Modal>

        <Modal open={modal === 'edit'} title="Chỉnh sửa tiêu chí" onClose={() => setModal(null)}>
            <form className="form-grid" onSubmit={onUpdate}>
                <label>Tên tiêu chí<input required value={editForm.criterionName} onChange={(event) => setEditForm({ ...editForm, criterionName: event.target.value })} /></label>
                <label>Điểm tối đa<input required type="number" min="0.25x  " step="0.25" value={editForm.maxScore} onChange={(event) => setEditForm({ ...editForm, maxScore: event.target.value })} /></label>
                <label>Hạng mục<select value={editForm.trackId} onChange={(event) => setEditForm({ ...editForm, trackId: event.target.value })}>{tracks.map((item) => <option key={item.trackId} value={item.trackId}>{item.trackName}</option>)}</select></label>
                <label>Vòng áp dụng<select value={editForm.roundId} onChange={(event) => setEditForm({ ...editForm, roundId: event.target.value })}>{rounds.map((item) => <option key={item.roundId} value={item.roundId}>{item.roundName}</option>)}</select></label>
                <label>Trọng số<input type="number" min="0" step="0.01" value={editForm.weight} onChange={(event) => setEditForm({ ...editForm, weight: event.target.value })} /></label>
                <label>Trạng thái<select value={editForm.isActive ? 'true' : 'false'} onChange={(event) => setEditForm({ ...editForm, isActive: event.target.value === 'true' })}><option value="true">Active</option><option value="false">Inactive</option></select></label>
                <label className="span-2">Mô tả<textarea value={editForm.description} onChange={(event) => setEditForm({ ...editForm, description: event.target.value })} /></label>
                <button className="compact-button">Lưu thay đổi</button>
            </form>
        </Modal>
    </section>;
}
