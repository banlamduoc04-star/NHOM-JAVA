export interface Submission {
    submissionId?: string;
    teamId?: string;
    roundId?: string;
    repositoryUrl?: string;
    demoUrl?: string;
    reportUrl?: string;
    submittedAt?: string;
    isEliminated?: boolean;
    eliminationReason?: string;
    [key: string]: unknown;
}

export interface CreateSubmissionPayload {
    teamId: number | string;
    roundId: number | string;
    repositoryUrl?: string;
    demoUrl?: string;
    reportUrl?: string;
    [key: string]: unknown;
}