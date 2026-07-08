'use client';

import { useEffect, useState } from 'react';
import DataTable from '@/components/table/DataTable';
import Loading from "@/components/common/Loading";
import { getEvents } from '@/services/eventService';
import { getTracks } from '@/services/trackService';
import { getTeams } from '@/services/teamService';
import { getPrizes, createPrize, awardPrize } from '@/services/prizeService';

export default function PrizesPage() {
    const [events,setEvents]=useState<any[]>([]),[tracks,setTracks]=useState<any[]>([]),[teams,setTeams]=useState<any[]>([]),[prizes,setPrizes]=useState<any[]>([]);
    const [eventId,setEventId]=useState(''),[trackId,setTrackId]=useState(''),[teamId,setTeamId]=useState(''),[prizeId,setPrizeId]=useState('');
    const [form,setForm]=useState<any>({prizeName:'Giải Nhất',rankNo:'1',description:'Trao cho đội có điểm cao nhất.'});
    const [loading,setLoading]=useState(true),[message,setMessage]=useState('');
    const trackName=(id: any)=>tracks.find(t=>t.trackId===id)?.trackName||`#${id}`;

    async function load(){const ev=await getEvents();const eid=eventId||ev?.[0]?.eventId||'';const [tr,tm,pr]=await Promise.all([eid?getTracks(eid):[],eid?getTeams({eventId:eid}):[],eid?getPrizes({eventId:eid}):[]]);setEvents(ev);setEventId(eid);setTracks(tr);setTrackId(tr?.[0]?.trackId||'');setTeams(tm);setTeamId(tm?.[0]?.teamId||'');setPrizes(pr);setPrizeId(pr?.[0]?.prizeId||'');setLoading(false);}
    async function reload(eid=eventId){const [tr,tm,pr]=await Promise.all([getTracks(eid),getTeams({eventId:eid}),getPrizes({eventId:eid})]);setTracks(tr);setTrackId(tr?.[0]?.trackId||'');setTeams(tm);setTeamId(tm?.[0]?.teamId||'');setPrizes(pr);setPrizeId(pr?.[0]?.prizeId||'');}
    async function onCreate(e: any){e.preventDefault();await createPrize({eventId:Number(eventId),trackId:Number(trackId),prizeName:form.prizeName,rankNo:Number(form.rankNo),description:form.description});setMessage('Đã tạo giải thưởng');reload();}
    async function onAward(e: any){e.preventDefault();await awardPrize({teamId:Number(teamId),prizeId:Number(prizeId)});setMessage('Đã trao giải');}
    useEffect(()=>{load().catch(e=>{setMessage(e.message);setLoading(false);});},[]);
    useEffect(()=>{if(eventId)reload(eventId);},[eventId]);
    if(loading)return <Loading/>;

    return <section className="grid">
        <div className="page-title"><div><h2>Giải thưởng</h2><p className="muted">Tạo cơ cấu giải và trao giải cho đội.</p></div><button onClick={load}>Làm mới</button></div>
        {message&&<div className="notice">{message}</div>}
        <section className="control-bar card"><label>Sự kiện<select value={eventId} onChange={(e)=>setEventId(e.target.value)}>{events.map(e=><option key={e.eventId} value={e.eventId}>{e.eventName}</option>)}</select></label><label>Hạng mục<select value={trackId} onChange={(e)=>setTrackId(e.target.value)}>{tracks.map(t=><option key={t.trackId} value={t.trackId}>{t.trackName}</option>)}</select></label></section>
        <section className="grid grid-2"><div className="card"><h2>Tạo giải</h2><form className="form-grid" onSubmit={onCreate}><label>Tên giải<input value={form.prizeName} onChange={(e)=>setForm({...form,prizeName:e.target.value})}/></label><label>Hạng<input value={form.rankNo} onChange={(e)=>setForm({...form,rankNo:e.target.value})}/></label><label className="span-2">Mô tả<textarea value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})}/></label><button>Tạo giải</button></form></div><div className="card"><h2>Trao giải</h2><form className="form-grid" onSubmit={onAward}><label>Đội<select value={teamId} onChange={(e)=>setTeamId(e.target.value)}>{teams.map(t=><option key={t.teamId} value={t.teamId}>{t.teamName}</option>)}</select></label><label>Giải<select value={prizeId} onChange={(e)=>setPrizeId(e.target.value)}>{prizes.map(p=><option key={p.prizeId} value={p.prizeId}>{p.prizeName}</option>)}</select></label><button>Trao giải</button></form></div></section>
        <section className="card"><h2>Danh sách giải</h2><DataTable columns={[{title:'ID',key:'prizeId'},{title:'Hạng',key:'rankNo'},{title:'Tên giải',key:'prizeName'},{title:'Hạng mục',render:(r)=>trackName(r.trackId)},{title:'Mô tả',key:'description'}]} data={prizes} rowKey="prizeId"/></section>
    </section>;
}