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
    description?: string;
    trackId?: string | number;
    roundId?: string | number;
    maxScore?: number;
    weight?: number;
    isActive?: boolean;
    [key: string]: unknown;
}

export interface CreateCriterionPayload {
    eventId: number | string;
    criterionName: string;
    description?: string;
    trackId?: number | string;
    roundId?: number | string;
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

export interface ScoreSummary {
    eventId?: number | string;
    eventName?: string;
    trackId?: number | string;
    categoryName?: string;
    roundId?: number | string;
    roundName?: string;
    submissionId?: number | string;
    teamId?: number | string;
    teamName?: string;
    judgeId?: number | string;
    judgeName?: string;
    criterionScores?: Record<string, number>;
    totalScore?: number;
    averageScore?: number;
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
    teamId?: string | number;
    teamName?: string;
    trackId?: string | number;
    rank?: number;
    rankNo?: number;
    totalScore?: number;
    finalScore?: number;
    averageScore?: number;
    isPublished?: boolean;
    isAdvanced?: boolean;
    [key: string]: unknown;
}

export interface RankingExportRow extends RankingRow {
    eventId?: string | number;
    eventName?: string;
    roundId?: string | number;
    roundName?: string;
    trackName?: string;
    awardStatus?: string;
    resultStatus?: 'Qualified' | 'Eliminated' | 'Winner' | 'Not Published' | string;
    criterionScores?: Array<{
        criterionId?: number | string;
        criterionName?: string;
        description?: string;
        maxScore?: number;
        weight?: number;
        averageScore?: number;
    }>;
    judgeCount?: number;
    submissionId?: string | number;
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