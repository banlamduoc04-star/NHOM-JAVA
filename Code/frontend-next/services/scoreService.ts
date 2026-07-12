import { apiFetch, query, type ApiId, type QueryParams } from './api';
import type { Score, ScoreSummary, SubmitScorePayload } from '@/types/score';

export const submitScore = (payload: SubmitScorePayload): Promise<Score> =>
    apiFetch<Score>('/api/scores', {
        method: 'POST',
        body: JSON.stringify(payload)
    });

export const getScoresByTeam = (teamId: ApiId): Promise<Score[]> =>
    apiFetch<Score[]>(`/api/scores/team/${teamId}`);

export const getMyScores = (submissionId?: ApiId): Promise<Score[]> =>
    apiFetch<Score[]>(`/api/scores/my${query({ submissionId })}`);

export const getScoreSummary = (params: QueryParams = {}): Promise<ScoreSummary[]> =>
    apiFetch<ScoreSummary[]>(`/api/scores/summary${query(params)}`);
