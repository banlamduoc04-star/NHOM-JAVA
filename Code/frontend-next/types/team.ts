export type TeamStatus = 'Pending' | 'Approved' | 'Rejected' | string;

export interface Track {
    trackId?: string;
    eventId?: string;
    trackName?: string;
    description?: string;
    status?: 'Active' | 'Inactive' | string;
    [key: string]: unknown;
}

export interface CreateTrackPayload {
    eventId: number | string;
    trackName: string;
    description?: string;
    status?: 'Active' | 'Inactive' | string;
    [key: string]: unknown;
}

export type UpdateTrackPayload = Partial<CreateTrackPayload>;

export interface TrackMentor {
    trackMentorId?: string;
    trackId?: string;
    mentorId?: string;
    eventId?: string;
    [key: string]: unknown;
}

export interface AssignTrackMentorPayload {
    trackId: number | string;
    mentorId: number | string;
    [key: string]: unknown;
}

export interface Team {
    teamId?: string;
    eventId?: string;
    trackId?: string;
    teamName?: string;
    leaderId?: string;
    status?: TeamStatus;
    reason?: string;
    [key: string]: unknown;
}

export interface CreateTeamPayload {
    eventId: number | string;
    trackId: number | string;
    teamName: string;
    leaderId?: string;
    [key: string]: unknown;
}

export interface TeamMember {
    teamMemberId?: string;
    teamId?: string;
    userId?: string;
    memberRole?: string;
    [key: string]: unknown;
}

export interface AddTeamMemberPayload {
    teamId: number | string;
    userId: number | string;
    memberRole?: string;
    [key: string]: unknown;
}

export type MemberState = 'NO_TEAM' | 'PENDING_REQUEST' | 'JOINED_TEAM' | 'UNKNOWN';

export interface MyTeamState {
    state: MemberState;
    isLeader: boolean;
    teams: Team[];
    pendingRequests: TeamJoinRequest[];
    [key: string]: unknown;
}

export interface TeamJoinRequest {
    id?: string | number;
    teamId?: string | number;
    userId?: string | number;
    status?: string;
    createdAt?: string;
    [key: string]: unknown;
}
