package com.seal.hackathon.controller;

import java.util.List;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.seal.hackathon.repository.TeamMemberRepository;
import com.seal.hackathon.security.SecurityUtil;
import com.seal.hackathon.service.RankingService;

@RestController
@RequestMapping("/api/rankings")
public class RankingsController {
    private final RankingService rankingService;
    private final TeamMemberRepository members;

    public RankingsController(RankingService rankingService, TeamMemberRepository members) {
        this.rankingService = rankingService;
        this.members = members;
    }

    @GetMapping
    public List<RankingService.ExportRow> getRankings(
            @RequestParam(required = false) Integer eventId,
            @RequestParam(required = false) Integer trackId,
            @RequestParam(required = false) Integer roundId
    ) {
        return filterForCurrentUser(rankingService.exportRows(eventId, trackId, roundId));
    }

    @GetMapping("/round")
    public List<RankingService.RankingItem> getRoundRanking(
            @RequestParam Integer roundId,
            @RequestParam(required = false) Integer trackId
    ) {
        return filterRankingForCurrentUser(rankingService.calculateRoundRanking(roundId, trackId));
    }

    @GetMapping("/advance")
    public List<RankingService.RankingItem> getTeamsAdvance(
            @RequestParam Integer roundId,
            @RequestParam(required = false) Integer trackId
    ) {
        return filterRankingForCurrentUser(rankingService.getTeamsAdvance(roundId, trackId));
    }

    @GetMapping(value = "/export.csv")
    @PreAuthorize("hasAnyRole('EventCoordinator','Admin')")
    public ResponseEntity<String> exportCsv(
            @RequestParam(required = false) Integer eventId,
            @RequestParam(required = false) Integer trackId,
            @RequestParam(required = false) Integer roundId
    ) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=seal-ranking-export.csv")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(rankingService.exportCsv(eventId, trackId, roundId));
    }

    @GetMapping(value = "/export.xlsx")
    @PreAuthorize("hasAnyRole('EventCoordinator','Admin')")
    public ResponseEntity<byte[]> exportXlsx(
            @RequestParam(required = false) Integer eventId,
            @RequestParam(required = false) Integer trackId,
            @RequestParam(required = false) Integer roundId
    ) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=seal-ranking-export.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(rankingService.exportXlsx(eventId, trackId, roundId));
    }

    private List<RankingService.ExportRow> filterForCurrentUser(List<RankingService.ExportRow> rows) {
        if (!"TeamMember".equals(SecurityUtil.currentRole())) return rows;
        Integer userId = SecurityUtil.currentUserId();
        return rows.stream()
                .filter(row -> Boolean.TRUE.equals(row.isPublished()))
                .filter(row -> members.existsByTeamIdAndUserId(row.teamId(), userId))
                .toList();
    }

    private List<RankingService.RankingItem> filterRankingForCurrentUser(List<RankingService.RankingItem> rows) {
        if (!"TeamMember".equals(SecurityUtil.currentRole())) return rows;
        Integer userId = SecurityUtil.currentUserId();
        return rows.stream()
                .filter(row -> Boolean.TRUE.equals(row.isPublished()))
                .filter(row -> members.existsByTeamIdAndUserId(row.teamId(), userId))
                .toList();
    }
}
