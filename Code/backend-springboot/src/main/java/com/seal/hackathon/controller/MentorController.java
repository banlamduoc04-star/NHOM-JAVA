package com.seal.hackathon.controller;

import java.util.List;
import java.util.Objects;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.seal.hackathon.entity.Submission;
import com.seal.hackathon.entity.Team;
import com.seal.hackathon.entity.Track;
import com.seal.hackathon.repository.SubmissionRepository;
import com.seal.hackathon.repository.TeamRepository;
import com.seal.hackathon.repository.TrackMentorRepository;
import com.seal.hackathon.repository.TrackRepository;
import com.seal.hackathon.security.SecurityUtil;

@RestController
@RequestMapping("/api/mentor")
@PreAuthorize("isAuthenticated()")
public class MentorController {

    private final TrackMentorRepository trackMentors;
    private final TrackRepository tracks;
    private final TeamRepository teams;
    private final SubmissionRepository submissions;

    public MentorController(
            TrackMentorRepository trackMentors,
            TrackRepository tracks,
            TeamRepository teams,
            SubmissionRepository submissions
    ) {
        this.trackMentors = trackMentors;
        this.tracks = tracks;
        this.teams = teams;
        this.submissions = submissions;
    }

    @GetMapping("/my-tracks")
    public List<Track> myTracks(
            @RequestParam(required = false) Integer eventId
    ) {

        Integer mentorId = SecurityUtil.currentUserId();

        // Chỉ lấy các track đã được phân công cho mentor hiện tại
        return trackMentors.findByMentorId(mentorId)
                .stream()
                .map(tm -> tracks.findById(tm.trackId).orElse(null))
                .filter(Objects::nonNull)
                .filter(track ->
                        eventId == null || eventId.equals(track.eventId))
                .toList();
    }

    @GetMapping("/my-teams")
    public List<Team> myTeams(
            @RequestParam(required = false) Integer eventId,
            @RequestParam(required = false) Integer trackId
    ) {

        return myTracks(eventId)
                .stream()
                .filter(track ->
                        trackId == null || trackId.equals(track.trackId))
                .flatMap(track ->
                        teams.findByTrackId(track.trackId).stream())
                .toList();
    }

    @GetMapping("/team-submissions")
    public List<Submission> teamSubmissions(
            @RequestParam(required = false) Integer eventId,
            @RequestParam(required = false) Integer roundId,
            @RequestParam(required = false) Integer trackId
    ) {

        // Mentor chỉ xem bài nộp của các đội thuộc track mình phụ trách
        return myTeams(eventId, trackId)
                .stream()
                .flatMap(team ->
                        submissions.findByTeamId(team.teamId).stream())
                .filter(submission ->
                        roundId == null || roundId.equals(submission.roundId))
                .toList();
    }
}