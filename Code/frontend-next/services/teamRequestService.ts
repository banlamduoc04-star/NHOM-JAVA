import { apiFetch } from './api';

export const joinTeam = (teamId: number | string) =>
    apiFetch(`/api/team-requests/join/${teamId}`, { method: 'POST' });

export const cancelJoinRequest = (teamId: number | string) =>
    apiFetch(`/api/team-requests/join/${teamId}`, { method: 'DELETE' });

export const getMyJoinRequests = () =>
    apiFetch('/api/team-requests/my');

export const getJoinRequests = (teamId: number | string) =>
    apiFetch(`/api/team-requests/team/${teamId}`);

export const approveJoinRequest = (id: number | string) =>
    apiFetch(`/api/team-requests/${id}/approve`, { method: 'PUT' });

export const rejectJoinRequest = (id: number | string) =>
    apiFetch(`/api/team-requests/${id}/reject`, { method: 'PUT' });
