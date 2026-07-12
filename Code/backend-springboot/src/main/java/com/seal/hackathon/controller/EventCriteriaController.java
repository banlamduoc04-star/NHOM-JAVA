package com.seal.hackathon.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.seal.hackathon.config.GlobalExceptionHandler.ResourceNotFoundException;
import com.seal.hackathon.dto.CommonDtos.CreateEventCriterionRequest;
import com.seal.hackathon.dto.CommonDtos.UpdateEventCriterionRequest;
import com.seal.hackathon.entity.EventCriterion;
import com.seal.hackathon.entity.HackathonRound;
import com.seal.hackathon.entity.Track;
import com.seal.hackathon.repository.EventCriterionRepository;
import com.seal.hackathon.repository.HackathonEventRepository;
import com.seal.hackathon.repository.HackathonRoundRepository;
import com.seal.hackathon.repository.ScoreRepository;
import com.seal.hackathon.repository.TrackRepository;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/event-criteria")
public class EventCriteriaController {

    private final EventCriterionRepository criteria;
    private final HackathonEventRepository events;
    private final TrackRepository tracks;
    private final HackathonRoundRepository rounds;
    private final ScoreRepository scores;

    public EventCriteriaController(
            EventCriterionRepository criteria,
            HackathonEventRepository events,
            TrackRepository tracks,
            HackathonRoundRepository rounds,
            ScoreRepository scores
    ) {
        this.criteria = criteria;
        this.events = events;
        this.tracks = tracks;
        this.rounds = rounds;
        this.scores = scores;
    }

    @GetMapping("/event/{eventId}")
    @PreAuthorize("hasAnyRole('EventCoordinator','Admin','Judge','GuestJudge')")
    public List<EventCriterion> getByEvent(
            @PathVariable Integer eventId,
            @RequestParam(defaultValue = "false") boolean includeInactive,
            @RequestParam(required = false) Integer trackId,
            @RequestParam(required = false) Integer roundId
    ) {
        List<EventCriterion> data = includeInactive
                ? criteria.findByEventId(eventId)
                : criteria.findByEventIdAndIsActive(eventId, true);

        return data.stream()
                .filter(
                        c -> trackId == null
                                || c.trackId == null
                                || trackId.equals(c.trackId)
                )
                .filter(
                        c -> roundId == null
                                || c.roundId == null
                                || roundId.equals(c.roundId)
                )
                .toList();
    }

    @GetMapping("/{criterionId}")
    @PreAuthorize("hasAnyRole('EventCoordinator','Admin','Judge','GuestJudge')")
    public EventCriterion getOne(
            @PathVariable Integer criterionId
    ) {
        return criteria.findById(criterionId)
                .orElseThrow(
                        () -> new ResourceNotFoundException(
                                "Không tìm thấy tiêu chí"
                        )
                );
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('EventCoordinator','Admin')")
    public EventCriterion create(
            @Valid @RequestBody CreateEventCriterionRequest request
    ) {
        if (!events.existsById(request.eventId())) {
            throw new ResourceNotFoundException(
                    "Không tìm thấy sự kiện"
            );
        }

        validateScope(
                request.eventId(),
                request.trackId(),
                request.roundId()
        );

        validateScore(request.maxScore());

        EventCriterion criterion = new EventCriterion();

        criterion.eventId = request.eventId();
        criterion.trackId = request.trackId();
        criterion.roundId = request.roundId();
        criterion.criterionName = request.criterionName().trim();
        criterion.description = request.description();
        criterion.maxScore = request.maxScore();
        criterion.weight = request.weight();
        criterion.isActive = true;

        return criteria.save(criterion);
    }

    @PutMapping("/{criterionId}")
    @PreAuthorize("hasAnyRole('EventCoordinator','Admin')")
    public EventCriterion update(
            @PathVariable Integer criterionId,
            @RequestBody UpdateEventCriterionRequest request
    ) {
        EventCriterion criterion = getOne(criterionId);

        Integer nextTrackId = request.trackId() != null
                ? request.trackId()
                : criterion.trackId;

        Integer nextRoundId = request.roundId() != null
                ? request.roundId()
                : criterion.roundId;

        validateScope(
                criterion.eventId,
                nextTrackId,
                nextRoundId
        );

        if (request.maxScore() != null) {
            validateScore(request.maxScore());
        }

        if (request.trackId() != null) {
            criterion.trackId = request.trackId();
        }

        if (request.roundId() != null) {
            criterion.roundId = request.roundId();
        }

        if (request.criterionName() != null
                && !request.criterionName().isBlank()) {
            criterion.criterionName = request.criterionName().trim();
        }

        if (request.description() != null) {
            criterion.description = request.description();
        }

        if (request.maxScore() != null) {
            criterion.maxScore = request.maxScore();
        }

        if (request.weight() != null) {
            criterion.weight = request.weight();
        }

        if (request.isActive() != null) {
            criterion.isActive = request.isActive();
        }

        return criteria.save(criterion);
    }

    @DeleteMapping("/{criterionId}")
    @PreAuthorize("hasAnyRole('EventCoordinator','Admin')")
    public EventCriterion delete(
            @PathVariable Integer criterionId,
            @RequestParam(defaultValue = "false") boolean permanent
    ) {
        EventCriterion criterion = getOne(criterionId);

        if (!permanent) {
            criterion.isActive = false;
            return criteria.save(criterion);
        }

        if (scores.existsByCriterionId(criterionId)) {
            throw new IllegalArgumentException(
                    "Tiêu chí đã có điểm số nên không thể xóa vĩnh viễn. "
                            + "Hãy chuyển sang Inactive."
            );
        }

        criteria.delete(criterion);

        return criterion;
    }

    private void validateScope(
            Integer eventId,
            Integer trackId,
            Integer roundId
    ) {
        if (trackId != null) {
            Track track = tracks.findById(trackId)
                    .orElseThrow(
                            () -> new ResourceNotFoundException(
                                    "Không tìm thấy hạng mục"
                            )
                    );

            if (!eventId.equals(track.eventId)) {
                throw new IllegalArgumentException(
                        "Hạng mục không thuộc sự kiện đã chọn"
                );
            }
        }

        if (roundId != null) {
            HackathonRound round = rounds.findById(roundId)
                    .orElseThrow(
                            () -> new ResourceNotFoundException(
                                    "Không tìm thấy vòng thi"
                            )
                    );

            if (!eventId.equals(round.eventId)) {
                throw new IllegalArgumentException(
                        "Vòng thi không thuộc sự kiện đã chọn"
                );
            }
        }
    }

    private void validateScore(
            java.math.BigDecimal maxScore
    ) {
        if (maxScore == null || maxScore.signum() <= 0) {
            throw new IllegalArgumentException(
                    "Điểm tối đa phải lớn hơn 0"
            );
        }
    }
}