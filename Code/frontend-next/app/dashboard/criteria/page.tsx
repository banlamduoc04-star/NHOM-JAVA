'use client';

import { useEffect, useState } from 'react';
import DataTable from '@/components/table/DataTable';
import Loading from "@/components/common/Loading";
import { getEvents } from '@/services/eventService';
import { getCriteria, createCriterion, deactivateCriterion, getTemplates, applyTemplate } from '@/services/criteriaService';

export default function CriteriaPage() {
    const [events,setEvents]=useState<any[]>([]),[criteria,setCriteria]=useState<any[]>([]),[templates,setTemplates]=useState<any[]>([]);
    const [eventId,setEventId]=useState(''),[templateId,setTemplateId]=useState('');
    const [form,setForm]=useState<any>({criterionName:'Chất lượng kỹ thuật',maxScore:'10',weight:'0.35'});
    const [loading,setLoading]=useState(true),[message,setMessage]=useState('');

    async function load(){const [ev,tp]=await Promise.all([getEvents(),getTemplates()]);const eid=eventId||ev?.[0]?.eventId||'';const cr=eid?await getCriteria(eid,true):[];setEvents(ev);setEventId(eid);setTemplates(tp);setTemplateId(tp?.[0]?.templateId||'');setCriteria(cr);setLoading(false);}
    async function reload(eid=eventId){setCriteria(eid?await getCriteria(eid,true):[]);}
    async function onCreate(e: any){e.preventDefault();await createCriterion({eventId:Number(eventId),criterionName:form.criterionName,maxScore:Number(form.maxScore),weight:Number(form.weight)});setMessage('Đã thêm tiêu chí');reload();}
    async function onApply(){await applyTemplate(templateId,eventId,true);setMessage('Đã áp dụng mẫu tiêu chí');reload();}
    async function onDeactivate(row: any){await deactivateCriterion(row.criterionId);setMessage('Đã ngưng dùng tiêu chí');reload();}
    useEffect(()=>{load().catch(e=>{setMessage(e.message);setLoading(false);});},[]);
    useEffect(()=>{if(eventId)reload(eventId);},[eventId]);
    if(loading)return <Loading/>;

    return <section className="grid">
        <div className="page-title"><div><h2>Tiêu chí</h2><p className="muted">Quản lý tiêu chí chấm điểm và template.</p></div><button onClick={load}>Làm mới</button></div>
        {message&&<div className="notice">{message}</div>}
        <section className="control-bar card"><label>Sự kiện<select value={eventId} onChange={(e)=>setEventId(e.target.value)}>{events.map(e=><option key={e.eventId} value={e.eventId}>{e.eventName}</option>)}</select></label></section>
        <section className="grid grid-2"><div className="card"><h2>Thêm tiêu chí</h2><form className="form-grid" onSubmit={onCreate}><label>Tên<input value={form.criterionName} onChange={(e)=>setForm({...form,criterionName:e.target.value})}/></label><label>Điểm tối đa<input value={form.maxScore} onChange={(e)=>setForm({...form,maxScore:e.target.value})}/></label><label>Trọng số<input value={form.weight} onChange={(e)=>setForm({...form,weight:e.target.value})}/></label><button>Thêm</button></form></div><div className="card"><h2>Áp dụng mẫu</h2><div className="inline-actions"><select value={templateId} onChange={(e)=>setTemplateId(e.target.value)}>{templates.map(t=><option key={t.templateId} value={t.templateId}>{t.templateName}</option>)}</select><button onClick={onApply}>Áp dụng</button></div><p className="muted small">replaceExisting = true.</p></div></section>
        <section className="card"><h2>Danh sách tiêu chí</h2><DataTable columns={[{title:'ID',key:'criterionId'},{title:'Tiêu chí',key:'criterionName'},{title:'Max',key:'maxScore'},{title:'Weight',key:'weight'},{title:'Trạng thái',render:(r)=>r.isActive?'Đang dùng':'Ngưng dùng'},{title:'Thao tác',render:(r)=>r.isActive?<button className="secondary" onClick={()=>onDeactivate(r)}>Ngưng dùng</button>:'-'}]} data={criteria} rowKey="criterionId"/></section>
    </section>;
}