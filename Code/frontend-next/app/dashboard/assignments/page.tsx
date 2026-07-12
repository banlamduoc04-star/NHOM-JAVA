'use client';

import { useEffect, useMemo, useState } from 'react';

import Loading from '@/components/common/Loading';
import DataTable from '@/components/table/DataTable';

import useAuth from '@/hooks/useAuth';

import {
    assignJudge,
    getAssignmentDetails,
    getUsers,
    removeJudgeAssignment,
    updateJudgeAssignment
} from '@/services/judgeService';

import { getEvents } from '@/services/eventService';
import { getRounds } from '@/services/roundService';
import { getTeamsWithStats } from '@/services/teamService';
import { getTracks } from '@/services/trackService';

import { viRole } from '@/constants/role';

import { isAdminRole, roleOf } from '@/utils/rbac';

export default function AssignmentsPage() {
    const { user } = useAuth() as any;

    const isAdmin = isAdminRole(roleOf(user));

    const [events, setEvents] = useState<any[]>([]);
    const [tracks, setTracks] = useState<any[]>([]);
    const [rounds, setRounds] = useState<any[]>([]);
    const [staff, setStaff] = useState<any[]>([]);
    const [teams, setTeams] = useState<any[]>([]);
    const [assignments, setAssignments] = useState<any[]>([]);

    const [eventId, setEventId] = useState('');
    const [trackId, setTrackId] = useState('');
    const [roundId, setRoundId] = useState('');
    const [assigneeId, setAssigneeId] = useState('');

    const [assignAllTeams, setAssignAllTeams] = useState(true);

    const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);

    const [editingAssignmentId, setEditingAssignmentId] =
        useState<string>('');

    const [filterEventId, setFilterEventId] = useState('');
    const [filterTrackId, setFilterTrackId] = useState('');
    const [filterRoundId, setFilterRoundId] = useState('');

    const [loading, setLoading] = useState(true);
    const [teamsLoading, setTeamsLoading] = useState(false);

    const [message, setMessage] = useState('');

    const eventTracks = useMemo(
        () =>
            tracks.filter(
                (item) =>
                    String(item.eventId) === String(eventId)
            ),
        [tracks, eventId]
    );

    const eventRounds = useMemo(
        () =>
            rounds.filter(
                (item) =>
                    String(item.eventId) === String(eventId)
            ),
        [rounds, eventId]
    );

    const visibleAssignments = useMemo(
        () =>
            assignments.filter((item) => {
                if (
                    filterEventId &&
                    String(item.eventId) !== filterEventId
                ) {
                    return false;
                }

                if (
                    filterTrackId &&
                    String(item.trackId) !== filterTrackId
                ) {
                    return false;
                }

                if (
                    filterRoundId &&
                    String(item.roundId) !== filterRoundId
                ) {
                    return false;
                }

                return true;
            }),
        [
            assignments,
            filterEventId,
            filterTrackId,
            filterRoundId
        ]
    );

    async function load() {
        setLoading(true);
        setMessage('');

        try {
            const [
                eventData,
                trackData,
                roundData,
                userData,
                assignmentData
            ] = await Promise.all([
                getEvents(),
                getTracks(),
                getRounds(),
                getUsers(),
                getAssignmentDetails()
            ]);

            const assignable = userData.filter(
                (item: any) =>
                    [
                        'Judge',
                        'GuestJudge',
                        'Mentor'
                    ].includes(item.roleName) &&
                    (
                        item.accountStatus ||
                        (item.isApproved
                            ? 'Active'
                            : 'Pending')
                    ) === 'Active'
            );

            const nextEventId =
                eventId ||
                String(eventData?.[0]?.eventId || '');

            const nextTracks = trackData.filter(
                (item: any) =>
                    String(item.eventId) === nextEventId
            );

            const nextRounds = roundData.filter(
                (item: any) =>
                    String(item.eventId) === nextEventId
            );

            setEvents(eventData);
            setTracks(trackData);
            setRounds(roundData);
            setStaff(assignable);
            setAssignments(assignmentData);

            setEventId(nextEventId);

            setTrackId(
                (current) =>
                    current ||
                    String(
                        nextTracks?.[0]?.trackId || ''
                    )
            );

            setRoundId(
                (current) =>
                    current ||
                    String(
                        nextRounds?.[0]?.roundId || ''
                    )
            );

            setAssigneeId(
                (current) =>
                    current ||
                    String(
                        assignable?.[0]?.userId || ''
                    )
            );
        } catch (error: any) {
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    }

    async function loadTeams() {
        if (!eventId || !trackId || !isAdmin) {
            setTeams([]);
            return;
        }

        setTeamsLoading(true);

        try {
            const data = await getTeamsWithStats({
                eventId,
                trackId
            });

            const eligibleTeams = data.filter(
                (team: any) =>
                    String(team.status).toLowerCase() ===
                    'approved' &&
                    Number(team.memberCount) >= 3 &&
                    Number(team.memberCount) <= 5
            );

            setTeams(eligibleTeams);

            setSelectedTeamIds((current) =>
                current.filter((id) =>
                    eligibleTeams.some(
                        (team: any) =>
                            String(team.teamId) === id
                    )
                )
            );
        } catch (error: any) {
            setMessage(error.message);
            setTeams([]);
        } finally {
            setTeamsLoading(false);
        }
    }

    async function onAssign(
        event: React.FormEvent
    ) {
        event.preventDefault();

        if (
            !assignAllTeams &&
            selectedTeamIds.length === 0
        ) {
            setMessage(
                'Hãy chọn ít nhất một đội hoặc bật tùy chọn áp dụng cho toàn bộ đội.'
            );

            return;
        }

        try {
            const payload = {
                judgeId: Number(assigneeId),
                trackId: Number(trackId),
                roundId: Number(roundId),
                teamIds: assignAllTeams
                    ? []
                    : selectedTeamIds.map(Number)
            };

            if (editingAssignmentId) {
                await updateJudgeAssignment(
                    editingAssignmentId,
                    payload
                );
            } else {
                await assignJudge(payload);
            }

            setMessage(
                editingAssignmentId
                    ? 'Đã cập nhật phân công.'
                    : assignAllTeams
                        ? 'Đã phân công cho toàn bộ đội hợp lệ thuộc hạng mục.'
                        : `Đã phân công cho ${selectedTeamIds.length} đội đã chọn.`
            );

            setAssignments(
                await getAssignmentDetails()
            );

            setSelectedTeamIds([]);
            setAssignAllTeams(true);
            setEditingAssignmentId('');
        } catch (error: any) {
            setMessage(error.message);
        }
    }

    async function onDelete(id: any) {
        if (
            !window.confirm(
                'Xóa phân công này?'
            )
        ) {
            return;
        }

        try {
            await removeJudgeAssignment(id);

            setMessage(
                'Đã xóa phân công.'
            );

            if (
                String(id) ===
                editingAssignmentId
            ) {
                setEditingAssignmentId('');
                setAssignAllTeams(true);
                setSelectedTeamIds([]);
            }

            setAssignments(
                await getAssignmentDetails()
            );
        } catch (error: any) {
            setMessage(error.message);
        }
    }

    function toggleTeam(teamId: any) {
        const id = String(teamId);

        setSelectedTeamIds((current) =>
            current.includes(id)
                ? current.filter(
                    (item) => item !== id
                )
                : [...current, id]
        );
    }

    function onEdit(row: any) {
        setEditingAssignmentId(
            String(row.assignmentId)
        );

        setEventId(
            String(row.eventId || '')
        );

        setTrackId(
            String(row.trackId || '')
        );

        setRoundId(
            String(row.roundId || '')
        );

        setAssigneeId(
            String(row.assigneeId || '')
        );

        setAssignAllTeams(
            Boolean(
                row.allTeamsInCategory
            )
        );

        setSelectedTeamIds(
            row.allTeamsInCategory
                ? []
                : (
                    row.teams || []
                ).map((team: any) =>
                    String(team.teamId)
                )
        );

        setMessage(
            'Đang chỉnh sửa phân công. Thay đổi thông tin và nhấn Cập nhật.'
        );

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    function cancelEdit() {
        setEditingAssignmentId('');
        setAssignAllTeams(true);
        setSelectedTeamIds([]);
        setMessage('');
    }

    useEffect(() => {
        load();
    }, [isAdmin]);

    useEffect(() => {
        const nextTracks = tracks.filter(
            (item) =>
                String(item.eventId) ===
                String(eventId)
        );

        const nextRounds = rounds.filter(
            (item) =>
                String(item.eventId) ===
                String(eventId)
        );

        if (
            !nextTracks.some(
                (item) =>
                    String(item.trackId) ===
                    trackId
            )
        ) {
            setTrackId(
                String(
                    nextTracks?.[0]
                        ?.trackId || ''
                )
            );
        }

        if (
            !nextRounds.some(
                (item) =>
                    String(item.roundId) ===
                    roundId
            )
        ) {
            setRoundId(
                String(
                    nextRounds?.[0]
                        ?.roundId || ''
                )
            );
        }
    }, [
        eventId,
        tracks,
        rounds,
        trackId,
        roundId
    ]);

    useEffect(() => {
        loadTeams();
    }, [
        eventId,
        trackId,
        isAdmin
    ]);

    if (loading) {
        return <Loading />;
    }

    if (!isAdmin) {
        return (
            <section className="card forbidden-card">
                <h2>
                    Không có quyền truy cập
                </h2>

                <p className="muted">
                    Judge/Mentor chỉ xem dữ
                    liệu được phân công tại
                    các trang nghiệp vụ tương
                    ứng.
                </p>
            </section>
        );
    }

    return <section className="grid">
        <div className="page-title">
            <div><h2>Assignments</h2><p className="muted">Phân công Judge/Mentor theo Event, Category, Round và phạm vi đội cụ thể.</p></div>
            <button className="compact-button" onClick={load}>Làm mới</button>
        </div>
        {message && <div className="notice">{message}</div>}

        <section className="card">
            <div className="section-title">
                <h2>{editingAssignmentId ? 'Chỉnh sửa phân công' : 'Tạo phân công'}</h2>
                {editingAssignmentId && <button type="button" className="secondary compact-button" onClick={cancelEdit}>Hủy chỉnh sửa</button>}
            </div>
            <form className="form-grid" onSubmit={onAssign}>
                <label>Event<select required value={eventId} onChange={(event) => setEventId(event.target.value)}>{events.map((item) => <option key={item.eventId} value={item.eventId}>{item.eventName}</option>)}</select></label>
                <label>Category<select required value={trackId} onChange={(event) => setTrackId(event.target.value)}>{eventTracks.map((item) => <option key={item.trackId} value={item.trackId}>{item.trackName}</option>)}</select></label>
                <label>Round<select required value={roundId} onChange={(event) => setRoundId(event.target.value)}>{eventRounds.map((item) => <option key={item.roundId} value={item.roundId}>{item.roundName}</option>)}</select></label>
                <label>Judge / Mentor<select required value={assigneeId} onChange={(event) => setAssigneeId(event.target.value)}>{staff.map((item) => <option key={item.userId} value={item.userId}>{item.fullName} · {viRole(item.roleName)}</option>)}</select></label>

                <div className="assignment-team-picker">
                    <label className="checkbox-line">
                        <input type="checkbox" checked={assignAllTeams} onChange={(event) => setAssignAllTeams(event.target.checked)} />
                        Áp dụng cho toàn bộ đội hợp lệ hiện tại và đội hợp lệ được thêm sau trong Category
                    </label>
                    {!assignAllTeams && <>
                        <div className="section-title"><strong>Chọn đội</strong><span>{selectedTeamIds.length}/{teams.length} đội</span></div>
                        {teamsLoading ? <p className="muted">Đang tải danh sách đội...</p> : teams.length ? <div className="team-checkbox-grid">
                            {teams.map((team) => <label className="team-checkbox" key={team.teamId}>
                                <input type="checkbox" checked={selectedTeamIds.includes(String(team.teamId))} onChange={() => toggleTeam(team.teamId)} />
                                <span><strong>{team.teamName}</strong><small>{team.leaderName || 'Chưa có leader'} · {team.memberCount ?? 0} thành viên · {team.status}</small></span>
                            </label>)}
                        </div> : <p className="muted">Category chưa có đội đã duyệt và đủ từ 3 đến 5 thành viên.</p>}
                    </>}
                </div>
                <button className="compact-button" disabled={!trackId || !roundId || !assigneeId || (!assignAllTeams && selectedTeamIds.length === 0)}>{editingAssignmentId ? 'Cập nhật' : 'Phân công'}</button>
            </form>
        </section>

        <section className="control-bar card">
            <label>Lọc Event<select value={filterEventId} onChange={(event) => { setFilterEventId(event.target.value); setFilterTrackId(''); setFilterRoundId(''); }}><option value="">Tất cả</option>{events.map((item) => <option key={item.eventId} value={item.eventId}>{item.eventName}</option>)}</select></label>
            <label>Lọc Category<select value={filterTrackId} onChange={(event) => setFilterTrackId(event.target.value)}><option value="">Tất cả</option>{tracks.filter((item) => !filterEventId || String(item.eventId) === filterEventId).map((item) => <option key={item.trackId} value={item.trackId}>{item.trackName}</option>)}</select></label>
            <label>Lọc Round<select value={filterRoundId} onChange={(event) => setFilterRoundId(event.target.value)}><option value="">Tất cả</option>{rounds.filter((item) => !filterEventId || String(item.eventId) === filterEventId).map((item) => <option key={item.roundId} value={item.roundId}>{item.roundName}</option>)}</select></label>
        </section>

        <section className="card">
            <div className="section-title"><h2>Danh sách phân công</h2><span>{visibleAssignments.length} phân công</span></div>
            <DataTable
                columns={[
                    { title: 'Event', key: 'eventName' },
                    { title: 'Category', key: 'categoryName' },
                    { title: 'Round', key: 'roundName' },
                    { title: 'Judge/Mentor', render: (row) => <div><strong>{row.assigneeName}</strong><div className="muted small">{viRole(row.assigneeRole)}</div></div> },
                    { title: 'Danh sách đội', render: (row) => row.teams?.length ? <div><div className="muted small">{row.allTeamsInCategory ? 'Toàn bộ Category' : `${row.teamCount} đội được chọn`}</div><div className="chip-list">{row.teams.map((team: any) => <span className="info-chip" key={team.teamId}>{team.teamName} · {team.memberCount} TV</span>)}</div></div> : <span className="muted">Chưa có đội</span> },
                    { title: 'Thao tác', render: (row) => <div className="mini-actions"><button className="secondary" onClick={() => onEdit(row)}>Edit</button><button className="danger-button" onClick={() => onDelete(row.assignmentId)}>Delete</button></div> }
                ]}
                data={visibleAssignments}
                rowKey="assignmentId"
            />
        </section>
    </section>;
}