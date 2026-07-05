package com.seal.hackathon.controller;

import com.seal.hackathon.entity.RoundResult;
import com.seal.hackathon.repository.RoundResultRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/round-results")
public class RoundResultsController {
    private final RoundResultRepository results;
    public RoundResultsController(RoundResultRepository results) { this.results=results; }
    @GetMapping("/round/{roundId}") public List<RoundResult> getByRound(@PathVariable Integer roundId, @RequestParam(required=false) Integer trackId) { return trackId == null ? results.findByRoundId(roundId) : results.findByRoundIdAndTrackIdOrderByRankInTrackAsc(roundId, trackId); }
    @GetMapping("/team/{teamId}") public List<RoundResult> getByTeam(@PathVariable Integer teamId) { return results.findByTeamId(teamId); }
}
