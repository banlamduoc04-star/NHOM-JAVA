<section className="control-bar card"><label>Sự kiện<select value={eventId} onChange={(e)=>setEventId(e.target.value)}>{events.map(e=><option key={e.eventId} value={e.eventId}>{e.eventName}</option>)}</select></label><label>Vòng<select value={roundId} onChange={(e)=>setRoundId(e.target.value)}>{rounds.map(r=><option key={r.roundId} value={r.roundId}>{r.roundName}</option>)}</select></label></section>
<section className="card"><h2>Gửi bài</h2><form className="form-grid" onSubmit={onCreate}><label>Đội<select value={teamId} onChange={(e)=>setTeamId(e.target.value)}>{teams.map(t=><option key={t.teamId} value={t.teamId}>{t.teamName}</option>)}</select></label><label>Repository<input value={form.repositoryUrl} onChange={(e)=>setForm({...form,repositoryUrl:e.target.value})}/></label><label>Demo<input value={form.demoUrl} onChange={(e)=>setForm({...form,demoUrl:e.target.value})}/></label><label>Báo cáo<input value={form.reportUrl} onChange={(e)=>setForm({...form,reportUrl:e.target.value})}/></label><button>Gửi bài</button></form></section>
<section className="card"><h2>Danh sách bài nộp</h2><DataTable columns={[{title:'ID',key:'submissionId'},{title:'Đội',render:(r)=>teamName(r.teamId)},{title:'Vòng',render:(r)=>roundName(r.roundId)},{title:'Repo',render:(r)=>link(r.repositoryUrl)},{title:'Demo',render:(r)=>link(r.demoUrl)},{title:'Báo cáo',render:(r)=>link(r.reportUrl)},{title:'Nộp lúc',render:(r)=>formatDate(r.submittedAt)},{title:'Trạng thái',render:(r)=><span className="table-badge">{r.isEliminated?'Đã loại':'Hợp lệ'}</span>},{title:'Thao tác',render:(r)=><button className="secondary" onClick={()=>onEliminate(r)}>Loại</button>}]} data={subs} rowKey="submissionId"/></section>
</section>;
}
'use client';

import { useEffect, useState } from 'react';
import DataTable from '@/components/table/DataTable';
import Loading from '@/components/common/Loading';
import { getEvents } from '@/services/eventService';
import { getRounds } from '@/services/roundService';
import { getTeams } from '@/services/teamService';
import { getSubmissions, createSubmission, eliminateSubmission } from '@/services/submissionService';
import { formatDate } from '@/utils/formatDate';

export default function SubmissionsPage() {
    const [events,setEvents]=useState<any[]>([]),[rounds,setRounds]=useState<any[]>([]),[teams,setTeams]=useState<any[]>([]),[subs,setSubs]=useState<any[]>([]);
    const [eventId,setEventId]=useState(''),[roundId,setRoundId]=useState(''),[teamId,setTeamId]=useState('');
    const [form,setForm]=useState<any>({repositoryUrl:'https://github.com/example/seal-project',demoUrl:'https://demo.example.com',reportUrl:'https://drive.google.com/example'});
    const [message,setMessage]=useState(''),[loading,setLoading]=useState(true);
    const teamName=(id: any)=>teams.find(t=>t.teamId===id)?.teamName||`#${id}`;
    const roundName=(id: any)=>rounds.find(r=>r.roundId===id)?.roundName||`#${id}`;
    const link=(url: any)=>url?<a className="text-link" href={url} target="_blank">Mở</a>:'-';

    async function load(){const ev=await getEvents();const eid=eventId||ev?.[0]?.eventId||'';const [rd,tm]=await Promise.all([eid?getRounds(eid):[],eid?getTeams({eventId:eid}):[]]);const rid=roundId||rd?.[0]?.roundId||'';const sb=rid?await getSubmissions({roundId:rid}):[];setEvents(ev);setEventId(eid);setRounds(rd);setRoundId(rid);setTeams(tm);setTeamId(tm?.[0]?.teamId||'');setSubs(sb);setLoading(false);}
    async function reload(rid=roundId){setSubs(rid?await getSubmissions({roundId:rid}):[]);}
    async function onCreate(e: any){e.preventDefault();await createSubmission({...form,teamId:Number(teamId),roundId:Number(roundId)});setMessage('Đã gửi bài nộp');reload();}
    async function onEliminate(row: any){const reason=prompt('Lý do loại bài nộp:','Vi phạm quy chế');if(!reason)return;await eliminateSubmission(row.submissionId,reason);setMessage('Đã loại bài nộp');reload();}
    useEffect(()=>{load().catch(e=>{setMessage(e.message);setLoading(false);});},[]);
    useEffect(()=>{if(eventId)Promise.all([getRounds(eventId),getTeams({eventId})]).then(([rd,tm])=>{setRounds(rd);setRoundId(rd?.[0]?.roundId||'');setTeams(tm);setTeamId(tm?.[0]?.teamId||'');});},[eventId]);
    useEffect(()=>{reload(roundId);},[roundId]);
    if(loading)return <Loading/>;

    return <section className="grid">
        <div className="page-title"><div><h2>Bài nộp</h2><p className="muted">Repository, demo và báo cáo theo vòng.</p></div><button onClick={load}>Làm mới</button></div>
        {message&&<div className="notice">{message}</div>}