import { API_BASE_URL, apiFetch, query, type ApiId } from './api';
import type { RankingRow } from '@/types/score';

export const getRoundRanking = (roundId?: ApiId, trackId?: ApiId): Promise<RankingRow[]> =>
    apiFetch<RankingRow[]>(`/api/rankings/round${query({ roundId, trackId })}`);

export const getTeamsAdvance = (roundId?: ApiId): Promise<RankingRow[]> =>
    apiFetch<RankingRow[]>(`/api/rankings/advance${query({ roundId })}`);

export const getJudgeVariance = (eventId: ApiId): Promise<any[]> =>
    apiFetch<any[]>(`/api/research/event/${eventId}/judge-variance`);

export const getReliabilitySummary = (eventId: ApiId): Promise<any> =>
    apiFetch<any>(`/api/research/event/${eventId}/reliability-summary`);

export const getCsvUrl = (eventId: ApiId): string =>
    `${API_BASE_URL}/api/research/event/${eventId}/judge-scores.csv`;