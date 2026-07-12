package com.seal.hackathon.controller;

import java.util.List;
import java.util.Set;

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
import com.seal.hackathon.dto.CommonDtos.CreateTrackRequest;
import com.seal.hackathon.dto.CommonDtos.UpdateTrackRequest;
import com.seal.hackathon.entity.Track;
import com.seal.hackathon.repository.EventCriterionRepository;
import com.seal.hackathon.repository.HackathonEventRepository;
import com.seal.hackathon.repository.JudgeAssignmentRepository;
import com.seal.hackathon.repository.PrizeRepository;
import com.seal.hackathon.repository.TeamRepository;
import com.seal.hackathon.repository.TrackMentorRepository;
import com.seal.hackathon.repository.TrackRepository;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/tracks")
public class TracksController {
    private static final Set<String> ALLOWED_STATUSES = Set.of("Active", "Inactive");

    private final TrackRepository tracks;
    private final HackathonEventRepository events;
    private final TeamRepository teams;
    private final JudgeAssignmentRepository assignments;
    private final TrackMentorRepository mentors;
    private final PrizeRepository prizes;
    private final EventCriterionRepository criteria;

    public TracksController(
            TrackRepository tracks,
            HackathonEventRepository events,
            TeamRepository teams,
            JudgeAssignmentRepository assignments,
            TrackMentorRepository mentors,
            PrizeRepository prizes,
            EventCriterionRepository criteria
    ) {
        this.tracks = tracks;
        this.events = events;
        this.teams = teams;
        this.assignments = assignments;
        this.mentors = mentors;
        this.prizes = prizes;
        this.criteria = criteria;
    }

    @GetMapping
    public List<Track> getTracks(@RequestParam(required=false) Integer eventId) {
        return eventId == null ? tracks.findAll() : tracks.findByEventId(eventId);
    }

    @GetMapping("/{trackId}")
    public Track getTrack(@PathVariable Integer trackId) {
        return tracks.findById(trackId).orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hạng mục"));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('EventCoordinator','Admin')")
    public Track createTrack(@Valid @RequestBody CreateTrackRequest request) {
        if (!events.existsById(request.eventId())) throw new ResourceNotFoundException("Không tìm thấy sự kiện");
        Track track = new Track();
        track.eventId = request.eventId();
        track.trackName = request.trackName().trim();
        track.description = request.description();
        track.status = normalizeStatus(request.status());
        return tracks.save(track);
    }

    @PutMapping("/{trackId}")
    @PreAuthorize("hasAnyRole('EventCoordinator','Admin')")
    public Track updateTrack(@PathVariable Integer trackId, @RequestBody UpdateTrackRequest request) {
        Track track = getTrack(trackId);
        if (request.trackName() != null && !request.trackName().isBlank()) track.trackName = request.trackName().trim();
        if (request.description() != null) track.description = request.description();
        if (request.status() != null) track.status = normalizeStatus(request.status());
        return tracks.save(track);
    }

    @DeleteMapping("/{trackId}")
    @PreAuthorize("hasAnyRole('EventCoordinator','Admin')")
    public void deleteTrack(@PathVariable Integer trackId) {
        Track track = getTrack(trackId);
        boolean referenced = teams.existsByTrackId(trackId)
                || assignments.existsByTrackId(trackId)
                || mentors.existsByTrackId(trackId)
                || prizes.existsByTrackId(trackId)
                || criteria.existsByTrackId(trackId);
        if (referenced) {
            throw new IllegalArgumentException("Hạng mục đang được sử dụng. Hãy chuyển trạng thái sang Inactive thay vì xóa.");
        }
        tracks.delete(track);
    }

    private String normalizeStatus(String status) {
        String normalized = status == null || status.isBlank() ? "Active" : status.trim();
        if (!ALLOWED_STATUSES.contains(normalized)) {
            throw new IllegalArgumentException("Trạng thái hạng mục chỉ nhận Active hoặc Inactive");
        }
        return normalized;
    }
}
