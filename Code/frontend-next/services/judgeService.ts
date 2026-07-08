import { apiFetch, query, type ApiId, type QueryParams } from './api';
import type { AssignJudgePayload, CreateStaffPayload, JudgeAssignment, MessageResponse, User } from '@/types/user';

export const getUsers = (params: QueryParams = {}): Promise<User[]> =>
    apiFetch<User[]>(`/api/admin/users${query(params)}`);

export const createStaff = (payload: CreateStaffPayload): Promise<User> =>
    apiFetch<User>('/api/admin/create-staff-account', {
        method: 'POST',
        body: JSON.stringify(payload)
    });

export const approveUser = (id: ApiId): Promise<MessageResponse> =>
    apiFetch<MessageResponse>(`/api/admin/approveUser/${id}`, { method: 'POST' });

export const rejectUser = (id: ApiId, reason = 'Không đủ thông tin đăng ký'): Promise<MessageResponse> =>
    apiFetch<MessageResponse>(`/api/admin/rejectUser/${id}`, {
        method: 'POST',
        body: JSON.stringify({ reason })
    });

export const getJudgeAssignments = (): Promise<JudgeAssignment[]> =>
    apiFetch<JudgeAssignment[]>('/api/judge-assignments');

export const assignJudge = (payload: AssignJudgePayload): Promise<JudgeAssignment> =>
    apiFetch<JudgeAssignment>('/api/judge-assignments', {
        method: 'POST',
        body: JSON.stringify(payload)
    });

export const removeJudgeAssignment = (id: ApiId): Promise<null> =>
    apiFetch<null>(`/api/judge-assignments/${id}`, { method: 'DELETE' });