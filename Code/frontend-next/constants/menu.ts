import { UserRole } from "@/types/user";

export interface MenuItem {
    title: string;
    href: string;
}

export const MENU: Partial<Record<UserRole, MenuItem[]>> = {

    EventCoordinator: [
        { title: "Dashboard", href: "/dashboard" },
        { title: "Events", href: "/dashboard/events" },
        { title: "Tracks", href: "/dashboard/tracks" },
        { title: "Teams", href: "/dashboard/teams" },
        { title: "Judges", href: "/dashboard/judges" },
        { title: "Mentors", href: "/dashboard/mentors" },
        { title: "Ranking", href: "/dashboard/ranking" },
    ],

    Judge: [
        { title: "Dashboard", href: "/dashboard" },
        { title: "Submissions", href: "/dashboard/submissions" },
        { title: "Scores", href: "/dashboard/scores" },
        { title: "Ranking", href: "/dashboard/ranking" },
    ],

    Mentor: [
        { title: "Dashboard", href: "/dashboard" },
        { title: "Teams", href: "/dashboard/teams" },
        { title: "Ranking", href: "/dashboard/ranking" },
    ],

    TeamMember: [
        { title: "Dashboard", href: "/dashboard" },
        { title: "My Team", href: "/dashboard/teams" },
        { title: "Submission", href: "/dashboard/submissions" },
        { title: "Ranking", href: "/dashboard/ranking" },
    ],

    GuestJudge: [
        { title: "Dashboard", href: "/dashboard" },
        { title: "Scores", href: "/dashboard/scores" },
    ]

};