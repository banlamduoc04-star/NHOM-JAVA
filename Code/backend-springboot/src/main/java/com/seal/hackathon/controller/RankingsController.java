package com.seal.hackathon.controller;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.seal.hackathon.service.RankingService;

@RestController
@RequestMapping("/api/rankings")
public class RankingsController {
    private final RankingService rankingService;
    public RankingsController(RankingService rankingService) { this.rankingService=rankingService; }
    @GetMapping("/round") public List<RankingService.RankingItem> getRoundRanking(@RequestParam Integer roundId, @RequestParam(required=false) Integer trackId) { return rankingService.calculateRoundRanking(roundId, trackId); }
    @GetMapping("/advance") public List<Map<String,Object>> getTeamsAdvance(@RequestParam Integer roundId) { return rankingService.calculateRoundRanking(roundId, null).stream().map(r -> { Map<String,Object> m=new LinkedHashMap<>(); m.put("teamId", r.teamId()); m.put("teamName", r.teamName()); m.put("trackId", r.trackId()); m.put("rankNo", r.rankNo()); m.put("finalScore", r.finalScore()); return m; }).toList(); }
}
