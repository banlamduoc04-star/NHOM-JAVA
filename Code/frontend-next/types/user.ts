export type UserRole =
    | 'Admin'
    | 'EventCoordinator'
    | 'TeamMember'
    | 'Mentor'
    | 'Judge'
    | 'GuestJudge';

export type StudentType = 'FPT' | 'EXTERNAL' | string;
export type UserStatus = 'Pending' | 'Approved' | 'Rejected' | string;

export interface User {
    userId?: string;
    id?: string;
    email?: string;
    fullName?: string;
    role?: UserRole;
    roleName?: UserRole;
    studentType?: StudentType;
    fptStudentCode?: string;
    externalStudentCode?: string;
    universityName?: string;
    approved?: boolean;
    isApproved?: boolean;
    status?: UserStatus;
    accountStatus?: 'Pending' | 'Active' | 'Locked' | 'Rejected' | string;
    userType?: string;
    createdAt?: string;
    [key: string]: unknown;
}

export interface AuthSession extends User {
    token: string;
}

export interface LoginPayload {
    email: string;
    password: string;
}

export interface RegisterPayload {
    email: string;
    password: string;
    fullName: string;
    studentType: StudentType;
    fptStudentCode?: string;
    externalStudentCode?: string;
    universityName?: string;
}

export interface PasswordResetRequestResponse {
    message: string;
    resetCodeForDemo?: string;
}

export interface MessageResponse {
    message: string;
    [key: string]: unknown;
}

export interface CreateStaffPayload {
    email: string;
    password?: string;
    fullName: string;
    roleName: UserRole;
    [key: string]: unknown;
}

export interface UpdateUserPayload {
    fullName?: string;
    email?: string;
    password?: string;
    roleName?: UserRole;
    userType?: string;
}

export interface JudgeAssignment {
    judgeAssignmentId?: string;
    assignmentId?: string;
    judgeId?: string;
    eventId?: number | string;
    trackId?: number | string;
    roundId?: number | string;
    submissionId?: number | string;
    teamIds?: Array<number | string>;
    [key: string]: unknown;
}

export interface AssignmentDetail extends JudgeAssignment {
    eventName?: string;
    categoryName?: string;
    roundName?: string;
    assigneeId?: number | string;
    assigneeName?: string;
    assigneeRole?: UserRole;
    teamCount?: number;
    allTeamsInCategory?: boolean;
    teams?: Array<{ teamId?: number | string; teamName?: string; status?: string; memberCount?: number }>;
}

export interface AssignJudgePayload {
    judgeId: number | string;
    eventId?: number | string;
    trackId?: number | string;
    roundId?: number | string;
    submissionId?: number | string;
    teamIds?: Array<number | string>;
    [key: string]: unknown;
}