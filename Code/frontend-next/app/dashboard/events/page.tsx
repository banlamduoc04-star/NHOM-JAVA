'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import DataTable from '@/components/table/DataTable';
import Loading from "@/components/common/Loading";
import { getEvents } from '@/services/eventService';
import { formatDate } from '@/utils/formatDate';
import { seasonVi, viStatus } from '@/constants/role';

export default function EventsPage() {
    const [events,setEvents]=useState<any[]>([]);
    const [loading,setLoading]=useState(true);
    const [message,setMessage]=useState('');

    async function load(){try{setEvents(await getEvents());}catch(e: any){setMessage(e.message);}finally{setLoading(false);}}
    useEffect(()=>{load();},[]);
    if(loading) return <Loading/>;

    return <section className="grid">
        <div className="page-title"><div><h2>Sự kiện</h2><p className="muted">Danh sách và trạng thái các event.</p></div><Link className="button-link" href="/dashboard/events/create">Tạo sự kiện</Link></div>
        {message && <div className="notice error">{message}</div>}
        <section className="card"><DataTable columns={[
            {title:'ID',key:'eventId'},
            {title:'Tên sự kiện',render:(r)=><Link href={`/dashboard/events/${r.eventId}`}>{r.eventName}</Link>},
            {title:'Mùa',render:(r)=>seasonVi(r.season)},
            {title:'Năm',key:'eventYear'},
            {title:'Trạng thái',render:(r)=><span className="table-badge">{viStatus(r.status)}</span>},
            {title:'Thời gian',render:(r)=>`${formatDate(r.startDate)} → ${formatDate(r.endDate)}`},
            {title:'Sửa',render:(r)=><Link className="text-link" href={`/dashboard/events/edit?id=${r.eventId}`}>Sửa</Link>}
        ]} data={events} rowKey="eventId"/></section>
    </section>;
}