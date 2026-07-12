import { apiFetch, query, type ApiId, type QueryParams } from './api';
import type {
    AssignJudgePayload,
    AssignmentDetail,
    CreateStaffPayload,
    JudgeAssignment,
    UpdateUserPayload,
    User
} from '@/types/user';

export const getUsers = (params: QueryParams = {}): Promise<User[]> =>
    apiFetch<User[]>(`/api/admin/users${query(params)}`);

export const createStaff = (payload: CreateStaffPayload): Promise<User> =>
    apiFetch<User>('/api/admin/create-staff-account', {
        method: 'POST',
        body: JSON.stringify({ ...payload, userType: 'Staff' })
    });

export const updateUser = (id: ApiId, payload: UpdateUserPayload): Promise<User> =>
    apiFetch<User>(`/api/admin/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
    });

export const lockUser = (id: ApiId): Promise<User> =>
    apiFetch<User>(`/api/admin/users/${id}/lock`, { method: 'PATCH' });

export const unlockUser = (id: ApiId): Promise<User> =>
    apiFetch<User>(`/api/admin/users/${id}/unlock`, { method: 'PATCH' });

export const approveUser = (id: ApiId): Promise<User> =>
    apiFetch<User>(`/api/admin/approveUser/${id}`, { method: 'POST' });

export const rejectUser = (id: ApiId, reason = 'Không đủ thông tin đăng ký'): Promise<User> =>
    apiFetch<User>(`/api/admin/rejectUser/${id}`, {
        method: 'POST',
        body: JSON.stringify({ reason })
    });

export const getJudgeAssignments = (): Promise<JudgeAssignment[]> =>
    apiFetch<JudgeAssignment[]>('/api/judge-assignments');

export const getAssignmentDetails = (): Promise<AssignmentDetail[]> =>
    apiFetch<AssignmentDetail[]>('/api/judge-assignments/details');

export const assignJudge = (payload: AssignJudgePayload): Promise<JudgeAssignment> =>
    apiFetch<JudgeAssignment>('/api/judge-assignments', {
        method: 'POST',
        body: JSON.stringify(payload)
    });

export const updateJudgeAssignment = (id: ApiId, payload: AssignJudgePayload): Promise<JudgeAssignment> =>
    apiFetch<JudgeAssignment>(`/api/judge-assignments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
    });

export const removeJudgeAssignment = (id: ApiId): Promise<null> =>
    apiFetch<null>(`/api/judge-assignments/${id}`, { method: 'DELETE' });

export const getMyJudgeAssignments = (): Promise<JudgeAssignment[]> =>
    apiFetch<JudgeAssignment[]>('/api/judge-assignments/my');

export const getMyAssignmentDetails = (): Promise<AssignmentDetail[]> =>
    apiFetch<AssignmentDetail[]>('/api/judge-assignments/my/details');
