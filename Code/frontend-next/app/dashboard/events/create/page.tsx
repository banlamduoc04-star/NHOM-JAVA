'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createEvent } from '@/services/eventService';

export default function CreateEventPage() {
    const router = useRouter();
    const [form,setForm]=useState<any>({eventName:'SEAL Summer 2026',season:'Summer',eventYear:'2026',startDate:'2026-07-01',endDate:'2026-07-31',status:'Open',description:'Hackathon học thuật thường niên ngành Kỹ thuật Phần mềm.'});
    const [message,setMessage]=useState('');

    async function onSubmit(e: any){
        e.preventDefault();
        try{await createEvent({...form,eventYear:Number(form.eventYear)});router.push('/dashboard/events');}
        catch(err: any){setMessage(err.message);}
    }

    return <section className="card">
        <div className="section-title"><h2>Tạo sự kiện</h2><span>Event</span></div>
        {message && <p className="error-text">{message}</p>}
        <form className="form-grid" onSubmit={onSubmit}>
            <label>Tên sự kiện<input value={form.eventName} onChange={(e)=>setForm({...form,eventName:e.target.value})}/></label>
            <label>Mùa<select value={form.season} onChange={(e)=>setForm({...form,season:e.target.value})}><option value="Spring">Mùa Xuân</option><option value="Summer">Mùa Hè</option><option value="Fall">Mùa Thu</option></select></label>
            <label>Năm<input value={form.eventYear} onChange={(e)=>setForm({...form,eventYear:e.target.value})}/></label>
            <label>Trạng thái<select value={form.status} onChange={(e)=>setForm({...form,status:e.target.value})}><option value="Draft">Bản nháp</option><option value="Open">Đang mở</option><option value="Closed">Đã đóng</option></select></label>
            <label>Ngày bắt đầu<input type="date" value={form.startDate} onChange={(e)=>setForm({...form,startDate:e.target.value})}/></label>
            <label>Ngày kết thúc<input type="date" value={form.endDate} onChange={(e)=>setForm({...form,endDate:e.target.value})}/></label>
            <label className="span-2">Mô tả<textarea value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})}/></label>
            <button>Lưu sự kiện</button>
        </form>
    </section>;
}