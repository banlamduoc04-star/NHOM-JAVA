import type { UserRole } from '@/types/user';

export interface MenuItem {
    title: string;
    href: string;
}

export const ADMIN_MENU: MenuItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Ranking', href: '/dashboard/ranking' },
    { title: 'Hồ sơ', href: '/dashboard/profile' },
    { title: 'Events', href: '/dashboard/events' },
    { title: 'Categories', href: '/dashboard/tracks' },
    { title: 'Criteria', href: '/dashboard/criteria' },
    { title: 'Rounds', href: '/dashboard/rounds' },
    { title: 'Assignments', href: '/dashboard/assignments' },
    { title: 'Teams', href: '/dashboard/teams' },
    { title: 'Users', href: '/dashboard/users' },
    { title: 'Submissions', href: '/dashboard/submissions' },
    { title: 'Scores', href: '/dashboard/scores' }
];

export const MENTOR_MENU: MenuItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Ranking', href: '/dashboard/ranking' },
    { title: 'Hồ sơ', href: '/dashboard/profile' },
    { title: 'Assigned Categories', href: '/dashboard/tracks' },
    { title: 'Teams', href: '/dashboard/teams' },
    { title: 'Submissions', href: '/dashboard/submissions' }
];

export const JUDGE_MENU: MenuItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Ranking', href: '/dashboard/ranking' },
    { title: 'Hồ sơ', href: '/dashboard/profile' },
    { title: 'Scoring Criteria', href: '/dashboard/scoring-criteria' },
    { title: 'Scoring', href: '/dashboard/scores' }
];

export const LEADER_MENU: MenuItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Ranking', href: '/dashboard/ranking' },
    { title: 'Hồ sơ', href: '/dashboard/profile' },
    { title: 'Team', href: '/dashboard/teams' },
    { title: 'Members', href: '/dashboard/teams' },
    { title: 'Submissions', href: '/dashboard/submissions' }
];

export const MEMBER_MENU: MenuItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Ranking', href: '/dashboard/ranking' },
    { title: 'Hồ sơ', href: '/dashboard/profile' },
    { title: 'Team', href: '/dashboard/teams' },
    { title: 'Submission (View only)', href: '/dashboard/submissions' }
];

export const MENU: Partial<Record<UserRole, MenuItem[]>> = {
    Admin: ADMIN_MENU,
    EventCoordinator: ADMIN_MENU,
    Mentor: MENTOR_MENU,
    Judge: JUDGE_MENU,
    GuestJudge: JUDGE_MENU,
    TeamMember: MEMBER_MENU
};
