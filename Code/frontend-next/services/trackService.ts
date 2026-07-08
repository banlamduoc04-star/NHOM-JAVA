import { apiFetch, query, type ApiId, type QueryParams } from './api';
import type {
    AssignTrackMentorPayload,
    CreateTrackPayload,
    Track,
    TrackMentor,
    UpdateTrackPayload
} from '@/types/team';

export const getTracks = (eventId?: ApiId): Promise<Track[]> =>
    apiFetch<Track[]>(`/api/tracks${query({ eventId })}`);

export const createTrack = (payload: CreateTrackPayload): Promise<Track> =>
    apiFetch<Track>('/api/tracks', {
        method: 'POST',
        body: JSON.stringify(payload)
    });

export const updateTrack = (id: ApiId, payload: UpdateTrackPayload): Promise<Track> =>
    apiFetch<Track>(`/api/tracks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
    });

export const getTrackMentors = (params: QueryParams = {}): Promise<TrackMentor[]> =>
    apiFetch<TrackMentor[]>(`/api/track-mentors${query(params)}`);

export const assignTrackMentor = (payload: AssignTrackMentorPayload): Promise<TrackMentor> =>
    apiFetch<TrackMentor>('/api/track-mentors', {
        method: 'POST',
        body: JSON.stringify(payload)
    });

export const removeTrackMentor = (id: ApiId): Promise<null> =>
    apiFetch<null>(`/api/track-mentors/${id}`, { method: 'DELETE' });