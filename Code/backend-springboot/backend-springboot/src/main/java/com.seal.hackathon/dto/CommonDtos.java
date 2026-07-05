package com.seal.hackathon.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class CommonDtos {
    public record CreateEventRequest(
            @NotBlank String eventName,
            @NotBlank String season,
            @NotNull Integer eventYear,
            LocalDate startDate,
            LocalDate endDate,
            String status,
            String description
    ) {}

    public record UpdateEventRequest(
            String eventName,
            String season,
            Integer eventYear,
            LocalDate startDate,
            LocalDate endDate,
            String status,
            String description
    ) {}

    public record CreateRoundRequest(
            @NotNull Integer eventId,
            @NotBlank String roundName,
            @NotNull Integer roundOrder,
            LocalDateTime submissionDeadline,
            Integer topNAdvance,
            String roundType,
            Boolean isCalibrationRound,
            LocalDateTime startTime,
            LocalDateTime endTime
    ) {}

    public record UpdateRoundRequest(
            String roundName,
            Integer roundOrder,
            LocalDateTime submissionDeadline,
            Integer topNAdvance,
            String roundType,
            Boolean isCalibrationRound,
            LocalDateTime startTime,
            LocalDateTime endTime
    ) {}

    public record CreateTrackRequest(@NotNull Integer eventId, @NotBlank String trackName, String description) {}
    public record UpdateTrackRequest(String trackName, String description) {}

    public record CreateTeamRequest(@NotNull Integer eventId, @NotNull Integer trackId, @NotBlank String teamName) {}
    public record UpdateTeamStatusRequest(@NotBlank String status, String reason) {}

    public record AddMemberRequest(@NotNull Integer teamId, @NotNull Integer userId, String memberRole) {}

    public record SubmitWorkRequest(
            @NotNull Integer teamId,
            @NotNull Integer roundId,
            String repositoryUrl,
            String demoUrl,
            String reportUrl
    ) {}
    public record EliminateSubmissionRequest(@NotBlank String reason) {}

    public record CreateScoreRequest(
            @NotNull Integer submissionId,
            @NotNull Integer criterionId,
            @NotNull @DecimalMin("0.0") BigDecimal scoreValue,
            String comment
    ) {}

    public record CreateJudgeAssignmentRequest(@NotNull Integer roundId, @NotNull Integer trackId, @NotNull Integer judgeId) {}

    public record CreateCriterionTemplateRequest(@NotBlank String templateName, String description, List<CreateCriterionTemplateItemRequest> items) {}
    public record CreateCriterionTemplateItemRequest(@NotBlank String criterionName, @NotNull BigDecimal maxScore, @NotNull BigDecimal weight, Integer displayOrder) {}
    public record ApplyTemplateRequest(Boolean replaceExisting) {}
    public record UpdateCriterionTemplateStatusRequest(Boolean isActive) {}

    public record CreateEventCriterionRequest(@NotNull Integer eventId, @NotBlank String criterionName, @NotNull BigDecimal maxScore, @NotNull BigDecimal weight) {}
    public record UpdateEventCriterionRequest(String criterionName, BigDecimal maxScore, BigDecimal weight, Boolean isActive) {}

    public record AssignTrackMentorRequest(@NotNull Integer trackId, @NotNull Integer mentorId) {}

    public record CreatePrizeRequest(@NotNull Integer eventId, @NotNull Integer trackId, @NotBlank String prizeName, @NotNull Integer rankNo, String description) {}
    public record AwardPrizeRequest(@NotNull Integer teamId, @NotNull Integer prizeId) {}

    public record CreateAnnouncementRequest(@NotNull Integer eventId, Integer trackId, String targetRole, @NotBlank String title, @NotBlank String content, Boolean isPublished) {}
    public record UpdateAnnouncementRequest(Integer trackId, String targetRole, String title, String content, Boolean isPublished) {}
}
