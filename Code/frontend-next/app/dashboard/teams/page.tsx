'use client';

import { useEffect, useState } from 'react';
import DataTable from '@/components/table/DataTable';
import Loading from '@/components/common/Loading';
import { getEvents } from '@/services/eventService';
import { getTracks } from '@/services/trackService';
import { getTeams, createTeam, updateTeamStatus, addTeamMember } from '@/services/teamService';
import { getUsers } from '@/services/judgeService';
import { viStatus } from '@/constants/role';

export default function TeamsPage() {
    const [events,setEvents]=useState<any[]>([]),[tracks,setTracks]=useState<any[]>([]),[teams,setTeams]=useState<any[]>([]),[members,setMembers]=useState<any[]>([]);
    const [eventId,setEventId]=useState(''),[trackId,setTrackId]=useState(''),[teamId,setTeamId]=useState(''),[memberUserId,setMemberUserId]=useState('');
    const [form,setForm]=useState<any>({teamName:'SEAL Builders'}),[message,setMessage]=useState(''),[loading,setLoading]=useState(true);
    const trackName=(id: any)=>tracks.find(t=>t.trackId===id)?.trackName||`#${id}`;
    const userName=(id: any)=>members.find(u=>u.userId===id)?.fullName||`#${id}`;

    async function load(){const ev=await getEvents();const eid=eventId||ev?.[0]?.eventId||'';const [tr,tm,us]=await Promise.all([eid?getTracks(eid):[],eid?getTeams({eventId:eid}):[],getUsers({approved:true,roleName:'TeamMember'})]);setEvents(ev);setEventId(eid);setTracks(tr);setTrackId(tr?.[0]?.trackId||'');setTeams(tm);setTeamId(tm?.[0]?.teamId||'');setMembers(us);setMemberUserId(us?.[0]?.userId||'');setLoading(false);}
    async function reload(eid=eventId){const tm=await getTeams({eventId:eid});setTeams(tm);setTeamId(tm?.[0]?.teamId||'');}
    async function onCreate(e: any){e.preventDefault();await createTeam({eventId:Number(eventId),trackId:Number(trackId),teamName:form.teamName});setMessage('Đã tạo đội');reload();}
    async function onAddMember(e: any){e.preventDefault();await addTeamMember({teamId:Number(teamId),userId:Number(memberUserId),memberRole:'Member'});setMessage('Đã thêm thành viên');}
    async function changeStatus(row: any, status: any){await updateTeamStatus(row.teamId,status,status==='Approved'?'Đủ điều kiện':'Không đáp ứng quy định');setMessage('Đã cập nhật trạng thái');reload();}
    useEffect(()=>{load().catch(e=>{setMessage(e.message);setLoading(false);});},[]);
    useEffect(()=>{if(eventId)Promise.all([getTracks(eventId),getTeams({eventId})]).then(([tr,tm])=>{setTracks(tr);setTrackId(tr?.[0]?.trackId||'');setTeams(tm);setTeamId(tm?.[0]?.teamId||'');});},[eventId]);
    if(loading)return <Loading/>;

    return <section className="grid">
        <div className="page-title"><div><h2>Đội thi</h2><p className="muted">Tạo đội, thêm thành viên, duyệt/từ chối đội.</p></div><button onClick={load}>Làm mới</button></div>
        {message&&<div className="notice">{message}</div>}
        <section className="control-bar card"><label>Sự kiện<select value={eventId} onChange={(e)=>setEventId(e.target.value)}>{events.map(e=><option key={e.eventId} value={e.eventId}>{e.eventName}</option>)}</select></label><label>Hạng mục<select value={trackId} onChange={(e)=>setTrackId(e.target.value)}>{tracks.map(t=><option key={t.trackId} value={t.trackId}>{t.trackName}</option>)}</select></label></section>
        <section className="grid grid-2"><div className="card"><h2>Tạo đội</h2><form className="form-grid" onSubmit={onCreate}><label className="span-2">Tên đội<input value={form.teamName} onChange={(e)=>setForm({teamName:e.target.value})}/></label><button>Tạo đội</button></form></div><div className="card"><h2>Thêm thành viên</h2><form className="form-grid" onSubmit={onAddMember}><label>Đội<select value={teamId} onChange={(e)=>setTeamId(e.target.value)}>{teams.map(t=><option key={t.teamId} value={t.teamId}>{t.teamName}</option>)}</select></label><label>Thành viên<select value={memberUserId} onChange={(e)=>setMemberUserId(e.target.value)}>{members.map(u=><option key={u.userId} value={u.userId}>{u.fullName}</option>)}</select></label><button>Thêm</button></form></div></section>
        <section className="card"><h2>Danh sách đội</h2><DataTable columns={[{title:'ID',key:'teamId'},{title:'Tên đội',key:'teamName'},{title:'Hạng mục',render:(r)=>trackName(r.trackId)},{title:'Trưởng nhóm',render:(r)=>userName(r.leaderId)},{title:'Trạng thái',render:(r)=><span className="table-badge">{viStatus(r.status)}</span>},{title:'Thao tác',render:(r)=><div className="mini-actions"><button onClick={()=>changeStatus(r,'Approved')}>Duyệt</button><button className="secondary" onClick={()=>changeStatus(r,'Rejected')}>Từ chối</button></div>}]} data={teams} rowKey="teamId"/></section>
    </section>;
}