import { apiFetch, query, type ApiId, type QueryParams } from './api';
import type { CreateSubmissionPayload, Submission } from '@/types/submission';

export const getSubmissions = (params: QueryParams = {}): Promise<Submission[]> =>
    apiFetch<Submission[]>(`/api/submissions${query(params)}`);

export const createSubmission = (payload: CreateSubmissionPayload): Promise<Submission> =>
    apiFetch<Submission>('/api/submissions', {
        method: 'POST',
        body: JSON.stringify(payload)
    });

export const eliminateSubmission = (id: ApiId, reason: string): Promise<Submission> =>
    apiFetch<Submission>(`/api/submissions/${id}/eliminate`, {
        method: 'POST',
        body: JSON.stringify({ reason })
    });