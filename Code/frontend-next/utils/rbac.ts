import type { AuthSession, UserRole } from '@/types/user';

export function roleOf(user?: Partial<AuthSession> | null): UserRole | undefined {
    return (user?.role || user?.roleName) as UserRole | undefined;
}

export function isAdminRole(role?: string | null): boolean {
    return role === 'EventCoordinator' || role === 'Admin';
}

export function isJudgeRole(role?: string | null): boolean {
    return role === 'Judge' || role === 'GuestJudge';
}

export function isMentorRole(role?: string | null): boolean {
    return role === 'Mentor';
}

export function isTeamMemberRole(role?: string | null): boolean {
    return role === 'TeamMember';
}

export function userIdOf(user?: Partial<AuthSession> | null): number | null {
    const value = user?.userId || user?.id;
    if (value === undefined || value === null || value === '') return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
}

export function isLeaderOfTeam(user?: Partial<AuthSession> | null, team?: any): boolean {
    const userId = userIdOf(user);
    return userId !== null && Number(team?.leaderId) === userId;
}

export function canManageEvents(user?: Partial<AuthSession> | null): boolean {
    return isAdminRole(roleOf(user));
}

export function canSubmitForTeam(user?: Partial<AuthSession> | null, team?: any): boolean {
    return isTeamMemberRole(roleOf(user)) && isLeaderOfTeam(user, team);
}

export function canEliminateSubmission(user?: Partial<AuthSession> | null): boolean {
    return isAdminRole(roleOf(user));
}
