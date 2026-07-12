'use client';

import { useEffect, useMemo, useState } from 'react';
import DataTable from '@/components/table/DataTable';
import Loading from '@/components/common/Loading';
import { viStatus } from '@/constants/role';
import { useTeamContext } from '@/contexts/TeamContext';
import useAuth from '@/hooks/useAuth';
import { getEvents } from '@/services/eventService';
import { getUsers } from '@/services/judgeService';
import { approveJoinRequest, cancelJoinRequest, getJoinRequests, joinTeam, rejectJoinRequest } from '@/services/teamRequestService';
import { createTeam, getMyTeams, getTeamMembers, getTeams, getTeamsWithStats, removeTeamMember, updateTeam, updateTeamStatus } from '@/services/teamService';
import { getTracks } from '@/services/trackService';
import { isAdminRole, isJudgeRole, isLeaderOfTeam, isMentorRole, roleOf, userIdOf } from '@/utils/rbac';

export default function TeamsPage() {
    const { user } = useAuth() as any;
    const { memberState, refreshTeamState, teamVersion } = useTeamContext();
    const role = roleOf(user);
    const isAdmin = isAdminRole(role);
    const [events, setEvents] = useState<any[]>([]);
    const [tracks, setTracks] = useState<any[]>([]);
    const [teams, setTeams] = useState<any[]>([]);
    const [teamStats, setTeamStats] = useState<any[]>([]);
    const [members, setMembers] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [requests, setRequests] = useState<any[]>([]);
    const [eventId, setEventId] = useState('');
    const [trackId, setTrackId] = useState('');
    const [teamId, setTeamId] = useState('');
    const [form, setForm] = useState<any>({ teamName: 'SEAL Builders' });
    const [editName, setEditName] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);

    const currentUserId = userIdOf(user);
    const selectedTeam = useMemo(
        () => teams.find((t) => String(t.teamId) === String(teamId)) || teamStats.find((t) => String(t.teamId) === String(teamId)),
        [teams, teamStats, teamId]
    );
    const isLeader = role === 'TeamMember' && isLeaderOfTeam(user, selectedTeam);
    const hasTeam = role === 'TeamMember' && (teams.length > 0 || memberState === 'JOINED_TEAM');
    const hasPendingRequest = role === 'TeamMember' && memberState === 'PENDING_REQUEST';
    const canManageTeam = isLeader;
    const trackName = (id: any) => tracks.find((t) => String(t.trackId) === String(id))?.trackName || `#${id}`;
    const userName = (id: any) => users.find((u) => String(u.userId) === String(id))?.fullName || `#${id}`;

    async function load() {
        setLoading(true);
        try {
            const ev = await getEvents();
            const eid = eventId || ev?.[0]?.eventId || '';
            const tr = eid ? await getTracks(eid) : [];
            setEvents(ev);
            setEventId(String(eid));
            setTracks(tr);
            setTrackId((old) => old || String(tr?.[0]?.trackId || ''));

            if (isAdmin) {
                const [tm, us] = await Promise.all([
                    getTeamsWithStats({}),
                    getUsers({ approved:true })
                ]);
                setTeams(tm);
                setTeamStats([]);
                setUsers(us);
                setTeamId((old) => old || String(tm?.[0]?.teamId || ''));
            } else if (role === 'TeamMember') {
                const my = await getMyTeams();
                setTeams(my);
                setTeamId((old) => old || String(my?.[0]?.teamId || ''));
                if (my.length === 0) {
                    setTeamStats(await getTeamsWithStats(eid ? { eventId: eid } : {}));
                } else {
                    setTeamStats([]);
                }
            } else {
                const stats = await getTeamsWithStats(eid ? { eventId: eid } : {});
                setTeamStats(stats);
                setTeams(stats);
                setTeamId((old) => old || String(stats?.[0]?.teamId || ''));
            }
        } catch (e: any) {
            setMessage(e.message);
        } finally {
            setLoading(false);
        }
    }

    async function reloadTeams(eid = eventId) {
        if (isAdmin) {
            const tm = await getTeamsWithStats(eid ? { eventId: eid } : {});
            setTeams(tm);
            setTeamStats([]);
            setTeamId((old) => old && tm.some((t: any) => String(t.teamId) === String(old)) ? old : String(tm?.[0]?.teamId || ''));
        } else if (role === 'TeamMember') {
            const my = await getMyTeams();
            setTeams(my);
            setTeamId((old) => old && my.some((t: any) => String(t.teamId) === String(old)) ? old : String(my?.[0]?.teamId || ''));
            setTeamStats(my.length === 0 ? await getTeamsWithStats(eid ? { eventId: eid } : {}) : []);
        } else {
            const stats = await getTeamsWithStats(eid ? { eventId: eid } : {});
            setTeamStats(stats);
            setTeams(stats);
            setTeamId((old) => old && stats.some((t: any) => String(t.teamId) === String(old)) ? old : String(stats?.[0]?.teamId || ''));
        }
    }

    async function loadTeamDetails(tid = teamId, teamForAuth = selectedTeam) {
        if (!tid) {
            setMembers([]);
            setRequests([]);
            return;
        }
        try {
            setMembers(await getTeamMembers(tid));
            if (isLeaderOfTeam(user, teamForAuth)) {
                setRequests(await getJoinRequests(tid) as any[]);
            } else {
                setRequests([]);
            }
        } catch {
            setMembers([]);
            setRequests([]);
        }
    }

    async function refetchAfterMutation(tid = teamId) {
        await refreshTeamState();
        await reloadTeams();
        if (tid) await loadTeamDetails(tid);
    }

    async function onCreate(e: any) {
        e.preventDefault();
        try {
            await createTeam({ eventId: Number(eventId), trackId: Number(trackId), teamName: form.teamName });
            setMessage('Đã tạo đội. Người tạo đội được gán Leader tự động.');
            await refetchAfterMutation();
        } catch (err: any) {
            setMessage(err.message);
        }
    }

    async function onEdit(e: any) {
        e.preventDefault();
        try {
            await updateTeam(teamId, { teamName: editName });
            setMessage('Đã cập nhật thông tin đội');
            await refetchAfterMutation(teamId);
        } catch (err: any) {
            setMessage(err.message);
        }
    }

    async function changeStatus(row: any, status: any) {
        try {
            await updateTeamStatus(row.teamId, status, status === 'Approved' ? 'Đủ điều kiện' : 'Không đáp ứng quy định');
            setMessage('Đã cập nhật trạng thái đội');
            await refetchAfterMutation(row.teamId);
        } catch (e: any) {
            setMessage(e.message);
        }
    }

    async function onJoin(row: any) {
        try {
            await joinTeam(row.teamId);
            setMessage('Đã gửi yêu cầu tham gia đội');
            await refetchAfterMutation(row.teamId);
        } catch (e: any) {
            setMessage(e.message);
        }
    }

    async function onCancel(row: any) {
        try {
            await cancelJoinRequest(row.teamId);
            setMessage('Đã hủy yêu cầu tham gia đội');
            await refetchAfterMutation(row.teamId);
        } catch (e: any) {
            setMessage(e.message);
        }
    }

    async function onApprove(id: any) {
        try {
            await approveJoinRequest(id);
            setMessage('Đã duyệt thành viên');
            await refetchAfterMutation(teamId);
        } catch (e: any) {
            setMessage(e.message);
        }
    }

    async function onReject(id: any) {
        try {
            await rejectJoinRequest(id);
            setMessage('Đã từ chối yêu cầu');
            await refetchAfterMutation(teamId);
        } catch (e: any) {
            setMessage(e.message);
        }
    }

    async function onRemoveMember(row: any) {
        try {
            await removeTeamMember(teamId, row.userId);
            setMessage('Đã xóa thành viên khỏi đội');
            await refetchAfterMutation(teamId);
        } catch (e: any) {
            setMessage(e.message);
        }
    }

    useEffect(() => { load(); }, [role, teamVersion]);
    useEffect(() => {
        if (eventId) {
            getTracks(eventId).then(setTracks).catch(() => {});
            reloadTeams(eventId).catch(() => {});
        }
    }, [eventId]);
    useEffect(() => {
        if (selectedTeam?.teamName) setEditName(selectedTeam.teamName);
        loadTeamDetails();
    }, [teamId, selectedTeam?.leaderId]);

    if (loading) return <Loading />;

    return <section className="grid">
        <div className="page-title">
            <div>
                <h2>{isAdmin ? 'Teams' : hasTeam ? (isLeader ? 'Team Leader' : 'Team của tôi') : 'Tham gia đội'}</h2>
            </div>
            <button className="compact-button" onClick={load}>Làm mới</button>
        </div>
        {message && <div className="notice">{message}</div>}
        {role === 'TeamMember' && <section className="notice">Trạng thái hiện tại: <strong>{memberState}</strong>{hasPendingRequest ? ' — đang chờ Leader duyệt.' : ''}</section>}

        {!isAdmin && (
            <section className="control-bar card">
                <label>
                    Sự kiện
                    <select
                        value={eventId}
                        onChange={(e) => setEventId(e.target.value)}
                    >
                        {events.map((e) =>
                            <option key={e.eventId} value={e.eventId}>
                                {e.eventName}
                            </option>
                        )}
                    </select>
                </label>

                {!hasTeam && (
                    <label>
                        Hạng mục
                        <select
                            value={trackId}
                            onChange={(e) => setTrackId(e.target.value)}
                        >
                            {tracks.map((t) =>
                                <option key={t.trackId} value={t.trackId}>
                                    {t.trackName}
                                </option>
                            )}
                        </select>
                    </label>
                )}
            </section>
        )}
        {(role === 'TeamMember' && !hasTeam && !hasPendingRequest) &&<section className="grid grid-2">
            <div className="card"><h2>Tạo đội</h2><form className="form-grid" onSubmit={onCreate}><label className="span-2">Tên đội<input value={form.teamName} onChange={(e) => setForm({ teamName: e.target.value })} /></label><button>Tạo đội</button></form></div>
            <div className="card"><h2>Quyền</h2><p className="muted">Leader quản lý Pending requests, Manage members và Submit project. Member thường chỉ View team và View submission.</p></div>
        </section>}

        {role === 'TeamMember' && !hasTeam && <section className="card">
            <h2>Danh sách Team</h2>
            <DataTable columns={[
                { title: 'Tên đội', key: 'teamName' },
                { title: 'Leader', key: 'leaderName' },
                { title: 'Thành viên', render: (r) => `${r.memberCount}/${r.maxMembers}` },
                { title: 'Trạng thái', render: (r) => <span className="table-badge">{viStatus(r.status)}</span> },
                { title: 'Thao tác', render: (r) => r.hasPendingRequest ? <button className="secondary" onClick={() => onCancel(r)}>Cancel Request</button> : <button onClick={() => onJoin(r)} disabled={r.memberCount >= r.maxMembers || hasPendingRequest}>Join Team</button> }
            ]} data={teamStats} rowKey="teamId" />
        </section>}

        {(isAdmin || hasTeam || isMentorRole(role) || isJudgeRole(role)) && <section className="card">
            <h2>{isAdmin ? 'Danh sách đội' : 'Thông tin đội'}</h2>
            <DataTable columns={[
                { title: 'ID', key: 'teamId' },
                { title: 'Tên đội', key: 'teamName' },
                { title: 'Hạng mục', render: (r) => trackName(r.trackId) },
                { title: 'Leader', render: (r) => r.leaderName || userName(r.leaderId) },
                { title: 'Thành viên', render: (r) => `${r.memberCount ?? 0}/5` },
                { title: 'Trạng thái', render: (r) => <span className="table-badge">{viStatus(r.status)}</span> },
                ...(isAdmin ? [{ title: 'Duyệt đội', render: (r: any) => <div className="mini-actions"><button onClick={() => changeStatus(r, 'Approved')} disabled={(r.memberCount ?? 0) < 3 || (r.memberCount ?? 0) > 5}>Duyệt</button><button className="danger-button" onClick={() => changeStatus(r, 'Rejected')}>Từ chối</button></div> }] : [])
            ]} data={teams} rowKey="teamId" />
        </section>}

        {canManageTeam && selectedTeam && <section className="grid grid-2">
            <div className="card"><h2>Manage team</h2><form className="form-grid" onSubmit={onEdit}><label className="span-2">Tên đội<input value={editName} onChange={(e) => setEditName(e.target.value)} /></label><button>Cập nhật đội</button></form></div>
            <div className="card"><h2>Pending requests</h2><DataTable columns={[
                { title: 'User ID', key: 'userId' },
                { title: 'Trạng thái', key: 'status' },
                { title: 'Thao tác', render: (r) => String(r.status).toUpperCase() === 'PENDING' ? <div className="mini-actions"><button onClick={() => onApprove(r.id)}>Approve</button><button className="secondary" onClick={() => onReject(r.id)}>Reject</button></div> : '-' }
            ]} data={requests} rowKey="id" /></div>
        </section>}

        {selectedTeam && hasTeam && <section className="card">
            <h2>{isLeader ? 'Manage members' : 'View team members'}</h2>
            <DataTable columns={[
                { title: 'User ID', key: 'userId' },
                { title: 'Vai trò trong Team', key: 'memberRole' },
                { title: 'Ngày tham gia', key: 'joinedAt' },
                ...(canManageTeam ? [{ title: 'Thao tác', render: (r: any) => String(r.userId) === String(currentUserId) || String(r.memberRole).toLowerCase() === 'leader' ? '-' : <button className="secondary" onClick={() => onRemoveMember(r)}>Xóa khỏi đội</button> }] : [])
            ]} data={members} rowKey="id" />
        </section>}
    </section>;
}