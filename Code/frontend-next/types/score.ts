export interface Round {
    roundId?: string;
    eventId?: string;
    roundName?: string;
    name?: string;
    startDate?: string;
    endDate?: string;
    [key: string]: unknown;
}

export interface CreateRoundPayload {
    eventId: number | string;
    roundName?: string;
    name?: string;
    startDate?: string;
    endDate?: string;
    [key: string]: unknown;
}

export type UpdateRoundPayload = Partial<CreateRoundPayload>;

export interface Criterion {
    criterionId?: string;
    eventId?: string;
    criterionName?: string;
    maxScore?: number;
    weight?: number;
    isActive?: boolean;
    [key: string]: unknown;
}

export interface CreateCriterionPayload {
    eventId: number | string;
    criterionName: string;
    maxScore: number;
    weight: number;
    [key: string]: unknown;
}

export type UpdateCriterionPayload = Partial<CreateCriterionPayload> & {
    isActive?: boolean;
};

export interface CriterionTemplate {
    templateId?: string;
    templateName?: string;
    criteria?: Criterion[];
    [key: string]: unknown;
}

export interface Score {
    scoreId?: string;
    teamId?: string;
    submissionId?: string;
    judgeId?: string;
    criterionId?: string;
    score?: number;
    scoreValue?: number;
    comment?: string;
    [key: string]: unknown;
}

export interface SubmitScorePayload {
    submissionId: number | string;
    criterionId?: number | string;
    teamId?: number | string;
    judgeId?: number | string;
    score?: number;
    scoreValue?: number;
    comment?: string;
    [key: string]: unknown;
}

export interface RankingRow {
    teamId?: string;
    teamName?: string;
    trackId?: string;
    rank?: number;
    totalScore?: number;
    averageScore?: number;
    [key: string]: unknown;
}

export interface ScoreCompleteness {
    roundId?: string;
    completed?: number;
    total?: number;
    percentage?: number;
    [key: string]: unknown;
}

export interface Prize {
    prizeId?: string;
    eventId?: string;
    trackId?: string;
    teamId?: string;
    prizeName?: string;
    amount?: number;
    [key: string]: unknown;
}

export interface CreatePrizePayload {
    eventId: number | string;
    trackId?: number | string;
    prizeName: string;
    amount?: number;
    [key: string]: unknown;
}

export interface AwardPrizePayload {
    prizeId?: number | string;
    teamId: number | string;
    eventId?: number | string;
    trackId?: number | string;
    [key: string]: unknown;
}