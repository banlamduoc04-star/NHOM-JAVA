export type UserRole =
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
    status?: UserStatus;
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

export interface JudgeAssignment {
    judgeAssignmentId?: string;
    assignmentId?: string;
    judgeId?: string;
    eventId?: number | string;
    trackId?: number | string;
    roundId?: number | string;
    submissionId?: number | string;
    [key: string]: unknown;
}

export interface AssignJudgePayload {
    judgeId: number | string;
    eventId?: number | string;
    trackId?: number | string;
    roundId?: number | string;
    submissionId?: number | string;
    [key: string]: unknown;
}