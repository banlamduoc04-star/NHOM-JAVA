'use client';

import { useEffect, useState } from 'react';
import DataTable from '@/components/table/DataTable';
import Loading from "@/components/common/Loading";
import { getEvents } from '@/services/eventService';
import { getRounds } from '@/services/roundService';
import { getTracks } from '@/services/trackService';
import { getRoundRanking, getTeamsAdvance, getJudgeVariance, getReliabilitySummary, getCsvUrl } from '@/services/rankingService';
import { formatNumber } from '@/utils/formatDate';

export default function RankingPage() {
    const [events,setEvents]=useState<any[]>([]),[rounds,setRounds]=useState<any[]>([]),[tracks,setTracks]=useState<any[]>([]),[ranking,setRanking]=useState<any[]>([]),[advance,setAdvance]=useState<any[]>([]),[variance,setVariance]=useState<any[]>([]),[reliability,setReliability]=useState<any>({});
    const [eventId,setEventId]=useState(''),[roundId,setRoundId]=useState(''),[trackId,setTrackId]=useState('');
    const [loading,setLoading]=useState(true),[message,setMessage]=useState('');

    async function loadBase(){const ev=await getEvents();const eid=eventId||ev?.[0]?.eventId||'';const [rd,tr]=await Promise.all([eid?getRounds(eid):[],eid?getTracks(eid):[]]);setEvents(ev);setEventId(eid);setRounds(rd);setRoundId(rd?.[0]?.roundId||'');setTracks(tr);setLoading(false);}
    async function loadRanking(){if(!roundId)return;const [rk,av]=await Promise.all([getRoundRanking(roundId,trackId||undefined),getTeamsAdvance(roundId)]);setRanking(rk);setAdvance(av);}
    async function loadResearch(){if(!eventId)return;try{const [v,r]=await Promise.all([getJudgeVariance(eventId),getReliabilitySummary(eventId)]);setVariance(v);setReliability(r||{});}catch{}}
    useEffect(()=>{loadBase().catch(e=>{setMessage(e.message);setLoading(false);});},[]);
    useEffect(()=>{if(eventId)Promise.all([getRounds(eventId),getTracks(eventId)]).then(([rd,tr])=>{setRounds(rd);setRoundId(rd?.[0]?.roundId||'');setTracks(tr);setTrackId('');});loadResearch();},[eventId]);
    useEffect(()=>{loadRanking().catch(e=>setMessage(e.message));},[roundId,trackId]);
    if(loading)return <Loading/>;

    return <section className="grid">
        <div className="page-title"><div><h2>Xếp hạng & RBL</h2><p className="muted">Điểm tổng hợp, đội thăng vòng và độ tin cậy liên đánh giá viên.</p></div><button onClick={()=>{loadRanking();loadResearch();}}>Làm mới</button></div>
        {message&&<div className="notice error">{message}</div>}
        <section className="control-bar card"><label>Sự kiện<select value={eventId} onChange={(e)=>setEventId(e.target.value)}>{events.map(e=><option key={e.eventId} value={e.eventId}>{e.eventName}</option>)}</select></label><label>Vòng<select value={roundId} onChange={(e)=>setRoundId(e.target.value)}>{rounds.map(r=><option key={r.roundId} value={r.roundId}>{r.roundName}</option>)}</select></label><label>Hạng mục<select value={trackId} onChange={(e)=>setTrackId(e.target.value)}><option value="">Tất cả</option>{tracks.map(t=><option key={t.trackId} value={t.trackId}>{t.trackName}</option>)}</select></label></section>
        <section className="grid grid-2"><div className="card"><h2>Xếp hạng</h2><DataTable columns={[{title:'Hạng',key:'rankNo'},{title:'Đội',key:'teamName'},{title:'Track',key:'trackId'},{title:'Điểm',render:(r)=>formatNumber(r.finalScore)}]} data={ranking} rowKey={(r)=>`${r.teamId}-${r.rankNo}`}/></div><div className="card"><h2>Đội thăng vòng</h2><DataTable columns={[{title:'Hạng',key:'rankNo'},{title:'Đội',key:'teamName'},{title:'Track',key:'trackId'},{title:'Điểm',render:(r)=>formatNumber(r.finalScore)}]} data={advance} rowKey={(r)=>`${r.teamId}-a`}/></div></section>
        <section className="card"><div className="section-title"><h2>RBL</h2>{eventId&&<a className="text-link" href={getCsvUrl(eventId)} target="_blank">Xuất CSV ẩn danh</a>}</div><div className="metric-row"><div><strong>{formatNumber(reliability.overall?.iccOneWayApprox)}</strong><span>ICC</span></div><div><strong>{formatNumber(reliability.overall?.krippendorffAlphaApprox)}</strong><span>Alpha</span></div><div><strong>{formatNumber(reliability.overall?.averageRange)}</strong><span>Biên độ TB</span></div><div><strong>{variance.length}</strong><span>Dòng phương sai</span></div></div><p className="muted soft-gap">{reliability.overall?.interpretation || 'Chưa đủ dữ liệu để diễn giải.'}</p></section>
        <section className="card"><h2>Phương sai điểm</h2><DataTable columns={[{title:'Vòng',key:'roundName'},{title:'Hạng mục',key:'trackName'},{title:'Mã đội',key:'anonymousTeamCode'},{title:'Tiêu chí',key:'criterionName'},{title:'Số GK',key:'judgeCount'},{title:'TB',key:'averageScore'},{title:'Range',key:'scoreRange'},{title:'Variance',key:'scoreVariance'}]} data={variance.slice(0,20)} rowKey={(r,i)=>`${r.anonymousTeamCode}-${i}`}/></section>
    </section>;
}