'use client';

import { useEffect, useMemo, useState } from 'react';
import DataTable, { type DataTableColumn } from '@/components/table/DataTable';
import Loading from '@/components/common/Loading';
import useAuth from '@/hooks/useAuth';
import { getEvents } from '@/services/eventService';
import { getTracks } from '@/services/trackService';
import { getRounds } from '@/services/roundService';
import { getMyAssignmentDetails } from '@/services/judgeService';
import { getTeams } from '@/services/teamService';
import { getSubmissions } from '@/services/submissionService';
import { getCriteria } from '@/services/criteriaService';
import { getMyScores, getScoreSummary, submitScore } from '@/services/scoreService';
import { isAdminRole, isJudgeRole, roleOf } from '@/utils/rbac';
import { formatNumber } from '@/utils/formatDate';

export default function ScoresPage() {
    const { user } = useAuth() as any;
    const role = roleOf(user);
    const isAdmin = isAdminRole(role);
    const isJudge = isJudgeRole(role);

    if (isAdmin) return <AdminScores />;
    if (isJudge) return <JudgeScoring />;
    return <section className="card forbidden-card"><h2>Không có quyền truy cập</h2><p className="muted">Score chỉ dành cho Admin và Judge.</p></section>;
}

function AdminScores() {
    const [events, setEvents] = useState<any[]>([]);
    const [tracks, setTracks] = useState<any[]>([]);
    const [rounds, setRounds] = useState<any[]>([]);
    const [rows, setRows] = useState<any[]>([]);
    const [eventId, setEventId] = useState('');
    const [trackId, setTrackId] = useState('');
    const [roundId, setRoundId] = useState('');
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    const eventTracks = tracks.filter((item) => !eventId || String(item.eventId) === eventId);
    const eventRounds = rounds.filter((item) => !eventId || String(item.eventId) === eventId);
    const criterionNames = useMemo(() => Array.from(new Set(rows.flatMap((row) => Object.keys(row.criterionScores || {})))), [rows]);

    const columns: DataTableColumn[] = [
        { title: 'Event', key: 'eventName' },
        { title: 'Category', key: 'categoryName' },
        { title: 'Round', key: 'roundName' },
        { title: 'Team', key: 'teamName' },
        { title: 'Judge', key: 'judgeName' },
        ...criterionNames.map((name) => ({ title: name, render: (row: any) => row.criterionScores?.[name] ?? '-' })),
        { title: 'Tổng điểm', render: (row) => formatNumber(row.totalScore) },
        { title: 'Điểm trung bình', render: (row) => formatNumber(row.averageScore) }
    ];

    async function loadBase() {
        setLoading(true);
        setMessage('');
        try {
            const [eventData, trackData, roundData] = await Promise.all([getEvents(), getTracks(), getRounds()]);
            setEvents(eventData);
            setTracks(trackData);
            setRounds(roundData);
            setRows(await getScoreSummary());
        } catch (error: any) {
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    }

    async function applyFilters(next = { eventId, trackId, roundId }) {
        try {
            setRows(await getScoreSummary(next));
        } catch (error: any) {
            setMessage(error.message);
        }
    }

    useEffect(() => { loadBase(); }, []);

    if (loading) return <Loading />;

    return <section className="grid">
        <div className="page-title">
            <div><h2>Quản lý điểm số</h2><p className="muted">Chỉ hiển thị dữ liệu điểm theo Event, Category, Round, Team và Judge.</p></div>
            <button className="compact-button" onClick={loadBase}>Làm mới</button>
        </div>
        {message && <div className="notice">{message}</div>}

        <section className="control-bar card">
            <label>Event<select value={eventId} onChange={(event) => { const value = event.target.value; setEventId(value); setTrackId(''); setRoundId(''); applyFilters({ eventId: value, trackId: '', roundId: '' }); }}><option value="">Tất cả</option>{events.map((item) => <option key={item.eventId} value={item.eventId}>{item.eventName}</option>)}</select></label>
            <label>Category<select value={trackId} onChange={(event) => { const value = event.target.value; setTrackId(value); applyFilters({ eventId, trackId: value, roundId }); }}><option value="">Tất cả</option>{eventTracks.map((item) => <option key={item.trackId} value={item.trackId}>{item.trackName}</option>)}</select></label>
            <label>Round<select value={roundId} onChange={(event) => { const value = event.target.value; setRoundId(value); applyFilters({ eventId, trackId, roundId: value }); }}><option value="">Tất cả</option>{eventRounds.map((item) => <option key={item.roundId} value={item.roundId}>{item.roundName}</option>)}</select></label>
        </section>

        <section className="card">
            <div className="section-title"><h2>Score Report</h2><span>{rows.length} kết quả</span></div>
            <DataTable columns={columns} data={rows} rowKey={(row) => `${row.submissionId}-${row.judgeId}`} emptyText="Chưa có điểm phù hợp bộ lọc" />
        </section>
    </section>;
}

function JudgeScoring() {
    const [assignments, setAssignments] = useState<any[]>([]);
    const [assignmentId, setAssignmentId] = useState('');
    const [teams, setTeams] = useState<any[]>([]);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [criteria, setCriteria] = useState<any[]>([]);
    const [submissionId, setSubmissionId] = useState('');
    const [scoreInputs, setScoreInputs] = useState<Record<string, { value: string; comment: string }>>({});
    const [loading, setLoading] = useState(true);
    const [workspaceLoading, setWorkspaceLoading] = useState(false);
    const [message, setMessage] = useState('');

    const assignment = assignments.find((item) => String(item.assignmentId) === assignmentId);
    const selectedSubmission = submissions.find((item) => String(item.submissionId) === submissionId);
    const teamName = (id: any) => teams.find((team) => String(team.teamId) === String(id))?.teamName || `#${id}`;

    async function loadAssignments() {
        setLoading(true);
        setMessage('');
        try {
            const data = await getMyAssignmentDetails();
            setAssignments(data);
            setAssignmentId((current) => current || String(data?.[0]?.assignmentId || ''));
        } catch (error: any) {
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    }

    async function loadWorkspace(currentAssignment: any) {
        if (!currentAssignment) {
            setTeams([]); setSubmissions([]); setCriteria([]); setSubmissionId('');
            return;
        }
        setWorkspaceLoading(true);
        try {
            const [teamData, submissionData, criterionData] = await Promise.all([
                getTeams({ eventId: currentAssignment.eventId, trackId: currentAssignment.trackId }),
                getSubmissions({ roundId: currentAssignment.roundId }),
                getCriteria(currentAssignment.eventId, false, { trackId: currentAssignment.trackId, roundId: currentAssignment.roundId })
            ]);
            const teamIds = new Set(teamData.map((team: any) => String(team.teamId)));
            const visibleSubmissions = submissionData.filter((item: any) => teamIds.has(String(item.teamId)));
            setTeams(teamData);
            setSubmissions(visibleSubmissions);
            setCriteria(criterionData);
            setSubmissionId(String(visibleSubmissions?.[0]?.submissionId || ''));
        } catch (error: any) {
            setMessage(error.message);
        } finally {
            setWorkspaceLoading(false);
        }
    }

    async function loadExistingScores(currentSubmissionId: string, currentCriteria: any[]) {
        const existing = currentSubmissionId ? await getMyScores(currentSubmissionId) : [];
        const next: Record<string, { value: string; comment: string }> = {};
        currentCriteria.forEach((criterion) => {
            const saved = existing.find((score: any) => String(score.criterionId) === String(criterion.criterionId));
            next[String(criterion.criterionId)] = {
                value: saved?.scoreValue === undefined ? '' : String(saved.scoreValue),
                comment: saved?.comment || ''
            };
        });
        setScoreInputs(next);
    }

    async function onSubmit(event: React.FormEvent) {
        event.preventDefault();
        const entries = criteria.filter((criterion) => scoreInputs[String(criterion.criterionId)]?.value !== '');
        if (!submissionId || entries.length === 0) {
            setMessage('Vui lòng chọn bài nộp và nhập ít nhất một điểm.');
            return;
        }
        try {
            await Promise.all(entries.map((criterion) => {
                const input = scoreInputs[String(criterion.criterionId)];
                return submitScore({
                    submissionId: Number(submissionId),
                    criterionId: Number(criterion.criterionId),
                    scoreValue: Number(input.value),
                    comment: input.comment
                });
            }));
            setMessage('Đã lưu điểm cho bài nộp.');
            await loadExistingScores(submissionId, criteria);
        } catch (error: any) {
            setMessage(error.message);
        }
    }

    useEffect(() => { loadAssignments(); }, []);
    useEffect(() => { loadWorkspace(assignment); }, [assignmentId]);
    useEffect(() => { loadExistingScores(submissionId, criteria).catch((error) => setMessage(error.message)); }, [submissionId, criteria]);

    if (loading) return <Loading />;

    return <section className="grid">
        <div className="page-title">
            <div><h2>Scoring</h2><p className="muted">Judge chỉ xem và chấm các bài thuộc đúng Event, Category và Round được phân công.</p></div>
            <button className="compact-button" onClick={loadAssignments}>Làm mới</button>
        </div>
        {message && <div className="notice">{message}</div>}

        <section className="control-bar card">
            <label>Assignment<select value={assignmentId} onChange={(event) => setAssignmentId(event.target.value)}>{assignments.map((item) => <option key={item.assignmentId} value={item.assignmentId}>{item.eventName} · {item.categoryName} · {item.roundName}</option>)}</select></label>
        </section>

        {assignment && <section className="metric-row">
            <div><span>Event</span><strong className="metric-text">{assignment.eventName}</strong></div>
            <div><span>Category</span><strong className="metric-text">{assignment.categoryName}</strong></div>
            <div><span>Round</span><strong className="metric-text">{assignment.roundName}</strong></div>
            <div><span>Bài cần chấm</span><strong>{submissions.length}</strong></div>
        </section>}

        {workspaceLoading ? <Loading /> : <>
            <section className="card">
                <h2>Bài nộp thuộc phân công</h2>
                <DataTable columns={[
                    { title: 'Team', render: (row) => teamName(row.teamId) },
                    { title: 'Repository', render: (row) => row.repositoryUrl ? <a className="text-link" href={row.repositoryUrl} target="_blank" rel="noreferrer">Mở repository</a> : '-' },
                    { title: 'Demo', render: (row) => row.demoUrl ? <a className="text-link" href={row.demoUrl} target="_blank" rel="noreferrer">Mở demo</a> : '-' },
                    { title: 'Báo cáo', render: (row) => row.reportUrl ? <a className="text-link" href={row.reportUrl} target="_blank" rel="noreferrer">Mở báo cáo</a> : '-' },
                    { title: 'Chấm điểm', render: (row) => <button className={String(row.submissionId) === submissionId ? '' : 'secondary'} onClick={() => setSubmissionId(String(row.submissionId))}>{String(row.submissionId) === submissionId ? 'Đang chọn' : 'Chọn'}</button> }
                ]} data={submissions} rowKey="submissionId" emptyText="Chưa có bài nộp trong vòng được giao" />
            </section>

            <section className="card">
                <div className="section-title"><div><h2>Phiếu chấm điểm</h2><p className="muted">{selectedSubmission ? `Team: ${teamName(selectedSubmission.teamId)}` : 'Chưa chọn bài nộp'}</p></div><span>{criteria.length} tiêu chí</span></div>
                <form className="grid" onSubmit={onSubmit}>
                    <div className="criteria-score-grid">
                        {criteria.map((criterion) => {
                            const id = String(criterion.criterionId);
                            const input = scoreInputs[id] || { value: '', comment: '' };
                            return <div className="criterion-score-card" key={id}>
                                <div className="section-title"><h3>{criterion.criterionName}</h3><span>Tối đa {criterion.maxScore}</span></div>
                                <p className="muted small">{criterion.description || 'Không có mô tả.'}</p>
                                <label>Điểm<input type="number" min="0" max={criterion.maxScore} step="0.25" value={input.value} onChange={(event) => setScoreInputs({ ...scoreInputs, [id]: { ...input, value: event.target.value } })} /></label>
                                <label>Nhận xét<textarea value={input.comment} onChange={(event) => setScoreInputs({ ...scoreInputs, [id]: { ...input, comment: event.target.value } })} /></label>
                            </div>;
                        })}
                    </div>
                    <button className="compact-button" disabled={!submissionId || criteria.length === 0}>Lưu toàn bộ điểm</button>
                </form>
            </section>
        </>}
    </section>;
}