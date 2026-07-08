'use client';

import { useEffect, useState } from 'react';
import DataTable from '@/components/table/DataTable';
import Loading from '@/components/common/Loading';
import { getEvents } from '@/services/eventService';
import { getTracks, createTrack, getTrackMentors, assignTrackMentor, removeTrackMentor } from '@/services/trackService';
import { getUsers } from '@/services/judgeService';

export default function TracksPage() {
    const [events,setEvents]=useState<any[]>([]),[tracks,setTracks]=useState<any[]>([]),[mentors,setMentors]=useState<any[]>([]),[trackMentors,setTrackMentors]=useState<any[]>([]);
    const [eventId,setEventId]=useState(''),[trackId,setTrackId]=useState(''),[mentorId,setMentorId]=useState('');
    const [form,setForm]=useState<any>({trackName:'Ứng dụng Web',description:'Hạng mục dành cho sản phẩm web.'});
    const [loading,setLoading]=useState(true),[message,setMessage]=useState('');
    const mentorName=(id: any)=>mentors.find(m=>m.userId===id)?.fullName||`#${id}`;

    async function load(){
        const ev=await getEvents(); const eid=eventId||ev?.[0]?.eventId||'';
        const [tr,mt,tm]=await Promise.all([eid?getTracks(eid):[],getUsers({roleName:'Mentor'}),eid?getTrackMentors({eventId:eid}):[]]);
        setEvents(ev);setEventId(eid);setTracks(tr);setTrackId(tr?.[0]?.trackId||'');setMentors(mt);setMentorId(mt?.[0]?.userId||'');setTrackMentors(tm);setLoading(false);
    }
    async function reload(eid=eventId){const [tr,tm]=await Promise.all([getTracks(eid),getTrackMentors({eventId:eid})]);setTracks(tr);setTrackId(tr?.[0]?.trackId||'');setTrackMentors(tm);}
    async function onCreate(e: any){e.preventDefault(); await createTrack({...form,eventId:Number(eventId)});setMessage('Đã tạo hạng mục');reload();}
    async function onAssign(e: any){e.preventDefault(); await assignTrackMentor({trackId:Number(trackId),mentorId:Number(mentorId)});setMessage('Đã gán mentor');reload();}
    useEffect(()=>{load().catch(e=>{setMessage(e.message);setLoading(false);});},[]);
    useEffect(()=>{if(eventId)reload(eventId);},[eventId]);
    if(loading)return <Loading/>;

    return <section className="grid">
        <div className="page-title"><div><h2>Hạng mục</h2><p className="muted">Tạo track và phân công mentor.</p></div><button onClick={load}>Làm mới</button></div>
        {message&&<div className="notice">{message}</div>}
        <section className="control-bar card"><label>Sự kiện<select value={eventId} onChange={(e)=>setEventId(e.target.value)}>{events.map(e=><option key={e.eventId} value={e.eventId}>{e.eventName}</option>)}</select></label></section>
        <section className="grid grid-2"><div className="card"><h2>Tạo hạng mục</h2><form className="form-grid" onSubmit={onCreate}><label>Tên<input value={form.trackName} onChange={(e)=>setForm({...form,trackName:e.target.value})}/></label><label className="span-2">Mô tả<textarea value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})}/></label><button>Tạo hạng mục</button></form></div>
            <div className="card"><h2>Gán mentor</h2><form className="form-grid" onSubmit={onAssign}><label>Hạng mục<select value={trackId} onChange={(e)=>setTrackId(e.target.value)}>{tracks.map(t=><option key={t.trackId} value={t.trackId}>{t.trackName}</option>)}</select></label><label>Mentor<select value={mentorId} onChange={(e)=>setMentorId(e.target.value)}>{mentors.map(m=><option key={m.userId} value={m.userId}>{m.fullName}</option>)}</select></label><button>Gán mentor</button></form></div></section>
        <section className="card"><h2>Danh sách hạng mục</h2><DataTable columns={[{title:'ID',key:'trackId'},{title:'Tên',key:'trackName'},{title:'Mô tả',key:'description'},{title:'Mentor',render:(r)=>trackMentors.filter(x=>x.trackId===r.trackId).map(x=>mentorName(x.mentorId)).join(', ')||'-'},{title:'Bỏ gán',render:(r)=>{const a=trackMentors.find(x=>x.trackId===r.trackId);return a?<button className="secondary" onClick={async()=>{await removeTrackMentor(a.trackMentorId);reload();}}>Bỏ gán</button>:'-';}}]} data={tracks} rowKey="trackId"/></section>
    </section>;
}