export type EventSeason = 'Spring' | 'Summer' | 'Fall' | string;
export type EventStatus = 'Draft' | 'Open' | 'Closed' | 'Approved' | 'Pending' | 'Rejected' | string;

export interface Event {
    eventId?: string;
    id?: string;
    eventName?: string;
    name?: string;
    description?: string;
    season?: EventSeason;
    status?: EventStatus;
    startDate?: string;
    endDate?: string;
    createdAt?: string;
    updatedAt?: string;
    [key: string]: unknown;
}

export interface CreateEventPayload {
    eventName: string;
    description?: string;
    season?: EventSeason;
    startDate?: string;
    endDate?: string;
    [key: string]: unknown;
}

export type UpdateEventPayload = Partial<CreateEventPayload> & {
    status?: EventStatus;
};

export interface EventStanding {
    teamId?: string;
    teamName?: string;
    trackId?: string;
    rank?: number;
    totalScore?: number;
    averageScore?: number;
    [key: string]: unknown;
}

export interface Announcement {
    announcementId?: string;
    eventId?: string;
    title?: string;
    content?: string;
    createdAt?: string;
    [key: string]: unknown;
}

export interface CreateAnnouncementPayload {
    eventId: number | string;
    title: string;
    content: string;
    [key: string]: unknown;
}