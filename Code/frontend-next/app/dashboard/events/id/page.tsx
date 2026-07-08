'use client';

import { useEffect, useState } from 'react';
import Loading from "@/components/common/Loading";
import DataTable from '@/components/table/DataTable';
import { getEvent, getEventStandings, getAnnouncements, createAnnouncement } from '@/services/eventService';
import { getTracks } from '@/services/trackService';
import { getRounds } from '@/services/roundService';
import { getTeams } from '@/services/teamService';

export default function EventDetailPage({ params }: { params: { id: string } }) {
    const eventId = Number(params.id);
    const [data,setData]=useState<any>({event:null,standings:{},tracks:[],rounds:[],teams:[],announcements:[]});
    const [form,setForm]=useState<any>({title:'Mở cổng nộp bài',content:'Các đội nộp bài đúng hạn.',targetRole:'All'});
    const [loading,setLoading]=useState(true);
    const [message,setMessage]=useState('');

    async function load(){
        const [event,standings,tracks,rounds,teams,announcements]=await Promise.all([getEvent(eventId),getEventStandings(eventId),getTracks(eventId),getRounds(eventId),getTeams({eventId}),getAnnouncements(eventId)]);
        setData({event,standings,tracks,rounds,teams,announcements}); setLoading(false);
    }
    async function onSubmit(e: any){e.preventDefault();await createAnnouncement({eventId,...form,isPublished:true});setMessage('Đã đăng thông báo');load();}
    useEffect(()=>{load().catch(e=>{setMessage(e.message);setLoading(false);});},[eventId]);
    if(loading) return <Loading/>;

    return <section className="grid">
        {message&&<div className="notice">{message}</div>}
        <div className="page-title"><div><h2>{data.event?.eventName}</h2><p className="muted">{data.event?.description}</p></div></div>
        <section className="card"><div className="metric-row"><div><strong>{data.standings.trackCount??data.tracks.length}</strong><span>Hạng mục</span></div><div><strong>{data.standings.roundCount??data.rounds.length}</strong><span>Vòng</span></div><div><strong>{data.standings.teamCount??data.teams.length}</strong><span>Đội</span></div><div><strong>{data.standings.submissionCount??0}</strong><span>Bài nộp</span></div></div></section>
        <section className="grid grid-2"><div className="card"><h2>Vòng thi</h2><DataTable columns={[{title:'ID',key:'roundId'},{title:'Tên',key:'roundName'},{title:'Thứ tự',key:'roundOrder'}]} data={data.rounds} rowKey="roundId"/></div><div className="card"><h2>Hạng mục</h2><DataTable columns={[{title:'ID',key:'trackId'},{title:'Tên',key:'trackName'},{title:'Mô tả',key:'description'}]} data={data.tracks} rowKey="trackId"/></div></section>
        <section className="card"><h2>Đăng thông báo</h2><form className="form-grid" onSubmit={onSubmit}><label>Tiêu đề<input value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})}/></label><label>Đối tượng<select value={form.targetRole} onChange={(e)=>setForm({...form,targetRole:e.target.value})}><option value="All">Tất cả</option><option value="TeamMember">Thí sinh</option><option value="Mentor">Mentor</option><option value="Judge">Giám khảo</option></select></label><label className="span-2">Nội dung<textarea value={form.content} onChange={(e)=>setForm({...form,content:e.target.value})}/></label><button>Đăng</button></form></section>
    </section>;
}
