'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import DashboardCard from '@/components/card/DashboardCard';
import DataTable from '@/components/table/DataTable';
import Loading from '@/components/common/Loading';
import { getEvents, getEventStandings } from '@/services/eventService';
import { getTracks } from '@/services/trackService';
import { getRounds } from '@/services/roundService';
import { getTeams } from '@/services/teamService';
import { getSubmissions } from '@/services/submissionService';
import { getRoundRanking } from '@/services/rankingService';
import { formatNumber } from '@/utils/formatDate';

export default function DashboardPage() {
    const [data, setData] = useState<any>({ loading:true, events:[], tracks:[], rounds:[], teams:[], submissions:[], standings:{}, ranking:[], message:'' });

    async function load() {
        try {
            const events = await getEvents();
            const eventId = events?.[0]?.eventId;
            const [tracks, rounds, teams, submissions, standings] = await Promise.all([
                getTracks(eventId), getRounds(eventId), getTeams({ eventId }), getSubmissions({}), eventId ? getEventStandings(eventId) : {}
            ]);
            const latestRoundId = rounds?.[rounds.length - 1]?.roundId;
            const ranking = latestRoundId ? await getRoundRanking(latestRoundId) : [];
            setData({ loading:false, events, tracks, rounds, teams, submissions, standings, ranking, message:'' });
        } catch (err: any) {
            setData((old: any) => ({ ...old, loading:false, message: err.message }));
        }
    }

    useEffect(() => { load(); }, []);

    if (data.loading) return <Loading />;

    return (
        <section className="grid">
            {data.message && <div className="notice error">{data.message}</div>}
            <div className="page-title">
                <div><h2>Tổng quan</h2><p className="muted">Các số liệu chính của hệ thống SEAL Hackathon.</p></div>
                <Link className="button-link" href="/dashboard/events/create">Tạo sự kiện</Link>
            </div>
            <div className="grid grid-4">
                <DashboardCard label="Sự kiện" value={data.events.length} note="Tổng số event" />
                <DashboardCard label="Hạng mục" value={data.tracks.length} note="Track theo event" />
                <DashboardCard label="Vòng thi" value={data.rounds.length} note="Round đang có" />
                <DashboardCard label="Đội thi" value={data.teams.length} note={`${data.teams.filter((t: any)=>t.status==='Approved').length} đội đã duyệt`} />
            </div>
            <section className="card">
                <div className="metric-row">
                    <div><strong>{data.standings.trackCount ?? data.tracks.length}</strong><span>Hạng mục</span></div>
                    <div><strong>{data.standings.roundCount ?? data.rounds.length}</strong><span>Vòng thi</span></div>
                    <div><strong>{data.standings.teamCount ?? data.teams.length}</strong><span>Đội thi</span></div>
                    <div><strong>{data.standings.submissionCount ?? data.submissions.length}</strong><span>Bài nộp</span></div>
                </div>
            </section>
            <section className="card">
                <div className="section-title"><h2>Xếp hạng mới nhất</h2><span>{data.ranking.length} đội</span></div>
                <DataTable columns={[
                    {title:'Hạng',key:'rankNo'},
                    {title:'Đội',key:'teamName'},
                    {title:'Track ID',key:'trackId'},
                    {title:'Điểm',render:(r)=>formatNumber(r.finalScore)}
                ]} data={data.ranking.slice(0,10)} rowKey={(r)=>`${r.teamId}-${r.rankNo}`} />
            </section>
        </section>
    );
}