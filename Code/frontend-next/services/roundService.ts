import { apiFetch, query, type ApiId } from './api';
import type { CreateRoundPayload, Round, ScoreCompleteness, UpdateRoundPayload } from '@/types/score';

export const getRounds = (eventId?: ApiId): Promise<Round[]> =>
    apiFetch<Round[]>(`/api/rounds${query({ eventId })}`);

export const createRound = (payload: CreateRoundPayload): Promise<Round> =>
    apiFetch<Round>('/api/rounds', {
        method: 'POST',
        body: JSON.stringify(payload)
    });

export const updateRound = (id: ApiId, payload: UpdateRoundPayload): Promise<Round> =>
    apiFetch<Round>(`/api/rounds/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
    });

export const evaluateRound = (id: ApiId): Promise<unknown> =>
    apiFetch<unknown>(`/api/rounds/${id}/evaluate-elimination`, { method: 'POST' });

export const getScoreCompleteness = (id: ApiId): Promise<ScoreCompleteness> =>
    apiFetch<ScoreCompleteness>(`/api/rounds/${id}/score-completeness`);