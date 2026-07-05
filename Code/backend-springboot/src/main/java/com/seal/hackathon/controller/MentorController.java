package com.seal.hackathon.controller;

import com.seal.hackathon.entity.*;
import com.seal.hackathon.repository.*;
import com.seal.hackathon.security.SecurityUtil;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/mentor")
@PreAuthorize("hasRole('Mentor')")
public class MentorController {
    private final TrackMentorRepository trackMentors; private final TrackRepository tracks; private final TeamRepository teams; private final SubmissionRepository submissions;
    public MentorController(TrackMentorRepository trackMentors, TrackRepository tracks, TeamRepository teams, SubmissionRepository submissions) { this.trackMentors=trackMentors; this.tracks=tracks; this.teams=teams; this.submissions=submissions; }
    @GetMapping("/my-tracks") public List<Track> myTracks(@RequestParam(required=false) Integer eventId) { Integer mentorId= SecurityUtil.currentUserId(); return trackMentors.findByMentorId(mentorId).stream().map(tm -> tracks.findById(tm.trackId).orElse(null)).filter(Objects::nonNull).filter(t -> eventId==null || eventId.equals(t.eventId)).toList(); }
    @GetMapping("/my-teams") public List<Team> myTeams(@RequestParam(required=false) Integer eventId, @RequestParam(required=false) Integer trackId) { return myTracks(eventId).stream().filter(t -> trackId==null || trackId.equals(t.trackId)).flatMap(t -> teams.findByTrackId(t.trackId).stream()).toList(); }
    @GetMapping("/team-submissions") public List<Submission> teamSubmissions(@RequestParam(required=false) Integer eventId, @RequestParam(required=false) Integer roundId, @RequestParam(required=false) Integer trackId) { return myTeams(eventId, trackId).stream().flatMap(t -> submissions.findByTeamId(t.teamId).stream()).filter(s -> roundId==null || roundId.equals(s.roundId)).toList(); }
}
