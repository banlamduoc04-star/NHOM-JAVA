'use client';

import { useEffect, useState } from 'react';
import DataTable from '@/components/table/DataTable';
import Loading from '@/components/common/Loading';
import useAuth from '@/hooks/useAuth';
import { getMyAssignmentDetails } from '@/services/judgeService';
import { getCriteria } from '@/services/criteriaService';
import { isAdminRole, isJudgeRole, roleOf } from '@/utils/rbac';

export default function ScoringCriteriaPage() {
    const { user } = useAuth() as any;
    const role = roleOf(user);
    const canView = isJudgeRole(role) || role === 'GuestJudge' || isAdminRole(role);
    const [rows, setRows] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    async function load() {
        setLoading(true);
        setMessage('');
        try {
            const assignments = await getMyAssignmentDetails();
            const criterionGroups = await Promise.all(assignments.map(async (assignment: any) => {
                const criteria = await getCriteria(assignment.eventId, false, {
                    trackId: assignment.trackId,
                    roundId: assignment.roundId
                });
                return criteria.map((criterion: any) => ({
                    ...criterion,
                    assignmentId: assignment.assignmentId,
                    eventName: assignment.eventName,
                    categoryName: assignment.categoryName,
                    roundName: assignment.roundName
                }));
            }));
            setRows(criterionGroups.flat());
        } catch (error: any) {
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { if (canView) load(); else setLoading(false); }, [role]);

    if (loading) return <Loading />;
    if (!canView) return <section className="card forbidden-card"><h2>Không có quyền truy cập</h2><p className="muted">Trang này chỉ dành cho Judge được phân công.</p></section>;

    return <section className="grid">
        <div className="page-title">
            <div><h2>Scoring Criteria</h2><p className="muted">Judge có thể xem trước toàn bộ tiêu chí áp dụng cho từng Event, Category và Round được giao.</p></div>
            <button className="compact-button" onClick={load}>Làm mới</button>
        </div>
        {message && <div className="notice">{message}</div>}
        <section className="card">
            <DataTable columns={[
                { title: 'Event', key: 'eventName' },
                { title: 'Category', key: 'categoryName' },
                { title: 'Round', key: 'roundName' },
                { title: 'Tên tiêu chí', key: 'criterionName' },
                { title: 'Mô tả', render: (row) => row.description || '-' },
                { title: 'Điểm tối đa', key: 'maxScore' }
            ]} data={rows} rowKey={(row, index) => `${row.assignmentId}-${row.criterionId}-${index}`} emptyText="Chưa có tiêu chí cho các phân công hiện tại" />
        </section>
    </section>;
}
