package com.seal.hackathon.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO dùng chung cho các chức năng của hệ thống.
 */
public class CommonDtos {

    // =========================
    // Event
    // =========================

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

    // =========================
    // Round
    // =========================

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

    // =========================
    // Track
    // =========================

    public record CreateTrackRequest(
            @NotNull Integer eventId,
            @NotBlank String trackName,
            String description
    ) {}

    public record UpdateTrackRequest(
            String trackName,
            String description
    ) {}

    // =========================
    // Team
    // =========================

    public record CreateTeamRequest(
            @NotNull Integer eventId,
            @NotNull Integer trackId,
            @NotBlank String teamName
    ) {}

    public record UpdateTeamStatusRequest(
            @NotBlank String status,
            String reason
    ) {}

    public record AddMemberRequest(
            @NotNull Integer teamId,
            @NotNull Integer userId,
            String memberRole
    ) {}

    // =========================
    // Submission
    // =========================

    public record SubmitWorkRequest(
            @NotNull Integer teamId,
            @NotNull Integer roundId,
            String repositoryUrl,
            String demoUrl,
            String reportUrl
    ) {}

    public record EliminateSubmissionRequest(
            @NotBlank String reason
    ) {}

    // =========================
    // Score
    // =========================

    public record CreateScoreRequest(
            @NotNull Integer submissionId,
            @NotNull Integer criterionId,
            @NotNull
            @DecimalMin("0.0")
            BigDecimal scoreValue,
            String comment
    ) {}

    // =========================
    // Judge
    // =========================

    public record CreateJudgeAssignmentRequest(
            @NotNull Integer roundId,
            @NotNull Integer trackId,
            @NotNull Integer judgeId
    ) {}

    // =========================
    // Criterion Template
    // =========================

    public record CreateCriterionTemplateRequest(
            @NotBlank String templateName,
            String description,
            List<CreateCriterionTemplateItemRequest> items
    ) {}

    public record CreateCriterionTemplateItemRequest(
            @NotBlank String criterionName,
            @NotNull BigDecimal maxScore,
            @NotNull BigDecimal weight,
            Integer displayOrder
    ) {}

    public record ApplyTemplateRequest(
            Boolean replaceExisting
    ) {}

    public record UpdateCriterionTemplateStatusRequest(
            Boolean isActive
    ) {}

    // =========================
    // Event Criterion
    // =========================

    public record CreateEventCriterionRequest(
            @NotNull Integer eventId,
            @NotBlank String criterionName,
            @NotNull BigDecimal maxScore,
            @NotNull BigDecimal weight
    ) {}

    public record UpdateEventCriterionRequest(
            String criterionName,
            BigDecimal maxScore,
            BigDecimal weight,
            Boolean isActive
    ) {}

    // =========================
    // Mentor
    // =========================

    public record AssignTrackMentorRequest(
            @NotNull Integer trackId,
            @NotNull Integer mentorId
    ) {}

    // =========================
    // Prize
    // =========================

    public record CreatePrizeRequest(
            @NotNull Integer eventId,
            @NotNull Integer trackId,
            @NotBlank String prizeName,
            @NotNull Integer rankNo,
            String description
    ) {}

    public record AwardPrizeRequest(
            @NotNull Integer teamId,
            @NotNull Integer prizeId
    ) {}

    // =========================
    // Announcement
    // =========================

    public record CreateAnnouncementRequest(
            @NotNull Integer eventId,
            Integer trackId,
            String targetRole,
            @NotBlank String title,
            @NotBlank String content,
            Boolean isPublished
    ) {}

    public record UpdateAnnouncementRequest(
            Integer trackId,
            String targetRole,
            String title,
            String content,
            Boolean isPublished
    ) {}
}