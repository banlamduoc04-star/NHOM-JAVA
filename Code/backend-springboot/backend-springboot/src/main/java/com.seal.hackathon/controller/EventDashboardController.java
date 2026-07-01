package com.seal.hackathon.controller;

import com.seal.hackathon.entity.*;
import com.seal.hackathon.repository.*;
import com.seal.hackathon.service.RankingService;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/events")
public class EventDashboardController {
    private final TrackRepository tracks; private final HackathonRoundRepository rounds; private final TeamRepository teams; private final SubmissionRepository submissions; private final RankingService rankingService;
    public EventDashboardController(TrackRepository tracks, HackathonRoundRepository rounds, TeamRepository teams, SubmissionRepository submissions, RankingService rankingService) { this.tracks=tracks; this.rounds=rounds; this.teams=teams; this.submissions=submissions; this.rankingService=rankingService; }
    @GetMapping("/{eventId}/standings")
    public Map<String,Object> standings(@PathVariable Integer eventId) {
        Map<String,Object> m=new LinkedHashMap<>(); List<Track> ts=tracks.findByEventId(eventId); List<HackathonRound> rs=rounds.findByEventIdOrderByRoundOrderAsc(eventId); List<Team> teamList=teams.findByEventId(eventId);
        m.put("eventId", eventId); m.put("trackCount", ts.size()); m.put("roundCount", rs.size()); m.put("teamCount", teamList.size());
        m.put("submissionCount", submissions.findAll().stream().filter(s -> teamList.stream().anyMatch(t -> t.teamId.equals(s.teamId))).count());
        m.put("latestRoundRanking", rs.isEmpty()?List.of():rankingService.calculateRoundRanking(rs.get(rs.size()-1).roundId, null));
        return m;
    }
}
