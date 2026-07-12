import { apiFetch, query, type ApiId } from './api';
import type {
    CreateCriterionPayload,
    Criterion,
    CriterionTemplate,
    UpdateCriterionPayload
} from '@/types/score';

export const getCriteria = (
    eventId: ApiId,
    includeInactive = true,
    filters: { trackId?: ApiId; roundId?: ApiId } = {}
): Promise<Criterion[]> =>
    apiFetch<Criterion[]>(`/api/event-criteria/event/${eventId}${query({ includeInactive, ...filters })}`);

export const getCriterion = (id: ApiId): Promise<Criterion> =>
    apiFetch<Criterion>(`/api/event-criteria/${id}`);

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

export const deactivateCriterion = (id: ApiId): Promise<Criterion> =>
    apiFetch<Criterion>(`/api/event-criteria/${id}`, { method: 'DELETE' });

export const deleteCriterion = (id: ApiId): Promise<Criterion> =>
    apiFetch<Criterion>(`/api/event-criteria/${id}?permanent=true`, { method: 'DELETE' });

export const getTemplates = (): Promise<CriterionTemplate[]> => apiFetch<CriterionTemplate[]>('/api/criterion-templates');

export const applyTemplate = (templateId: ApiId, eventId: ApiId, replaceExisting = true): Promise<Criterion[]> =>
    apiFetch<Criterion[]>(`/api/criterion-templates/${templateId}/apply-to-event/${eventId}`, {
        method: 'POST',
        body: JSON.stringify({ replaceExisting })
    });
