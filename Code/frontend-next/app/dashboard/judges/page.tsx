'use client';

import { useEffect, useState } from 'react';
import DataTable from '@/components/table/DataTable';
import Loading from "@/components/common/Loading";
import { viRole } from '@/constants/role';
import { getUsers, createStaff, approveUser, rejectUser, getJudgeAssignments, assignJudge, removeJudgeAssignment } from '@/services/judgeService';
import { getEvents } from '@/services/eventService';
import { getTracks } from '@/services/trackService';
import { getRounds } from '@/services/roundService';
import { getSubmissions } from '@/services/submissionService';
import { getCriteria } from '@/services/criteriaService';
import { submitScore } from '@/services/scoreService';

export default function JudgesPage() {
    const [users,setUsers]=useState<any[]>([]),[assignments,setAssignments]=useState<any[]>([]),[events,setEvents]=useState<any[]>([]),[tracks,setTracks]=useState<any[]>([]),[rounds,setRounds]=useState<any[]>([]),[subs,setSubs]=useState<any[]>([]),[criteria,setCriteria]=useState<any[]>([]);
    const [eventId,setEventId]=useState(''),[trackId,setTrackId]=useState(''),[roundId,setRoundId]=useState(''),[judgeId,setJudgeId]=useState(''),[submissionId,setSubmissionId]=useState(''),[criterionId,setCriterionId]=useState('');
    const [staff,setStaff]=useState<any>({fullName:'',email:'',password:'',roleName:'GuestJudge',userType:'Staff'}),[score,setScore]=useState<any>({scoreValue:'',comment:''});
    const [message,setMessage]=useState(''),[loading,setLoading]=useState(true);
    const judges=users.filter(u=>['Judge','GuestJudge'].includes(u.roleName));
    const pending=users.filter(u=>!u.isApproved);
    const name=(id: any)=>users.find(u=>u.userId===id)?.fullName||`#${id}`;
    const roundName=(id: any)=>rounds.find(r=>r.roundId===id)?.roundName||`#${id}`;
    const trackName=(id: any)=>tracks.find(t=>t.trackId===id)?.trackName||`#${id}`;

    async function load(){
        const [us,as,ev]=await Promise.all([getUsers(),getJudgeAssignments(),getEvents()]);
        const eid=eventId||ev?.[0]?.eventId||'';
        const [tr,rd,cr]=await Promise.all([eid?getTracks(eid):[],eid?getRounds(eid):[],eid?getCriteria(eid,true):[]]);
        const rid=roundId||rd?.[0]?.roundId||''; const sb=rid?await getSubmissions({roundId:rid}):[];
        setUsers(us);setAssignments(as);setEvents(ev);setEventId(eid);setTracks(tr);setTrackId(tr?.[0]?.trackId||'');setRounds(rd);setRoundId(rid);setCriteria(cr);setCriterionId(cr?.find((c: any)=>c.isActive)?.criterionId||'');setSubs(sb);setSubmissionId(sb?.[0]?.submissionId||'');setJudgeId(us.find((u: any)=>['Judge','GuestJudge'].includes(u.roleName))?.userId||'');setLoading(false);
    }
    async function reloadUsers(){setUsers(await getUsers());}
    async function reloadAssignments(){setAssignments(await getJudgeAssignments());}
    async function onCreateStaff(e: any){e.preventDefault();await createStaff(staff);setMessage('Đã tạo tài khoản');setStaff({fullName:'',email:'',password:'',roleName:'GuestJudge',userType:'Staff'});reloadUsers();}
    async function onApprove(id: any){await approveUser(id);setMessage('Đã duyệt tài khoản');reloadUsers();}
    async function onReject(id: any){await rejectUser(id);setMessage('Đã từ chối tài khoản');reloadUsers();}
    async function onAssign(e: any){e.preventDefault();await assignJudge({roundId:Number(roundId),trackId:Number(trackId),judgeId:Number(judgeId)});setMessage('Đã phân công giám khảo');reloadAssignments();}
    async function onScore(e: any){e.preventDefault();await submitScore({submissionId:Number(submissionId),criterionId:Number(criterionId),scoreValue:Number(score.scoreValue),comment:score.comment});setMessage('Đã lưu điểm');setScore({scoreValue:'',comment:''});}

    useEffect(()=>{load().catch(e=>{setMessage(e.message);setLoading(false);});},[]);
    useEffect(()=>{if(eventId)Promise.all([getTracks(eventId),getRounds(eventId),getCriteria(eventId,true)]).then(([tr,rd,cr])=>{setTracks(tr);setTrackId(tr?.[0]?.trackId||'');setRounds(rd);setRoundId(rd?.[0]?.roundId||'');setCriteria(cr);setCriterionId(cr?.find((c: any)=>c.isActive)?.criterionId||'');});},[eventId]);
    useEffect(()=>{if(roundId)getSubmissions({roundId}).then(d=>{setSubs(d);setSubmissionId(d?.[0]?.submissionId||'');});},[roundId]);
    if(loading)return <Loading/>;

    return <section className="grid">
        <div className="page-title"><div><h2>Giám khảo & chấm điểm</h2><p className="muted">Tạo staff, duyệt user, phân công và nhập điểm.</p></div><button onClick={load}>Làm mới</button></div>
        {message&&<div className="notice">{message}</div>}
        <section className="grid grid-2">
            <div className="card"><h2>Tạo tài khoản nhân sự</h2><form className="form-grid" onSubmit={onCreateStaff}><label>Họ tên<input value={staff.fullName} onChange={(e)=>setStaff({...staff,fullName:e.target.value})}/></label><label>Email<input value={staff.email} onChange={(e)=>setStaff({...staff,email:e.target.value})}/></label><label>Mật khẩu<input type="password" value={staff.password} onChange={(e)=>setStaff({...staff,password:e.target.value})}/></label><label>Vai trò<select value={staff.roleName} onChange={(e)=>setStaff({...staff,roleName:e.target.value})}><option value="Mentor">Mentor</option><option value="Judge">Judge</option><option value="GuestJudge">GuestJudge</option><option value="EventCoordinator">EventCoordinator</option></select></label><button>Tạo tài khoản</button></form></div>
            <div className="card"><h2>Phân công giám khảo</h2><form className="form-grid" onSubmit={onAssign}><label>Sự kiện<select value={eventId} onChange={(e)=>setEventId(e.target.value)}>{events.map(e=><option key={e.eventId} value={e.eventId}>{e.eventName}</option>)}</select></label><label>Vòng<select value={roundId} onChange={(e)=>setRoundId(e.target.value)}>{rounds.map(r=><option key={r.roundId} value={r.roundId}>{r.roundName}</option>)}</select></label><label>Hạng mục<select value={trackId} onChange={(e)=>setTrackId(e.target.value)}>{tracks.map(t=><option key={t.trackId} value={t.trackId}>{t.trackName}</option>)}</select></label><label>Giám khảo<select value={judgeId} onChange={(e)=>setJudgeId(e.target.value)}>{judges.map(j=><option key={j.userId} value={j.userId}>{j.fullName} · {viRole(j.roleName)}</option>)}</select></label><button>Phân công</button></form></div>
        </section>
        <section className="card"><h2>Chấm điểm</h2><form className="form-grid" onSubmit={onScore}><label>Bài nộp<select value={submissionId} onChange={(e)=>setSubmissionId(e.target.value)}>{subs.map(s=><option key={s.submissionId} value={s.submissionId}>Submission #{s.submissionId} · Team #{s.teamId}</option>)}</select></label><label>Tiêu chí<select value={criterionId} onChange={(e)=>setCriterionId(e.target.value)}>{criteria.filter(c=>c.isActive).map(c=><option key={c.criterionId} value={c.criterionId}>{c.criterionName} / {c.maxScore}</option>)}</select></label><label>Điểm<input type="number" min="0" step="0.25" value={score.scoreValue} onChange={(e)=>setScore({...score,scoreValue:e.target.value})}/></label><label className="span-2">Nhận xét<textarea value={score.comment} onChange={(e)=>setScore({...score,comment:e.target.value})}/></label><button>Lưu điểm</button></form></section>
        <section className="grid grid-2"><div className="card"><h2>Tài khoản chờ duyệt</h2><DataTable columns={[{title:'Họ tên',key:'fullName'},{title:'Email',key:'email'},{title:'Vai trò',render:(r)=>viRole(r.roleName)},{title:'Thao tác',render:(r)=><div className="mini-actions"><button onClick={()=>onApprove(r.userId)}>Duyệt</button><button className="secondary" onClick={()=>onReject(r.userId)}>Từ chối</button></div>}]} data={pending} rowKey="userId"/></div><div className="card"><h2>Phân công</h2><DataTable columns={[{title:'Vòng',render:(r)=>roundName(r.roundId)},{title:'Hạng mục',render:(r)=>trackName(r.trackId)},{title:'Giám khảo',render:(r)=>name(r.judgeId)},{title:'Xóa',render:(r)=><button className="secondary" onClick={async()=>{await removeJudgeAssignment(r.assignmentId);reloadAssignments();}}>Xóa</button>}]} data={assignments} rowKey="assignmentId"/></div></section>
    </section>;
}