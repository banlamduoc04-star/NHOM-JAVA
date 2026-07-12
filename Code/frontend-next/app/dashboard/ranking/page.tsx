'use client';

import { useEffect, useState } from 'react';
import DataTable from '@/components/table/DataTable';
import Loading from '@/components/common/Loading';
import useAuth from '@/hooks/useAuth';
import { getEvents } from '@/services/eventService';
import { getRounds } from '@/services/roundService';
import { getTracks } from '@/services/trackService';
import {
    downloadRankingCsv,
    downloadRankingExcel,
    downloadResearchCsv,
    getJudgeVariance,
    getRankingRows,
    getReliabilitySummary,
    getTeamsAdvance,
    publishRoundResults
} from '@/services/rankingService';
import { formatNumber } from '@/utils/formatDate';
import { isAdminRole, roleOf } from '@/utils/rbac';
import type { RankingExportRow } from '@/types/score';

export default function RankingPage() {
    const { user } = useAuth() as any;
    const canPublish = isAdminRole(roleOf(user));
    const isStudent = roleOf(user) === 'TeamMember';
    const [events, setEvents] = useState<any[]>([]);
    const [rounds, setRounds] = useState<any[]>([]);
    const [tracks, setTracks] = useState<any[]>([]);
    const [ranking, setRanking] = useState<RankingExportRow[]>([]);
    const [advance, setAdvance] = useState<any[]>([]);
    const [variance, setVariance] = useState<any[]>([]);
    const [reliability, setReliability] = useState<any>({});
    const [eventId, setEventId] = useState('');
    const [roundId, setRoundId] = useState('');
    const [trackId, setTrackId] = useState('');
    const [loading, setLoading] = useState(true);
    const [tableLoading, setTableLoading] = useState(false);
    const [message, setMessage] = useState('');

    const exportParams = { eventId, roundId: roundId || undefined, trackId: trackId || undefined };

    async function loadBase() {
        const ev = await getEvents();
        setEvents(ev || []);
        setEventId(String(ev?.[0]?.eventId || ''));
        setLoading(false);
    }

    async function loadFilters(selectedEventId: string) {
        if (!selectedEventId) {
            setRounds([]);
            setTracks([]);
            return;
        }
        const [rd, tr] = await Promise.all([getRounds(selectedEventId), getTracks(selectedEventId)]);
        setRounds(rd || []);
        setTracks(tr || []);
    }

    async function loadRanking() {
        setTableLoading(true);
        try {
            const rows = await getRankingRows(exportParams);
            setRanking(rows || []);
            if (roundId) {
                const av = await getTeamsAdvance(roundId, trackId || undefined);
                setAdvance(av || []);
            } else {
                setAdvance([]);
            }
        } finally {
            setTableLoading(false);
        }
    }

    async function loadResearch() {
        if (!eventId || !canPublish) {
            setVariance([]);
            setReliability({});
            return;
        }
        try {
            const [v, r] = await Promise.all([getJudgeVariance(eventId), getReliabilitySummary(eventId)]);
            setVariance(v || []);
            setReliability(r || {});
        } catch {}
    }

    async function onPublish() {
        if (!roundId) {
            setMessage('Vui lòng chọn một vòng cụ thể trước khi publish result.');
            return;
        }
        try {
            await publishRoundResults(roundId);
            setMessage('Đã aggregate → average score → rank → publish result và tạo notification cho TeamMember.');
            await loadRanking();
        } catch (e: any) {
            setMessage(e.message);
        }
    }

    async function onExportCsv() {
        try {
            await downloadRankingCsv(exportParams);
        } catch (e: any) {
            setMessage(e.message);
        }
    }

    async function onExportExcel() {
        try {
            await downloadRankingExcel(exportParams);
        } catch (e: any) {
            setMessage(e.message);
        }
    }

    async function onExportResearchCsv() {
        try {
            await downloadResearchCsv(eventId);
        } catch (e: any) {
            setMessage(e.message);
        }
    }

    function onEventChange(value: string) {
        setEventId(value);
        setRoundId('');
        setTrackId('');
    }

    useEffect(() => {
        loadBase().catch((e) => {
            setMessage(e.message);
            setLoading(false);
        });
    }, []);

    useEffect(() => {
        loadFilters(eventId).catch((e) => setMessage(e.message));
        loadResearch();
    }, [eventId]);

    useEffect(() => {
        loadRanking().catch((e) => setMessage(e.message));
    }, [eventId, roundId, trackId]);

    if (loading) return <Loading />;

    return <section className="grid">
        <div className="page-title">
            <div>
                <h2>Ranking</h2>
                <p className="muted">Bảng xếp hạng được lọc theo Event, Category và Round; mặc định sắp xếp theo điểm giảm dần.</p>
            </div>
            <div className="mini-actions">
                <button className="secondary" onClick={() => { loadRanking(); loadResearch(); }}>Làm mới</button>
                {canPublish && <button className="secondary" onClick={onExportCsv}>Export CSV</button>}
                {canPublish && <button className="secondary" onClick={onExportExcel}>Export Excel</button>}
                {canPublish && <button onClick={onPublish} disabled={!roundId}>Publish Result</button>}
            </div>
        </div>

        {message && <div className="notice">{message}</div>}
        {isStudent && <div className="notice">Điểm và kết quả chỉ xuất hiện sau khi Admin công bố. Hệ thống chỉ hiển thị kết quả của đội bạn.</div>}

        <section className="control-bar card">
            <label>Event
                <select value={eventId} onChange={(e) => onEventChange(e.target.value)}>
                    {events.map((e) => <option key={e.eventId} value={e.eventId}>{e.eventName}</option>)}
                </select>
            </label>
            <label>Category
                <select value={trackId} onChange={(e) => setTrackId(e.target.value)}>
                    <option value="">Tất cả</option>
                    {tracks.map((t) => <option key={t.trackId} value={t.trackId}>{t.trackName}</option>)}
                </select>
            </label>
            <label>Round
                <select value={roundId} onChange={(e) => setRoundId(e.target.value)}>
                    <option value="">Tất cả</option>
                    {rounds.map((r) => <option key={r.roundId} value={r.roundId}>{r.roundName}</option>)}
                </select>
            </label>
        </section>

        <section className="card">
            <div className="section-title">
                <h2>Bảng xếp hạng</h2>
                <span>{tableLoading ? 'Đang tải...' : `${ranking.length} đội`}</span>
            </div>
            <DataTable
                columns={[
                    { title: 'Rank', key: 'rankNo' },
                    { title: 'Team', key: 'teamName' },
                    { title: 'Event', key: 'eventName' },
                    { title: 'Category', key: 'trackName' },
                    { title: 'Round', key: 'roundName' },
                    { title: 'Điểm chi tiết', render: (r) => r.criterionScores?.length ? <div className="chip-list">{r.criterionScores.map((item: any) => <span className="info-chip" key={item.criterionId}>{item.criterionName}: {formatNumber(item.averageScore)}/{formatNumber(item.maxScore)}</span>)}</div> : <span className="muted">Chưa có điểm</span> },
                    { title: 'Tổng điểm', render: (r) => formatNumber(r.finalScore ?? r.totalScore) },
                    { title: 'Average Score', render: (r) => formatNumber(r.averageScore) },
                    { title: 'Kết quả', render: (r) => r.resultStatus || (r.isPublished ? 'Đã công bố' : 'Chưa công bố') },
                    { title: 'Award', render: (r) => r.awardStatus || '-' }
                ]}
                data={ranking}
                rowKey={(r, i) => `${r.eventId}-${r.roundId}-${r.trackId}-${r.teamId}-${r.rankNo}-${i}`}
                emptyText={isStudent ? 'Kết quả chưa được công bố hoặc đội bạn chưa có kết quả.' : 'Chưa có dữ liệu xếp hạng.'}
            />
            {canPublish && <p className="muted soft-gap">Export CSV/Excel lấy đúng dữ liệu đang hiển thị theo bộ lọc hiện tại.</p>}
        </section>

        {roundId && !isStudent && <section className="card">
            <div className="section-title"><h2>Đội thăng vòng</h2><span>{advance.length} đội</span></div>
            <DataTable
                columns={[
                    { title: 'Hạng', key: 'rankNo' },
                    { title: 'Đội', key: 'teamName' },
                    { title: 'Category', render: (r) => tracks.find((t) => String(t.trackId) === String(r.trackId))?.trackName || r.trackId },
                    { title: 'Điểm', render: (r) => formatNumber(r.finalScore) }
                ]}
                data={advance}
                rowKey={(r) => `${r.teamId}-a`}
            />
        </section>}

        {canPublish && <section className="card">
            <div className="section-title"><h2>RBL</h2>{eventId && <button className="secondary compact-button" onClick={onExportResearchCsv}>Xuất dữ liệu phân tích RBL</button>}</div>
            <div className="metric-row"><div><strong>{formatNumber(reliability.overall?.iccOneWayApprox)}</strong><span>ICC</span></div><div><strong>{formatNumber(reliability.overall?.krippendorffAlphaApprox)}</strong><span>Alpha</span></div><div><strong>{formatNumber(reliability.overall?.averageRange)}</strong><span>Biên độ TB</span></div><div><strong>{variance.length}</strong><span>Dòng phương sai</span></div></div>
            <p className="muted soft-gap">{reliability.overall?.interpretation || 'Chưa đủ dữ liệu để diễn giải.'}</p>
        </section>}

        {canPublish && <section className="card"><h2>Phương sai điểm</h2><DataTable columns={[{ title: 'Vòng', key: 'roundName' }, { title: 'Hạng mục', key: 'trackName' }, { title: 'Mã đội', key: 'anonymousTeamCode' }, { title: 'Tiêu chí', key: 'criterionName' }, { title: 'Số GK', key: 'judgeCount' }, { title: 'TB', key: 'averageScore' }, { title: 'Range', key: 'scoreRange' }, { title: 'Variance', key: 'scoreVariance' }]} data={variance.slice(0, 20)} rowKey={(r, i) => `${r.anonymousTeamCode}-${i}`} /></section>}
    </section>;
}
