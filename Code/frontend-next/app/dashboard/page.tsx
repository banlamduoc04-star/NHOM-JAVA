'use client';

import { apiFetch } from '@/lib/api';
import { useEffect, useMemo, useState } from 'react';

type User = { userId: number; fullName: string; email: string; roleName: string; userType: string; isApproved: boolean; fptStudentCode?: string; externalStudentCode?: string; universityName?: string };
type Event = { eventId: number; eventName: string; season: string; eventYear: number; startDate?: string; endDate?: string; status: string; description?: string };
type Track = { trackId: number; eventId: number; trackName: string; description?: string };
type Round = { roundId: number; eventId: number; roundName: string; roundOrder: number; submissionDeadline?: string; topNAdvance?: number; roundType?: string; isCalibrationRound?: boolean; startTime?: string; endTime?: string };
type Team = { teamId: number; eventId: number; trackId: number; teamName: string; leaderId: number; status: string };
type Submission = { submissionId: number; teamId: number; roundId: number; repositoryUrl?: string; demoUrl?: string; reportUrl?: string; submittedAt?: string; isEliminated: boolean; eliminationReason?: string };
type Criterion = { criterionId: number; eventId: number; criterionName: string; maxScore: number; weight: number; isActive: boolean };
type Template = { templateId: number; templateName: string; description?: string; isActive: boolean };
type JudgeAssignment = { assignmentId: number; roundId: number; trackId: number; judgeId: number; assignedAt?: string };
type TrackMentor = { trackMentorId: number; trackId: number; mentorId: number; assignedAt?: string };
type Prize = { prizeId: number; eventId: number; trackId: number; prizeName: string; rankNo: number; description?: string };
type Announcement = { announcementId: number; eventId: number; trackId?: number; targetRole: string; title: string; content: string; isPublished: boolean; createdAt?: string };
type AuditLog = { auditId: number; userId?: number; actionName: string; entityName: string; entityId?: number; newValue?: string; createdAt?: string };
type RankingItem = { teamId: number; teamName: string; trackId: number; rankNo: number; finalScore: number };
type VarianceItem = { roundName?: string; trackName?: string; anonymousTeamCode?: string; criterionName?: string; judgeCount?: number; averageScore?: number; scoreRange?: number; scoreVariance?: number };
type ReliabilityMetric = { eligibleUnitCount?: number; ratingCount?: number; averageJudgePerUnit?: number; iccOneWayApprox?: number | null; krippendorffAlphaApprox?: number | null; averageVariance?: number | null; averageRange?: number | null; interpretation?: string };
type CriterionReliability = ReliabilityMetric & { criterionId?: number; criterionName?: string };
type JudgeTypeAverage = { judgeType: string; scoreCount: number; averageScore?: number | null };
type ReliabilitySummary = { eventId?: number; overall?: ReliabilityMetric; byCriterion?: CriterionReliability[]; judgeTypeAverageScores?: JudgeTypeAverage[]; judgeTypeScoreGap?: number | null; note?: string };
type Standing = { eventId?: number; trackCount?: number; roundCount?: number; teamCount?: number; submissionCount?: number; latestRoundRanking?: RankingItem[] };
type Completeness = { roundId?: number; submissionCount?: number; judgeAssignmentCount?: number; scoreCount?: number; scoresBySubmission?: Record<string, number> };

type LoadState = 'idle' | 'loading' | 'ready' | 'error';

const initialEvent = { eventName: 'SEAL Summer 2026', season: 'Summer', eventYear: '2026', startDate: '2026-07-01', endDate: '2026-07-31', status: 'Open', description: 'Hackathon học thuật thường niên ngành Kỹ thuật Phần mềm.' };
const initialRound = { roundName: 'Vòng sơ khảo', roundOrder: '1', submissionDeadline: '2026-07-15T23:59', topNAdvance: '5', roundType: 'Competition', isCalibrationRound: false };
const initialTrack = { trackName: 'Ứng dụng Web', description: 'Hạng mục dành cho sản phẩm web/software engineering.' };
const initialCriterion = { criterionName: 'Chất lượng kỹ thuật', maxScore: '10', weight: '0.35' };
const initialTeam = { teamName: 'SEAL Builders' };
const initialSubmission = { repositoryUrl: 'https://github.com/example/seal-project', demoUrl: 'https://demo.example.com', reportUrl: 'https://drive.google.com/example' };
const initialStaff = { fullName: '', email: '', password: '', roleName: 'GuestJudge', userType: 'Staff' };
const initialPrize = { prizeName: 'Giải Nhất', rankNo: '1', description: 'Trao cho đội có điểm xếp hạng cao nhất trong hạng mục.' };
const initialAnnouncement = { title: 'Mở cổng nộp bài', content: 'Các đội vui lòng nộp repository, demo và báo cáo trước hạn.', targetRole: 'All' };
const initialScore = { scoreValue: '', comment: '' };

function viRole(role?: string) {
    const map: Record<string, string> = { EventCoordinator: 'Ban tổ chức', TeamMember: 'Thành viên đội', Mentor: 'Mentor', Judge: 'Giám khảo', GuestJudge: 'Giám khảo khách mời' };
    return role ? map[role] || role : '-';
}

function viStatus(status?: string) {
    const map: Record<string, string> = { Draft: 'Bản nháp', Open: 'Đang mở', Closed: 'Đã đóng', Pending: 'Chờ duyệt', Approved: 'Đã duyệt', Rejected: 'Từ chối', Eliminated: 'Bị loại' };
    return status ? map[status] || status : '-';
}

function seasonVi(season?: string) {
    const map: Record<string, string> = { Spring: 'Mùa Xuân', Summer: 'Mùa Hè', Fall: 'Mùa Thu' };
    return season ? map[season] || season : '-';
}

function fmtDate(value?: string) {
    if (!value) return '-';
    return value.replace('T', ' ').slice(0, 16);
}

