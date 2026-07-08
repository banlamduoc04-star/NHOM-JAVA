import { apiFetch, type ApiId } from './api';
import type { Score, SubmitScorePayload } from '@/types/score';

export const submitScore = (payload: SubmitScorePayload): Promise<Score> =>
    apiFetch<Score>('/api/scores', {
        method: 'POST',
        body: JSON.stringify(payload)
    });

export const getScoresByTeam = (teamId: ApiId): Promise<Score[]> =>
    apiFetch<Score[]>(`/api/scores/team/${teamId}`);