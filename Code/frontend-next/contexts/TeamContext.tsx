'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getMyJoinRequests } from '@/services/teamRequestService';
import { getMyTeamState, getMyTeams } from '@/services/teamService';
import type { AuthSession } from '@/types/user';
import { roleOf, userIdOf } from '@/utils/rbac';

export type MemberState = 'NO_TEAM' | 'PENDING_REQUEST' | 'JOINED_TEAM' | 'UNKNOWN';

type TeamContextValue = {
    memberState: MemberState;
    myTeams: any[];
    pendingRequests: any[];
    isLeader: boolean;
    teamReady: boolean;
    teamVersion: number;
    refreshTeamState: () => Promise<void>;
};

const TeamContext = createContext<TeamContextValue | null>(null);

export function TeamProvider({ user, children }: { user: AuthSession | null; children: ReactNode }) {
    const [memberState, setMemberState] = useState<MemberState>('UNKNOWN');
    const [myTeams, setMyTeams] = useState<any[]>([]);
    const [pendingRequests, setPendingRequests] = useState<any[]>([]);
    const [teamReady, setTeamReady] = useState(false);
    const [teamVersion, setTeamVersion] = useState(0);

    const refreshTeamState = useCallback(async () => {
        const role = roleOf(user);
        if (role !== 'TeamMember') {
            setMyTeams([]);
            setPendingRequests([]);
            setMemberState('UNKNOWN');
            setTeamReady(true);
            setTeamVersion((v) => v + 1);
            return;
        }

        setTeamReady(false);
        try {
            const state = await getMyTeamState().catch(async () => {
                const [teams, requests] = await Promise.all([getMyTeams(), getMyJoinRequests()]);
                const pending = (requests as any[]).filter((r) => String(r.status).toUpperCase() === 'PENDING');
                return {
                    state: teams.length > 0 ? 'JOINED_TEAM' : pending.length > 0 ? 'PENDING_REQUEST' : 'NO_TEAM',
                    teams,
                    pendingRequests: pending,
                    isLeader: teams.some((team: any) => Number(team.leaderId) === userIdOf(user))
                };
            }) as any;
            const teams = state.teams || [];
            const pending = state.pendingRequests || [];
            setMyTeams(teams);
            setPendingRequests(pending);
            setMemberState((state.state || (teams.length > 0 ? 'JOINED_TEAM' : pending.length > 0 ? 'PENDING_REQUEST' : 'NO_TEAM')) as MemberState);
        } finally {
            setTeamReady(true);
            setTeamVersion((v) => v + 1);
        }
    }, [user]);

    useEffect(() => {
        refreshTeamState().catch(() => {
            setTeamReady(true);
            setMemberState('UNKNOWN');
        });
    }, [refreshTeamState]);

    const isLeader = useMemo(() => {
        const userId = userIdOf(user);
        return userId !== null && myTeams.some((team: any) => Number(team.leaderId) === userId);
    }, [myTeams, user]);

    const value = useMemo(() => ({
        memberState,
        myTeams,
        pendingRequests,
        isLeader,
        teamReady,
        teamVersion,
        refreshTeamState
    }), [memberState, myTeams, pendingRequests, isLeader, teamReady, teamVersion, refreshTeamState]);

    return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
}

export function useTeamContext(): TeamContextValue {
    const value = useContext(TeamContext);
    if (!value) throw new Error('useTeamContext must be used inside TeamProvider');
    return value;
}