function shortUrl(value?: string) {
    if (!value) return '-';
    return value.replace(/^https?:\/\//, '').slice(0, 34);
}

function fmtMetric(value?: number | null) {
    if (value === null || value === undefined || Number.isNaN(Number(value))) return '-';
    return Number(value).toFixed(3);
}

async function fetchSafe<T>(path: string, fallback: T): Promise<T> {
    try { return await apiFetch<T>(path); } catch { return fallback; }
}

export default function DashboardPage() {
    const [loadState, setLoadState] = useState<LoadState>('idle');
    const [message, setMessage] = useState('');
    const [user, setUser] = useState<any>(null);
    const [authChecked, setAuthChecked] = useState(false);

    const [events, setEvents] = useState<Event[]>([]);
    const [tracks, setTracks] = useState<Track[]>([]);
    const [rounds, setRounds] = useState<Round[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [criteria, setCriteria] = useState<Criterion[]>([]);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [assignments, setAssignments] = useState<JudgeAssignment[]>([]);
    const [trackMentors, setTrackMentors] = useState<TrackMentor[]>([]);
    const [prizes, setPrizes] = useState<Prize[]>([]);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [ranking, setRanking] = useState<RankingItem[]>([]);
    const [advance, setAdvance] = useState<RankingItem[]>([]);
    const [variance, setVariance] = useState<VarianceItem[]>([]);
    const [reliability, setReliability] = useState<ReliabilitySummary>({});
    const [standings, setStandings] = useState<Standing>({});
    const [completeness, setCompleteness] = useState<Completeness>({});

    const [selectedEventId, setSelectedEventId] = useState<number | ''>('');
    const [selectedTrackId, setSelectedTrackId] = useState<number | ''>('');
    const [selectedRoundId, setSelectedRoundId] = useState<number | ''>('');
    const [selectedTeamId, setSelectedTeamId] = useState<number | ''>('');
    const [selectedTemplateId, setSelectedTemplateId] = useState<number | ''>('');
    const [selectedJudgeId, setSelectedJudgeId] = useState<number | ''>('');
    const [selectedMentorId, setSelectedMentorId] = useState<number | ''>('');
    const [selectedMemberUserId, setSelectedMemberUserId] = useState<number | ''>('');
    const [selectedSubmissionId, setSelectedSubmissionId] = useState<number | ''>('');
    const [selectedCriterionId, setSelectedCriterionId] = useState<number | ''>('');

    const [eventForm, setEventForm] = useState(initialEvent);
    const [roundForm, setRoundForm] = useState(initialRound);
    const [trackForm, setTrackForm] = useState(initialTrack);
    const [criterionForm, setCriterionForm] = useState(initialCriterion);
    const [teamForm, setTeamForm] = useState(initialTeam);
    const [submissionForm, setSubmissionForm] = useState(initialSubmission);
    const [staffForm, setStaffForm] = useState(initialStaff);
    const [prizeForm, setPrizeForm] = useState(initialPrize);
    const [announcementForm, setAnnouncementForm] = useState(initialAnnouncement);
    const [scoreForm, setScoreForm] = useState(initialScore);

    const currentEventTracks = useMemo(() => tracks.filter(t => !selectedEventId || t.eventId === selectedEventId), [tracks, selectedEventId]);
    const currentEventRounds = useMemo(() => rounds.filter(r => !selectedEventId || r.eventId === selectedEventId), [rounds, selectedEventId]);
    const currentEventTeams = useMemo(() => teams.filter(t => !selectedEventId || t.eventId === selectedEventId), [teams, selectedEventId]);
    const selectedEvent = events.find(e => e.eventId === selectedEventId);
    const judges = users.filter(u => ['Judge', 'GuestJudge'].includes(u.roleName));
    const mentors = users.filter(u => u.roleName === 'Mentor');
    const participantUsers = users.filter(u => u.roleName === 'TeamMember' && u.isApproved);
    const pendingUsers = users.filter(u => !u.isApproved);

    function eventName(id?: number) { return events.find(e => e.eventId === id)?.eventName || `#${id}`; }
    function trackName(id?: number) { return tracks.find(t => t.trackId === id)?.trackName || `#${id}`; }
    function roundName(id?: number) { return rounds.find(r => r.roundId === id)?.roundName || `#${id}`; }
    function teamName(id?: number) { return teams.find(t => t.teamId === id)?.teamName || `#${id}`; }
    function userName(id?: number) { return users.find(u => u.userId === id)?.fullName || `#${id}`; }

    async function refreshBase() {
        setLoadState('loading');
        setMessage('');
        try {
            const [eventData, templateData, userData, assignmentData, auditData] = await Promise.all([
                apiFetch<Event[]>('/api/events'),
                fetchSafe<Template[]>('/api/criterion-templates', []),
                fetchSafe<User[]>('/api/admin/users', []),
                fetchSafe<JudgeAssignment[]>('/api/judge-assignments', []),
                fetchSafe<AuditLog[]>('/api/audit-logs', [])
            ]);
            setEvents(eventData);
            setTemplates(templateData);
            setUsers(userData);
            setAssignments(assignmentData);
            setAuditLogs(auditData);
            if (eventData.length && !selectedEventId) setSelectedEventId(eventData[0].eventId);
            if (templateData.length && !selectedTemplateId) setSelectedTemplateId(templateData[0].templateId);
            setLoadState('ready');
        } catch (err: unknown) {
            setLoadState('error');
            setMessage(err instanceof Error ? err.message : 'Không tải được dữ liệu. Hãy kiểm tra backend Spring Boot.');
        }
    }

    async function refreshEventData(eventId: number) {
        const [trackData, roundData, teamData, criterionData, prizeData, announcementData, standingData, varianceData, reliabilityData, trackMentorData] = await Promise.all([
            fetchSafe<Track[]>(`/api/tracks?eventId=${eventId}`, []),
            fetchSafe<Round[]>(`/api/rounds?eventId=${eventId}`, []),
            fetchSafe<Team[]>(`/api/teams?eventId=${eventId}`, []),
            fetchSafe<Criterion[]>(`/api/event-criteria/event/${eventId}?includeInactive=true`, []),
            fetchSafe<Prize[]>(`/api/prizes?eventId=${eventId}`, []),
            fetchSafe<Announcement[]>(`/api/announcements/event/${eventId}`, []),
            fetchSafe<Standing>(`/api/events/${eventId}/standings`, {}),
            fetchSafe<VarianceItem[]>(`/api/research/event/${eventId}/judge-variance`, []),
            fetchSafe<ReliabilitySummary>(`/api/research/event/${eventId}/reliability-summary`, {}),
            fetchSafe<TrackMentor[]>(`/api/track-mentors?eventId=${eventId}`, [])
        ]);
        setTracks(trackData);
        setRounds(roundData);
        setTeams(teamData);
        setCriteria(criterionData);
        setPrizes(prizeData);
        setAnnouncements(announcementData);
        setStandings(standingData);
        setVariance(varianceData);
        setReliability(reliabilityData);
        setTrackMentors(trackMentorData);
        if (trackData.length && !selectedTrackId) setSelectedTrackId(trackData[0].trackId);
        if (roundData.length && !selectedRoundId) setSelectedRoundId(roundData[0].roundId);
        if (teamData.length && !selectedTeamId) setSelectedTeamId(teamData[0].teamId);
    }

    async function refreshRoundData(roundId: number) {
        const [submissionData, rankingData, advanceData, completenessData] = await Promise.all([
            fetchSafe<Submission[]>(`/api/submissions?roundId=${roundId}`, []),
            fetchSafe<RankingItem[]>(`/api/rankings/round?roundId=${roundId}`, []),
            fetchSafe<RankingItem[]>(`/api/rankings/advance?roundId=${roundId}`, []),
            fetchSafe<Completeness>(`/api/rounds/${roundId}/score-completeness`, {})
        ]);
        setSubmissions(submissionData);
        setRanking(rankingData);
        setAdvance(advanceData);
        setCompleteness(completenessData);
    }

    async function afterChange(text: string) {
        setMessage(text);
        await refreshBase();
        if (selectedEventId) await refreshEventData(selectedEventId);
        if (selectedRoundId) await refreshRoundData(selectedRoundId);
    }

    useEffect(() => {
        const token = localStorage.getItem('seal_token');
        const stored = localStorage.getItem('seal_user');
        if (!token || !stored) {
            window.location.replace('/');
            return;
        }

        try {
            setUser(JSON.parse(stored));
            setAuthChecked(true);
            refreshBase();
        } catch {
            localStorage.removeItem('seal_token');
            localStorage.removeItem('seal_user');
            window.location.replace('/');
        }
    }, []);

    useEffect(() => {
        if (selectedEventId) refreshEventData(selectedEventId).catch(err => setMessage(err.message));
    }, [selectedEventId]);

    useEffect(() => {
        if (selectedRoundId) refreshRoundData(selectedRoundId).catch(err => setMessage(err.message));
    }, [selectedRoundId]);

    useEffect(() => {
        if (judges.length && !selectedJudgeId) setSelectedJudgeId(judges[0].userId);
        if (mentors.length && !selectedMentorId) setSelectedMentorId(mentors[0].userId);
        if (participantUsers.length && !selectedMemberUserId) setSelectedMemberUserId(participantUsers[0].userId);
    }, [users]);

    useEffect(() => {
        if (submissions.length && !selectedSubmissionId) setSelectedSubmissionId(submissions[0].submissionId);
    }, [submissions]);

    useEffect(() => {
        const activeCriteria = criteria.filter(c => c.isActive);
        if (activeCriteria.length && !selectedCriterionId) setSelectedCriterionId(activeCriteria[0].criterionId);
    }, [criteria]);

    async function createEvent(e: React.FormEvent) {
        e.preventDefault();
        await apiFetch('/api/events', { method: 'POST', body: JSON.stringify({ ...eventForm, eventYear: Number(eventForm.eventYear) }) });
        await afterChange('Đã tạo sự kiện hackathon mới.');
    }

    async function createTrack(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedEventId) return setMessage('Vui lòng chọn sự kiện trước.');
        await apiFetch('/api/tracks', { method: 'POST', body: JSON.stringify({ ...trackForm, eventId: selectedEventId }) });
        await afterChange('Đã tạo hạng mục thi đấu.');
    }

    async function createRound(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedEventId) return setMessage('Vui lòng chọn sự kiện trước.');
        await apiFetch('/api/rounds', { method: 'POST', body: JSON.stringify({ ...roundForm, eventId: selectedEventId, roundOrder: Number(roundForm.roundOrder), topNAdvance: Number(roundForm.topNAdvance) || undefined }) });
        await afterChange('Đã tạo vòng thi.');
    }

    async function applyTemplate() {
        if (!selectedEventId || !selectedTemplateId) return setMessage('Vui lòng chọn sự kiện và mẫu tiêu chí.');
        await apiFetch(`/api/criterion-templates/${selectedTemplateId}/apply-to-event/${selectedEventId}`, { method: 'POST', body: JSON.stringify({ replaceExisting: true }) });
        await afterChange('Đã áp dụng mẫu tiêu chí cho sự kiện.');
    }

    async function createCriterion(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedEventId) return setMessage('Vui lòng chọn sự kiện trước.');
        await apiFetch('/api/event-criteria', { method: 'POST', body: JSON.stringify({ eventId: selectedEventId, criterionName: criterionForm.criterionName, maxScore: Number(criterionForm.maxScore), weight: Number(criterionForm.weight) }) });
        await afterChange('Đã thêm tiêu chí chấm điểm.');
    }

    async function createTeam(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedEventId || !selectedTrackId) return setMessage('Vui lòng chọn sự kiện và hạng mục.');
        await apiFetch('/api/teams', { method: 'POST', body: JSON.stringify({ eventId: selectedEventId, trackId: selectedTrackId, teamName: teamForm.teamName }) });
        await afterChange('Đã tạo đội thi. Đội cần được duyệt trước khi nộp bài.');
    }

    async function updateTeamStatus(teamId: number, status: 'Approved' | 'Rejected') {
        await apiFetch(`/api/teams/${teamId}/status`, { method: 'PATCH', body: JSON.stringify({ status, reason: status === 'Approved' ? 'Đủ điều kiện tham gia' : 'Không đáp ứng quy định' }) });
        await afterChange(status === 'Approved' ? 'Đã duyệt đội thi.' : 'Đã từ chối đội thi.');
    }

    async function createSubmission(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedTeamId || !selectedRoundId) return setMessage('Vui lòng chọn đội và vòng thi.');
        await apiFetch('/api/submissions', { method: 'POST', body: JSON.stringify({ ...submissionForm, teamId: selectedTeamId, roundId: selectedRoundId }) });
        await afterChange('Đã ghi nhận bài nộp.');
    }

    async function eliminateSubmission(submissionId: number) {
        const reason = window.prompt('Nhập lý do loại bài nộp:', 'Vi phạm quy chế cuộc thi');
        if (!reason) return;
        await apiFetch(`/api/submissions/${submissionId}/eliminate`, { method: 'POST', body: JSON.stringify({ reason }) });
        await afterChange('Đã loại bài nộp và ghi nhật ký kiểm tra.');
    }

    async function createStaff(e: React.FormEvent) {
        e.preventDefault();
        await apiFetch('/api/admin/create-staff-account', { method: 'POST', body: JSON.stringify(staffForm) });
        await afterChange('Đã tạo tài khoản nhân sự/giám khảo.');
    }

    async function approveUser(userId: number) {
        await apiFetch(`/api/admin/approveUser/${userId}`, { method: 'POST' });
        await afterChange('Đã phê duyệt tài khoản.');
    }

    async function rejectUser(userId: number) {
        await apiFetch(`/api/admin/rejectUser/${userId}`, { method: 'POST', body: JSON.stringify({ reason: 'Không đủ thông tin đăng ký' }) });
        await afterChange('Đã từ chối tài khoản.');
    }

    async function assignJudge(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedRoundId || !selectedTrackId || !selectedJudgeId) return setMessage('Vui lòng chọn vòng thi, hạng mục và giám khảo.');
        await apiFetch('/api/judge-assignments', { method: 'POST', body: JSON.stringify({ roundId: selectedRoundId, trackId: selectedTrackId, judgeId: selectedJudgeId }) });
        await afterChange('Đã phân công giám khảo cho vòng/hạng mục.');
    }

    async function assignMentor(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedTrackId || !selectedMentorId) return setMessage('Vui lòng chọn hạng mục và mentor.');
        await apiFetch('/api/track-mentors', { method: 'POST', body: JSON.stringify({ trackId: selectedTrackId, mentorId: selectedMentorId }) });
        await afterChange('Đã phân công mentor cho hạng mục.');
    }

    async function addTeamMember(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedTeamId || !selectedMemberUserId) return setMessage('Vui lòng chọn đội và thành viên.');
        await apiFetch('/api/team-members', { method: 'POST', body: JSON.stringify({ teamId: selectedTeamId, userId: selectedMemberUserId, memberRole: 'Member' }) });
        await afterChange('Đã thêm thành viên vào đội thi.');
    }

    async function submitScore(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedSubmissionId || !selectedCriterionId) return setMessage('Vui lòng chọn bài nộp và tiêu chí chấm điểm.');
        await apiFetch('/api/scores', { method: 'POST', body: JSON.stringify({ submissionId: selectedSubmissionId, criterionId: selectedCriterionId, scoreValue: Number(scoreForm.scoreValue), comment: scoreForm.comment }) });
        setScoreForm(initialScore);
        await afterChange('Đã lưu điểm theo từng tiêu chí của giám khảo.');
    }

    async function evaluateRound() {
        if (!selectedRoundId) return setMessage('Vui lòng chọn vòng thi.');
        await apiFetch(`/api/rounds/${selectedRoundId}/evaluate-elimination`, { method: 'POST' });
        await afterChange('Đã tính xếp hạng và xét thăng vòng theo Top N.');
    }

    async function createPrize(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedEventId || !selectedTrackId) return setMessage('Vui lòng chọn sự kiện và hạng mục.');
        await apiFetch('/api/prizes', { method: 'POST', body: JSON.stringify({ eventId: selectedEventId, trackId: selectedTrackId, prizeName: prizeForm.prizeName, rankNo: Number(prizeForm.rankNo), description: prizeForm.description }) });
        await afterChange('Đã tạo cơ cấu giải thưởng.');
    }

    async function createAnnouncement(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedEventId) return setMessage('Vui lòng chọn sự kiện.');
        await apiFetch('/api/announcements', { method: 'POST', body: JSON.stringify({ eventId: selectedEventId, trackId: selectedTrackId || undefined, ...announcementForm, isPublished: true }) });
        await afterChange('Đã đăng thông báo đến người tham gia.');
    }

    if (!authChecked) return null;

    return (
        <main className="container dashboard grid">
            <header className="dashboard-header">
                <div>
                    <span className="badge">SEAL Dashboard · SU26SWP04</span>
                    <h1>Quản lý cuộc thi SEAL Hackathon</h1>
                    <p className="muted">Điều phối sự kiện, vòng thi, hạng mục, đội thi, bài nộp, chấm điểm, xếp hạng, giải thưởng và dữ liệu nghiên cứu RBL.</p>
                </div>
                <div className="header-actions">
                    <div className="user-chip"><strong>{user?.fullName || 'Chưa đăng nhập'}</strong><span>{viRole(user?.role)}</span></div>
                    <button className="secondary" onClick={() => { localStorage.clear(); window.location.href = '/'; }}>Đăng xuất</button>
                </div>
            </header>

            {message && <div className={loadState === 'error' ? 'notice error' : 'notice'}>{message}</div>}

            <section className="control-bar card">
                <label>Sự kiện
                    <select value={selectedEventId} onChange={e => setSelectedEventId(e.target.value ? Number(e.target.value) : '')}>
                        <option value="">Chọn sự kiện</option>
                        {events.map(e => <option key={e.eventId} value={e.eventId}>{e.eventName}</option>)}
                    </select>
                </label>
                <label>Hạng mục
                    <select value={selectedTrackId} onChange={e => setSelectedTrackId(e.target.value ? Number(e.target.value) : '')}>
                        <option value="">Chọn hạng mục</option>
                        {currentEventTracks.map(t => <option key={t.trackId} value={t.trackId}>{t.trackName}</option>)}
                    </select>
                </label>
                <label>Vòng thi
                    <select value={selectedRoundId} onChange={e => setSelectedRoundId(e.target.value ? Number(e.target.value) : '')}>
                        <option value="">Chọn vòng thi</option>
                        {currentEventRounds.map(r => <option key={r.roundId} value={r.roundId}>{r.roundName}</option>)}
                    </select>
                </label>
                <button onClick={() => afterChange('Đã làm mới dữ liệu.')} type="button">Làm mới</button>
            </section>

            <section className="grid grid-4">
                <div className="stat-card"><span>Sự kiện</span><strong>{events.length}</strong><small>{selectedEvent ? `${seasonVi(selectedEvent.season)} ${selectedEvent.eventYear}` : 'Chưa chọn'}</small></div>
                <div className="stat-card"><span>Hạng mục</span><strong>{tracks.length}</strong><small>{mentors.length} mentor khả dụng</small></div>
                <div className="stat-card"><span>Đội thi</span><strong>{teams.length}</strong><small>{teams.filter(t => t.status === 'Approved').length} đội đã duyệt</small></div>
                <div className="stat-card"><span>Bài nộp</span><strong>{submissions.length}</strong><small>{submissions.filter(s => s.isEliminated).length} bài bị loại</small></div>
            </section>

            <section className="grid grid-2">
                <div className="card">
                    <div className="section-title"><h2>1. Quản lý sự kiện</h2><span>{loadState === 'loading' ? 'Đang tải...' : 'Sẵn sàng'}</span></div>
                    <form className="form-grid" onSubmit={createEvent}>
                        <label>Tên sự kiện<input value={eventForm.eventName} onChange={e => setEventForm({ ...eventForm, eventName: e.target.value })} /></label>
                        <label>Mùa<select value={eventForm.season} onChange={e => setEventForm({ ...eventForm, season: e.target.value })}><option value="Spring">Mùa Xuân</option><option value="Summer">Mùa Hè</option><option value="Fall">Mùa Thu</option></select></label>
                        <label>Năm<input value={eventForm.eventYear} onChange={e => setEventForm({ ...eventForm, eventYear: e.target.value })} /></label>
                        <label>Trạng thái<select value={eventForm.status} onChange={e => setEventForm({ ...eventForm, status: e.target.value })}><option value="Draft">Bản nháp</option><option value="Open">Đang mở</option><option value="Closed">Đã đóng</option></select></label>
                        <label>Ngày bắt đầu<input type="date" value={eventForm.startDate} onChange={e => setEventForm({ ...eventForm, startDate: e.target.value })} /></label>
                        <label>Ngày kết thúc<input type="date" value={eventForm.endDate} onChange={e => setEventForm({ ...eventForm, endDate: e.target.value })} /></label>
                        <label className="span-2">Mô tả<textarea value={eventForm.description} onChange={e => setEventForm({ ...eventForm, description: e.target.value })} /></label>
                        <button type="submit">Tạo sự kiện</button>
                    </form>
                </div>

                <div className="card">
                    <div className="section-title"><h2>2. Vòng thi và luật thăng vòng</h2><span>Top N theo hạng mục</span></div>
                    <form className="form-grid" onSubmit={createRound}>
                        <label>Tên vòng<input value={roundForm.roundName} onChange={e => setRoundForm({ ...roundForm, roundName: e.target.value })} /></label>
                        <label>Thứ tự<input value={roundForm.roundOrder} onChange={e => setRoundForm({ ...roundForm, roundOrder: e.target.value })} /></label>
                        <label>Hạn nộp bài<input type="datetime-local" value={roundForm.submissionDeadline} onChange={e => setRoundForm({ ...roundForm, submissionDeadline: e.target.value })} /></label>
                        <label>Top N vào vòng sau<input value={roundForm.topNAdvance} onChange={e => setRoundForm({ ...roundForm, topNAdvance: e.target.value })} /></label>
                        <label>Loại vòng<select value={roundForm.roundType} onChange={e => setRoundForm({ ...roundForm, roundType: e.target.value })}><option value="Competition">Vòng thi chính</option><option value="Calibration">Vòng hiệu chuẩn</option></select></label>
                        <label className="checkbox-line"><input type="checkbox" checked={roundForm.isCalibrationRound} onChange={e => setRoundForm({ ...roundForm, isCalibrationRound: e.target.checked })} /> Vòng hiệu chuẩn giám khảo</label>
                        <button type="submit">Tạo vòng thi</button>
                        <button className="secondary" type="button" onClick={evaluateRound}>Tính xếp hạng / xét thăng vòng</button>
                    </form>
                </div>
            </section>

            <section className="grid grid-2">
                <div className="card">
                    <div className="section-title"><h2>3. Hạng mục và mentor</h2><span>{currentEventTracks.length} hạng mục</span></div>
                    <form className="form-grid" onSubmit={createTrack}>
                        <label>Tên hạng mục<input value={trackForm.trackName} onChange={e => setTrackForm({ ...trackForm, trackName: e.target.value })} /></label>
                        <label className="span-2">Mô tả<textarea value={trackForm.description} onChange={e => setTrackForm({ ...trackForm, description: e.target.value })} /></label>
                        <button type="submit">Tạo hạng mục</button>
                    </form>
                    <form className="form-grid soft-gap" onSubmit={assignMentor}>
                        <label>Mentor<select value={selectedMentorId} onChange={e => setSelectedMentorId(e.target.value ? Number(e.target.value) : '')}><option value="">Chọn mentor</option>{mentors.map(m => <option key={m.userId} value={m.userId}>{m.fullName}</option>)}</select></label>
                        <button type="submit">Phân công mentor cho hạng mục đã chọn</button>
                    </form>
                    <div className="pill-list soft-gap">{currentEventTracks.map(t => <span className="pill" key={t.trackId}>{t.trackName}</span>)}</div>
                </div>

                <div className="card">
                    <div className="section-title"><h2>4. Tiêu chí chấm điểm</h2><span>Lưu theo tiêu chí</span></div>
                    <div className="inline-actions">
                        <select value={selectedTemplateId} onChange={e => setSelectedTemplateId(e.target.value ? Number(e.target.value) : '')}>
                            <option value="">Chọn mẫu tiêu chí</option>
                            {templates.map(t => <option key={t.templateId} value={t.templateId}>{t.templateName}</option>)}
                        </select>
                        <button type="button" onClick={applyTemplate}>Áp dụng mẫu</button>
                    </div>
                    <form className="form-grid" onSubmit={createCriterion}>
                        <label>Tên tiêu chí<input value={criterionForm.criterionName} onChange={e => setCriterionForm({ ...criterionForm, criterionName: e.target.value })} /></label>
                        <label>Điểm tối đa<input value={criterionForm.maxScore} onChange={e => setCriterionForm({ ...criterionForm, maxScore: e.target.value })} /></label>
                        <label>Trọng số<input value={criterionForm.weight} onChange={e => setCriterionForm({ ...criterionForm, weight: e.target.value })} /></label>
                        <button type="submit">Thêm tiêu chí</button>
                    </form>
                </div>
            </section>

            <section className="grid grid-2">
                <div className="card">
                    <div className="section-title"><h2>5. Đăng ký đội thi</h2><span>3–5 thành viên</span></div>
                    <form className="form-grid" onSubmit={createTeam}>
                        <label>Tên đội<input value={teamForm.teamName} onChange={e => setTeamForm({ teamName: e.target.value })} /></label>
                        <button type="submit">Tạo đội trong hạng mục đã chọn</button>
                    </form>
                    <form className="form-grid soft-gap" onSubmit={addTeamMember}>
                        <label>Đội<select value={selectedTeamId} onChange={e => setSelectedTeamId(e.target.value ? Number(e.target.value) : '')}><option value="">Chọn đội</option>{currentEventTeams.map(t => <option key={t.teamId} value={t.teamId}>{t.teamName}</option>)}</select></label>
                        <label>Thành viên<select value={selectedMemberUserId} onChange={e => setSelectedMemberUserId(e.target.value ? Number(e.target.value) : '')}><option value="">Chọn thành viên đã duyệt</option>{participantUsers.map(u => <option key={u.userId} value={u.userId}>{u.fullName} · {u.email}</option>)}</select></label>
                        <button type="submit">Thêm thành viên</button>
                    </form>
                    <p className="muted small">Đội mới có trạng thái chờ duyệt. Chỉ duyệt đội khi đủ 3–5 thành viên.</p>
                </div>

                <div className="card">
                    <div className="section-title"><h2>6. Nộp bài theo vòng</h2><span>Repository / Demo / Báo cáo</span></div>
                    <form className="form-grid" onSubmit={createSubmission}>
                        <label>Đội thi<select value={selectedTeamId} onChange={e => setSelectedTeamId(e.target.value ? Number(e.target.value) : '')}><option value="">Chọn đội</option>{currentEventTeams.map(t => <option key={t.teamId} value={t.teamId}>{t.teamName}</option>)}</select></label>
                        <label>Repository URL<input value={submissionForm.repositoryUrl} onChange={e => setSubmissionForm({ ...submissionForm, repositoryUrl: e.target.value })} /></label>
                        <label>Demo URL<input value={submissionForm.demoUrl} onChange={e => setSubmissionForm({ ...submissionForm, demoUrl: e.target.value })} /></label>
                        <label>Báo cáo/Slide URL<input value={submissionForm.reportUrl} onChange={e => setSubmissionForm({ ...submissionForm, reportUrl: e.target.value })} /></label>
                        <button type="submit">Gửi bài nộp</button>
                    </form>
                </div>
            </section>

            <section className="grid grid-2">
                <div className="card">
                    <div className="section-title"><h2>7. Tài khoản và phê duyệt</h2><span>{pendingUsers.length} tài khoản chờ duyệt</span></div>
                    <form className="form-grid" onSubmit={createStaff}>
                        <label>Họ tên<input required value={staffForm.fullName} placeholder="Nhập họ tên nhân sự" onChange={e => setStaffForm({ ...staffForm, fullName: e.target.value })} /></label>
                        <label>Email<input type="email" required value={staffForm.email} placeholder="Nhập email nhân sự" onChange={e => setStaffForm({ ...staffForm, email: e.target.value })} /></label>
                        <label>Mật khẩu<input type="password" required value={staffForm.password} placeholder="Tạo mật khẩu tạm thời" onChange={e => setStaffForm({ ...staffForm, password: e.target.value })} /></label>
                        <label>Vai trò<select value={staffForm.roleName} onChange={e => setStaffForm({ ...staffForm, roleName: e.target.value })}><option value="Mentor">Mentor</option><option value="Judge">Giám khảo nội bộ</option><option value="GuestJudge">Giám khảo khách mời</option><option value="EventCoordinator">Ban tổ chức</option></select></label>
                        <button type="submit">Tạo tài khoản nhân sự</button>
                    </form>
                </div>

                <div className="card">
                    <div className="section-title"><h2>8. Phân công giám khảo</h2><span>{assignments.length} phân công</span></div>
                    <form className="form-grid" onSubmit={assignJudge}>
                        <label>Giám khảo<select value={selectedJudgeId} onChange={e => setSelectedJudgeId(e.target.value ? Number(e.target.value) : '')}><option value="">Chọn giám khảo</option>{judges.map(j => <option key={j.userId} value={j.userId}>{j.fullName} · {viRole(j.roleName)}</option>)}</select></label>
                        <button type="submit">Phân công vào vòng/hạng mục đã chọn</button>
                    </form>
                    <p className="muted small">Giám khảo khách mời chỉ có quyền chấm các vòng/hạng mục được phân công.</p>
                </div>
            </section>

            <section className="card">
                <div className="section-title"><h2>9. Chấm điểm theo tiêu chí</h2><span>Lưu riêng từng giám khảo</span></div>
                <form className="form-grid" onSubmit={submitScore}>
                    <label>Bài nộp<select value={selectedSubmissionId} onChange={e => setSelectedSubmissionId(e.target.value ? Number(e.target.value) : '')}><option value="">Chọn bài nộp</option>{submissions.map(s => <option key={s.submissionId} value={s.submissionId}>{teamName(s.teamId)} · {roundName(s.roundId)}</option>)}</select></label>
                    <label>Tiêu chí<select value={selectedCriterionId} onChange={e => setSelectedCriterionId(e.target.value ? Number(e.target.value) : '')}><option value="">Chọn tiêu chí</option>{criteria.filter(c => c.isActive).map(c => <option key={c.criterionId} value={c.criterionId}>{c.criterionName} / {c.maxScore}</option>)}</select></label>
                    <label>Điểm<input type="number" min="0" step="0.25" value={scoreForm.scoreValue} placeholder="Nhập điểm" onChange={e => setScoreForm({ ...scoreForm, scoreValue: e.target.value })} /></label>
                    <label className="span-2">Nhận xét<textarea value={scoreForm.comment} placeholder="Nhập nhận xét của giám khảo" onChange={e => setScoreForm({ ...scoreForm, comment: e.target.value })} /></label>
                    <button type="submit">Lưu điểm</button>
                </form>
                <p className="muted small">Giám khảo chỉ chấm được bài nộp thuộc vòng/hạng mục đã được phân công. Dữ liệu này dùng cho xếp hạng và RBL.</p>
            </section>

            <section className="grid grid-2">
                <div className="card">
                    <div className="section-title"><h2>10. Giải thưởng</h2><span>Công bố theo xếp hạng</span></div>
                    <form className="form-grid" onSubmit={createPrize}>
                        <label>Tên giải<input value={prizeForm.prizeName} onChange={e => setPrizeForm({ ...prizeForm, prizeName: e.target.value })} /></label>
                        <label>Hạng<input value={prizeForm.rankNo} onChange={e => setPrizeForm({ ...prizeForm, rankNo: e.target.value })} /></label>
                        <label className="span-2">Mô tả<textarea value={prizeForm.description} onChange={e => setPrizeForm({ ...prizeForm, description: e.target.value })} /></label>
                        <button type="submit">Tạo giải thưởng</button>
                    </form>
                </div>

                <div className="card">
                    <div className="section-title"><h2>11. Thông báo</h2><span>Kênh liên lạc chính thức</span></div>
                    <form className="form-grid" onSubmit={createAnnouncement}>
                        <label>Tiêu đề<input value={announcementForm.title} onChange={e => setAnnouncementForm({ ...announcementForm, title: e.target.value })} /></label>
                        <label>Đối tượng<select value={announcementForm.targetRole} onChange={e => setAnnouncementForm({ ...announcementForm, targetRole: e.target.value })}><option value="All">Tất cả</option><option value="TeamMember">Thí sinh</option><option value="Mentor">Mentor</option><option value="Judge">Giám khảo</option></select></label>
                        <label className="span-2">Nội dung<textarea value={announcementForm.content} onChange={e => setAnnouncementForm({ ...announcementForm, content: e.target.value })} /></label>
                        <button type="submit">Đăng thông báo</button>
                    </form>
                </div>
            </section>

            <section className="card">
                <div className="section-title"><h2>Tổng quan sự kiện</h2><span>{selectedEvent ? selectedEvent.eventName : 'Chưa chọn sự kiện'}</span></div>
                <div className="metric-row">
                    <div><strong>{standings.trackCount ?? tracks.length}</strong><span>Hạng mục</span></div>
                    <div><strong>{standings.roundCount ?? rounds.length}</strong><span>Vòng thi</span></div>
                    <div><strong>{standings.teamCount ?? teams.length}</strong><span>Đội thi</span></div>
                    <div><strong>{standings.submissionCount ?? submissions.length}</strong><span>Bài nộp</span></div>
                </div>
            </section>

            <section className="card table-card">
                <div className="section-title"><h2>Danh sách sự kiện</h2><span>{events.length} bản ghi</span></div>
                <table className="table"><thead><tr><th>ID</th><th>Tên sự kiện</th><th>Mùa</th><th>Năm</th><th>Trạng thái</th><th>Thời gian</th></tr></thead><tbody>{events.map(e => <tr key={e.eventId}><td>{e.eventId}</td><td>{e.eventName}</td><td>{seasonVi(e.season)}</td><td>{e.eventYear}</td><td><span className="table-badge">{viStatus(e.status)}</span></td><td>{e.startDate || '-'} → {e.endDate || '-'}</td></tr>)}</tbody></table>
            </section>

            <section className="grid grid-2">
                <div className="card table-card">
                    <div className="section-title"><h2>Hạng mục</h2><span>{tracks.length}</span></div>
                    <table className="table"><thead><tr><th>ID</th><th>Tên hạng mục</th><th>Sự kiện</th><th>Mentor</th></tr></thead><tbody>{tracks.map(t => <tr key={t.trackId}><td>{t.trackId}</td><td>{t.trackName}</td><td>{eventName(t.eventId)}</td><td>{trackMentors.filter(tm => tm.trackId === t.trackId).map(tm => userName(tm.mentorId)).join(', ') || '-'}</td></tr>)}</tbody></table>
                </div>
                <div className="card table-card">
                    <div className="section-title"><h2>Vòng thi</h2><span>{rounds.length}</span></div>
                    <table className="table"><thead><tr><th>ID</th><th>Tên vòng</th><th>Thứ tự</th><th>Hạn nộp</th><th>Top N</th></tr></thead><tbody>{rounds.map(r => <tr key={r.roundId}><td>{r.roundId}</td><td>{r.roundName}</td><td>{r.roundOrder}</td><td>{fmtDate(r.submissionDeadline)}</td><td>{r.topNAdvance ?? '-'}</td></tr>)}</tbody></table>
                </div>
            </section>

            <section className="card table-card">
                <div className="section-title"><h2>Đội thi</h2><span>{teams.length} đội</span></div>
                <table className="table"><thead><tr><th>ID</th><th>Tên đội</th><th>Hạng mục</th><th>Trưởng nhóm</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>{teams.map(t => <tr key={t.teamId}><td>{t.teamId}</td><td>{t.teamName}</td><td>{trackName(t.trackId)}</td><td>{userName(t.leaderId)}</td><td><span className="table-badge">{viStatus(t.status)}</span></td><td><div className="mini-actions"><button type="button" onClick={() => updateTeamStatus(t.teamId, 'Approved')}>Duyệt</button><button className="secondary" type="button" onClick={() => updateTeamStatus(t.teamId, 'Rejected')}>Từ chối</button></div></td></tr>)}</tbody></table>
            </section>

            <section className="card table-card">
                <div className="section-title"><h2>Bài nộp</h2><span>{submissions.length} bài</span></div>
                <table className="table"><thead><tr><th>ID</th><th>Đội</th><th>Vòng</th><th>Repository</th><th>Demo</th><th>Báo cáo</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>{submissions.map(s => <tr key={s.submissionId}><td>{s.submissionId}</td><td>{teamName(s.teamId)}</td><td>{roundName(s.roundId)}</td><td>{shortUrl(s.repositoryUrl)}</td><td>{shortUrl(s.demoUrl)}</td><td>{shortUrl(s.reportUrl)}</td><td><span className="table-badge">{s.isEliminated ? 'Đã loại' : 'Hợp lệ'}</span></td><td><button className="secondary" type="button" onClick={() => eliminateSubmission(s.submissionId)}>Loại</button></td></tr>)}</tbody></table>
            </section>

            <section className="grid grid-2">
                <div className="card table-card">
                    <div className="section-title"><h2>Tiêu chí sự kiện</h2><span>{criteria.length}</span></div>
                    <table className="table"><thead><tr><th>ID</th><th>Tiêu chí</th><th>Điểm tối đa</th><th>Trọng số</th><th>Trạng thái</th></tr></thead><tbody>{criteria.map(c => <tr key={c.criterionId}><td>{c.criterionId}</td><td>{c.criterionName}</td><td>{c.maxScore}</td><td>{c.weight}</td><td>{c.isActive ? 'Đang dùng' : 'Ngưng dùng'}</td></tr>)}</tbody></table>
                </div>
                <div className="card table-card">
                    <div className="section-title"><h2>Phân công giám khảo</h2><span>{assignments.length}</span></div>
                    <table className="table"><thead><tr><th>Vòng</th><th>Hạng mục</th><th>Giám khảo</th></tr></thead><tbody>{assignments.map(a => <tr key={a.assignmentId}><td>{roundName(a.roundId)}</td><td>{trackName(a.trackId)}</td><td>{userName(a.judgeId)}</td></tr>)}</tbody></table>
                </div>
            </section>

            <section className="grid grid-2">
                <div className="card table-card">
                    <div className="section-title"><h2>Xếp hạng vòng đang chọn</h2><span>Điểm tổng hợp</span></div>
                    <table className="table"><thead><tr><th>Hạng</th><th>Đội</th><th>Hạng mục</th><th>Điểm</th></tr></thead><tbody>{ranking.map(r => <tr key={`${r.teamId}-${r.rankNo}`}><td>{r.rankNo}</td><td>{r.teamName}</td><td>{trackName(r.trackId)}</td><td>{Number(r.finalScore).toFixed(2)}</td></tr>)}</tbody></table>
                </div>
                <div className="card table-card">
                    <div className="section-title"><h2>Đội dự kiến thăng vòng</h2><span>Theo Top N</span></div>
                    <table className="table"><thead><tr><th>Hạng</th><th>Đội</th><th>Hạng mục</th><th>Điểm</th></tr></thead><tbody>{advance.map(r => <tr key={`${r.teamId}-advance`}><td>{r.rankNo}</td><td>{r.teamName}</td><td>{trackName(r.trackId)}</td><td>{Number(r.finalScore).toFixed(2)}</td></tr>)}</tbody></table>
                </div>
            </section>

            <section className="card table-card">
                <div className="section-title"><h2>RBL - Độ tin cậy liên đánh giá viên</h2><a className="text-link" href={selectedEventId ? `http://localhost:8080/api/research/event/${selectedEventId}/judge-scores.csv` : '#'} target="_blank">Xuất CSV ẩn danh</a></div>
                <div className="metric-row compact">
                    <div><strong>{fmtMetric(reliability.overall?.iccOneWayApprox)}</strong><span>ICC xấp xỉ</span></div>
                    <div><strong>{fmtMetric(reliability.overall?.krippendorffAlphaApprox)}</strong><span>Krippendorff α</span></div>
                    <div><strong>{fmtMetric(reliability.overall?.averageRange)}</strong><span>Biên độ điểm TB</span></div>
                    <div><strong>{variance.length}</strong><span>Dòng phương sai</span></div>
                </div>
                <div className="insight-box">
                    <strong>Diễn giải RBL:</strong> {reliability.overall?.interpretation || 'Chưa đủ dữ liệu để diễn giải. Hãy đảm bảo mỗi bài nộp được ít nhất 2 giám khảo chấm cùng bộ tiêu chí.'}
                    <span>Khoảng cách TB giữa giám khảo nội bộ và khách mời: {fmtMetric(reliability.judgeTypeScoreGap)} điểm. Dữ liệu đủ điều kiện: {reliability.overall?.eligibleUnitCount ?? 0} đơn vị chấm / {reliability.overall?.ratingCount ?? 0} điểm.</span>
                </div>
                <div className="grid grid-2 soft-gap">
                    <div className="table-card">
                        <table className="table"><thead><tr><th>Tiêu chí</th><th>ICC</th><th>Alpha</th><th>Phương sai TB</th><th>Số điểm</th></tr></thead><tbody>{(reliability.byCriterion || []).map(c => <tr key={c.criterionId || c.criterionName}><td>{c.criterionName || '-'}</td><td>{fmtMetric(c.iccOneWayApprox)}</td><td>{fmtMetric(c.krippendorffAlphaApprox)}</td><td>{fmtMetric(c.averageVariance)}</td><td>{c.ratingCount ?? 0}</td></tr>)}</tbody></table>
                    </div>
                    <div className="table-card">
                        <table className="table"><thead><tr><th>Loại giám khảo</th><th>Số điểm</th><th>Điểm TB</th></tr></thead><tbody>{(reliability.judgeTypeAverageScores || []).map(j => <tr key={j.judgeType}><td>{viRole(j.judgeType)}</td><td>{j.scoreCount}</td><td>{fmtMetric(j.averageScore)}</td></tr>)}</tbody></table>
                    </div>
                </div>
                <table className="table soft-gap"><thead><tr><th>Vòng</th><th>Hạng mục</th><th>Mã đội ẩn danh</th><th>Tiêu chí</th><th>Số giám khảo</th><th>TB</th><th>Biên độ</th><th>Phương sai</th></tr></thead><tbody>{variance.slice(0, 12).map((v, index) => <tr key={index}><td>{v.roundName || '-'}</td><td>{v.trackName || '-'}</td><td>{v.anonymousTeamCode || '-'}</td><td>{v.criterionName || '-'}</td><td>{v.judgeCount ?? '-'}</td><td>{v.averageScore ?? '-'}</td><td>{v.scoreRange ?? '-'}</td><td>{v.scoreVariance ?? '-'}</td></tr>)}</tbody></table>
            </section>

            <section className="grid grid-2">
                <div className="card table-card">
                    <div className="section-title"><h2>Tài khoản chờ duyệt</h2><span>{pendingUsers.length}</span></div>
                    <table className="table"><thead><tr><th>Họ tên</th><th>Email</th><th>Vai trò</th><th>Loại</th><th>Thao tác</th></tr></thead><tbody>{pendingUsers.map(u => <tr key={u.userId}><td>{u.fullName}</td><td>{u.email}</td><td>{viRole(u.roleName)}</td><td>{u.userType}</td><td><div className="mini-actions"><button type="button" onClick={() => approveUser(u.userId)}>Duyệt</button><button className="secondary" type="button" onClick={() => rejectUser(u.userId)}>Từ chối</button></div></td></tr>)}</tbody></table>
                </div>
                <div className="card table-card">
                    <div className="section-title"><h2>Thông báo đã công bố</h2><span>{announcements.length}</span></div>
                    <table className="table"><thead><tr><th>Tiêu đề</th><th>Đối tượng</th><th>Hạng mục</th><th>Ngày tạo</th></tr></thead><tbody>{announcements.map(a => <tr key={a.announcementId}><td>{a.title}</td><td>{a.targetRole === 'All' ? 'Tất cả' : viRole(a.targetRole)}</td><td>{a.trackId ? trackName(a.trackId) : 'Toàn sự kiện'}</td><td>{fmtDate(a.createdAt)}</td></tr>)}</tbody></table>
                </div>
            </section>

            <section className="grid grid-2">
                <div className="card table-card">
                    <div className="section-title"><h2>Giải thưởng</h2><span>{prizes.length}</span></div>
                    <table className="table"><thead><tr><th>Hạng</th><th>Tên giải</th><th>Hạng mục</th><th>Mô tả</th></tr></thead><tbody>{prizes.map(p => <tr key={p.prizeId}><td>{p.rankNo}</td><td>{p.prizeName}</td><td>{trackName(p.trackId)}</td><td>{p.description || '-'}</td></tr>)}</tbody></table>
                </div>
                <div className="card table-card">
                    <div className="section-title"><h2>Nhật ký kiểm tra</h2><span>{auditLogs.length}</span></div>
                    <table className="table"><thead><tr><th>Thời gian</th><th>Người dùng</th><th>Hành động</th><th>Đối tượng</th><th>Giá trị</th></tr></thead><tbody>{auditLogs.slice(0, 12).map(a => <tr key={a.auditId}><td>{fmtDate(a.createdAt)}</td><td>{userName(a.userId)}</td><td>{a.actionName}</td><td>{a.entityName} #{a.entityId}</td><td>{a.newValue || '-'}</td></tr>)}</tbody></table>
                </div>
            </section>
        </main>
    );
}
