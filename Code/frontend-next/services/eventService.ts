import { apiFetch, type ApiId } from './api';
import type {
    Announcement,
    CreateAnnouncementPayload,
    CreateEventPayload,
    Event,
    EventStanding,
    UpdateEventPayload
} from '@/types/event';

export const getEvents = (): Promise<Event[]> => apiFetch<Event[]>('/api/events');

export const getEvent = (id: ApiId): Promise<Event> => apiFetch<Event>(`/api/events/${id}`);

export const createEvent = (payload: CreateEventPayload): Promise<Event> =>
    apiFetch<Event>('/api/events', {
        method: 'POST',
        body: JSON.stringify(payload)
    });

export const updateEvent = (id: ApiId, payload: UpdateEventPayload): Promise<Event> =>
    apiFetch<Event>(`/api/events/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
    });

export const getEventStandings = (id: ApiId): Promise<EventStanding[]> =>
    apiFetch<EventStanding[]>(`/api/events/${id}/standings`);

export const getAnnouncements = (eventId: ApiId): Promise<Announcement[]> =>
    apiFetch<Announcement[]>(`/api/announcements/event/${eventId}`);

export const createAnnouncement = (payload: CreateAnnouncementPayload): Promise<Announcement> =>
    apiFetch<Announcement>('/api/announcements', {
        method: 'POST',
        body: JSON.stringify(payload)
    });

export const deleteEvent = (id: ApiId): Promise<null> =>
    apiFetch<null>(`/api/events/${id}`, { method: 'DELETE' });
