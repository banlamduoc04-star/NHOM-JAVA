import { apiFetch, type ApiId } from './api';
import type {
    CreateCriterionPayload,
    Criterion,
    CriterionTemplate,
    UpdateCriterionPayload
} from '@/types/score';

export const getCriteria = (eventId: ApiId, includeInactive = true): Promise<Criterion[]> =>
    apiFetch<Criterion[]>(`/api/event-criteria/event/${eventId}?includeInactive=${includeInactive}`);

export const createCriterion = (payload: CreateCriterionPayload): Promise<Criterion> =>
    apiFetch<Criterion>('/api/event-criteria', {
        method: 'POST',
        body: JSON.stringify(payload)
    });

export const updateCriterion = (id: ApiId, payload: UpdateCriterionPayload): Promise<Criterion> =>
    apiFetch<Criterion>(`/api/event-criteria/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
    });

export const deactivateCriterion = (id: ApiId): Promise<null> =>
    apiFetch<null>(`/api/event-criteria/${id}`, { method: 'DELETE' });

export const getTemplates = (): Promise<CriterionTemplate[]> => apiFetch<CriterionTemplate[]>('/api/criterion-templates');

export const applyTemplate = (templateId: ApiId, eventId: ApiId, replaceExisting = true): Promise<Criterion[]> =>
    apiFetch<Criterion[]>(`/api/criterion-templates/${templateId}/apply-to-event/${eventId}`, {
        method: 'POST',
        body: JSON.stringify({ replaceExisting })
    });