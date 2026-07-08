import { apiFetch, query, type ApiId, type QueryParams } from './api';
import type { AddTeamMemberPayload, CreateTeamPayload, Team, TeamMember, TeamStatus } from '@/types/team';

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