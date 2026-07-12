import { API_BASE_URL, apiFetch, downloadFile, query, type ApiId, type QueryParams } from './api';
import type { RankingExportRow, RankingRow } from '@/types/score';

export const getRankingRows = (params: QueryParams = {}): Promise<RankingExportRow[]> =>
    apiFetch<RankingExportRow[]>(`/api/rankings${query(params)}`);

export const getRoundRanking = (roundId?: ApiId, trackId?: ApiId): Promise<RankingRow[]> =>
    apiFetch<RankingRow[]>(`/api/rankings/round${query({ roundId, trackId })}`);

export const getTeamsAdvance = (roundId?: ApiId, trackId?: ApiId): Promise<RankingRow[]> =>
    apiFetch<RankingRow[]>(`/api/rankings/advance${query({ roundId, trackId })}`);

export const publishRoundResults = (roundId: ApiId): Promise<any[]> =>
    apiFetch<any[]>(`/api/round-results/round/${roundId}/publish`, { method: 'POST' });

export const getJudgeVariance = (eventId: ApiId): Promise<any[]> =>
    apiFetch<any[]>(`/api/research/event/${eventId}/judge-variance`);

export const getReliabilitySummary = (eventId: ApiId): Promise<any> =>
    apiFetch<any>(`/api/research/event/${eventId}/reliability-summary`);

export const downloadRankingCsv = (params: QueryParams): Promise<void> =>
    downloadFile(`/api/rankings/export.csv${query(params)}`, 'seal-ranking-export.csv');

export const downloadRankingExcel = (params: QueryParams): Promise<void> =>
    downloadFile(`/api/rankings/export.xlsx${query(params)}`, 'seal-ranking-export.xlsx');

export const downloadResearchCsv = (eventId: ApiId): Promise<void> =>
    downloadFile(`/api/research/event/${eventId}/judge-scores.csv`, `seal-rbl-event-${eventId}.csv`);

export const getCsvUrl = (eventId: ApiId): string =>
    `${API_BASE_URL}/api/research/event/${eventId}/judge-scores.csv`;
