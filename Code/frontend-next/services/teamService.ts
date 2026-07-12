import { apiFetch, query, type ApiId, type QueryParams } from './api';
import type { AddTeamMemberPayload, CreateTeamPayload, MyTeamState, Team, TeamMember, TeamStatus } from '@/types/team';

export const getTeams = (params: QueryParams = {}): Promise<Team[]> =>
    apiFetch<Team[]>(`/api/teams${query(params)}`);

export const getTeam = (id: ApiId): Promise<Team> => apiFetch<Team>(`/api/teams/${id}`);

export const createTeam = (payload: CreateTeamPayload): Promise<Team> =>
    apiFetch<Team>('/api/teams', {
        method: 'POST',
        body: JSON.stringify(payload)
    });

export const updateTeamStatus = (id: ApiId, status: TeamStatus, reason = ''): Promise<Team> =>
    apiFetch<Team>(`/api/teams/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, reason })
    });

export const addTeamMember = (payload: AddTeamMemberPayload): Promise<TeamMember> =>
    apiFetch<TeamMember>('/api/team-members', {
        method: 'POST',
        body: JSON.stringify(payload)
    });

export const getTeamMembers = (teamId: ApiId): Promise<TeamMember[]> =>
    apiFetch<TeamMember[]>(`/api/team-members/${teamId}`);

export const getMyTeams = (): Promise<Team[]> => apiFetch<Team[]>('/api/teams/my');

export const getTeamsWithStats = (params: QueryParams = {}): Promise<any[]> =>
    apiFetch<any[]>(`/api/teams/with-stats${query(params)}`);

export const updateTeam = (id: ApiId, payload: Partial<Team>): Promise<Team> =>
    apiFetch<Team>(`/api/teams/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload)
    });

export const removeTeamMember = (teamId: ApiId, userId: ApiId): Promise<null> =>
    apiFetch<null>(`/api/team-members/${teamId}/${userId}`, { method: 'DELETE' });

export const getMyTeamState = (eventId?: ApiId): Promise<MyTeamState> =>
    apiFetch<MyTeamState>(`/api/teams/my-state${query({ eventId })}`);
