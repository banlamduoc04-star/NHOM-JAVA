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
import com.seal.hackathon.dto.CommonDtos.CreateRoundRequest;
import com.seal.hackathon.dto.CommonDtos.UpdateRoundRequest;
import com.seal.hackathon.entity.HackathonRound;
import com.seal.hackathon.repository.HackathonEventRepository;
import com.seal.hackathon.repository.HackathonRoundRepository;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/rounds")
public class RoundsController {

    private final HackathonRoundRepository rounds;
    private final HackathonEventRepository events;

    public RoundsController(
            HackathonRoundRepository rounds,
            HackathonEventRepository events
    ) {
        this.rounds = rounds;
        this.events = events;
    }

    @GetMapping
    public List<HackathonRound> getRounds(
            @RequestParam(required = false) Integer eventId
    ) {
        return eventId == null
                ? rounds.findAll()
                : rounds.findByEventIdOrderByRoundOrderAsc(eventId);
    }

    @GetMapping("/{roundId}")
    public HackathonRound getRound(
            @PathVariable Integer roundId
    ) {
        return rounds.findById(roundId)
                .orElseThrow(
                        () -> new ResourceNotFoundException(
                                "Không tìm thấy vòng thi"
                        )
                );
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('EventCoordinator','Admin')")
    public HackathonRound createRound(
            @Valid @RequestBody CreateRoundRequest r
    ) {
        if (!events.existsById(r.eventId())) {
            throw new ResourceNotFoundException(
                    "Không tìm thấy sự kiện"
            );
        }

        HackathonRound round = new HackathonRound();

        round.eventId = r.eventId();
        round.roundName = r.roundName();
        round.roundOrder = r.roundOrder();
        round.submissionDeadline = r.submissionDeadline();
        round.topNAdvance = r.topNAdvance();

        round.roundType = r.roundType() == null
                ? "Competition"
                : r.roundType();

        round.isCalibrationRound =
                Boolean.TRUE.equals(r.isCalibrationRound());

        round.startTime = r.startTime();
        round.endTime = r.endTime();

        return rounds.save(round);
    }

    @PutMapping("/{roundId}")
    @PreAuthorize("hasAnyRole('EventCoordinator','Admin')")
    public HackathonRound updateRound(
            @PathVariable Integer roundId,
            @RequestBody UpdateRoundRequest r
    ) {
        HackathonRound round = getRound(roundId);

        if (r.roundName() != null) {
            round.roundName = r.roundName();
        }

        if (r.roundOrder() != null) {
            round.roundOrder = r.roundOrder();
        }

        if (r.submissionDeadline() != null) {
            round.submissionDeadline = r.submissionDeadline();
        }

        if (r.topNAdvance() != null) {
            round.topNAdvance = r.topNAdvance();
        }

        if (r.roundType() != null) {
            round.roundType = r.roundType();
        }

        if (r.isCalibrationRound() != null) {
            round.isCalibrationRound = r.isCalibrationRound();
        }

        if (r.startTime() != null) {
            round.startTime = r.startTime();
        }

        if (r.endTime() != null) {
            round.endTime = r.endTime();
        }

        return rounds.save(round);
    }

    @DeleteMapping("/{roundId}")
    @PreAuthorize("hasAnyRole('EventCoordinator','Admin')")
    public void deleteRound(
            @PathVariable Integer roundId
    ) {
        HackathonRound round = getRound(roundId);
        rounds.delete(round);
    }
}