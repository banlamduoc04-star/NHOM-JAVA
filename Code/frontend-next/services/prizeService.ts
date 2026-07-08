import { apiFetch, query, type QueryParams } from './api';
import type { AwardPrizePayload, CreatePrizePayload, Prize } from '@/types/score';

export const getPrizes = (params: QueryParams = {}): Promise<Prize[]> =>
    apiFetch<Prize[]>(`/api/prizes${query(params)}`);

export const createPrize = (payload: CreatePrizePayload): Promise<Prize> =>
    apiFetch<Prize>('/api/prizes', {
        method: 'POST',
        body: JSON.stringify(payload)
    });

export const awardPrize = (payload: AwardPrizePayload): Promise<Prize> =>
    apiFetch<Prize>('/api/prizes/award', {
        method: 'POST',
        body: JSON.stringify(payload)
    });