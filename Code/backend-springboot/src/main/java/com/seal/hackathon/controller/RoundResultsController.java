package com.seal.hackathon.controller;

import java.util.Comparator;
import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.seal.hackathon.config.GlobalExceptionHandler.ResourceNotFoundException;
import com.seal.hackathon.entity.Announcement;
import com.seal.hackathon.entity.HackathonRound;
import com.seal.hackathon.entity.RoundResult;
import com.seal.hackathon.repository.AnnouncementRepository;
import com.seal.hackathon.repository.HackathonRoundRepository;
import com.seal.hackathon.repository.RoundResultRepository;
import com.seal.hackathon.repository.TeamMemberRepository;
import com.seal.hackathon.security.SecurityUtil;
import com.seal.hackathon.service.RankingService;

import jakarta.transaction.Transactional;

@RestController
@RequestMapping("/api/round-results")
public class RoundResultsController {
    private final RoundResultRepository results;
    private final RankingService rankingService;
    private final HackathonRoundRepository rounds;
    private final AnnouncementRepository announcements;
    private final TeamMemberRepository members;

    public RoundResultsController(
            RoundResultRepository results,
            RankingService rankingService,
            HackathonRoundRepository rounds,
            AnnouncementRepository announcements,
            TeamMemberRepository members
    ) {
        this.results = results;
        this.rankingService = rankingService;
        this.rounds = rounds;
        this.announcements = announcements;
        this.members = members;
    }

    @GetMapping("/round/{roundId}")
    public List<RoundResult> getByRound(
            @PathVariable Integer roundId,
            @RequestParam(required = false) Integer trackId
    ) {
        List<RoundResult> data = (trackId == null ? results.findByRoundId(roundId) : results.findByRoundIdAndTrackIdOrderByRankInTrackAsc(roundId, trackId))
                .stream()
                .sorted(Comparator.comparing((RoundResult r) -> r.trackId).thenComparing(r -> r.rankInTrack))
                .toList();
        if (!"TeamMember".equals(SecurityUtil.currentRole())) return data;
        Integer userId = SecurityUtil.currentUserId();
        return data.stream().filter(result -> members.existsByTeamIdAndUserId(result.teamId, userId)).toList();
    }

    @GetMapping("/team/{teamId}")
    public List<RoundResult> getByTeam(@PathVariable Integer teamId) {
        if ("TeamMember".equals(SecurityUtil.currentRole())) {
            SecurityUtil.require(members.existsByTeamIdAndUserId(teamId, SecurityUtil.currentUserId()));
        }
        return results.findByTeamId(teamId);
    }

    @PostMapping("/round/{roundId}/publish")
    @Transactional
    @PreAuthorize("hasAnyRole('EventCoordinator','Admin')")
    public List<RoundResult> publishRound(@PathVariable Integer roundId) {
        HackathonRound round = rounds.findById(roundId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy vòng thi"));
        List<RoundResult> published = rankingService.evaluateRound(roundId, SecurityUtil.currentUserId());

        Announcement announcement = new Announcement();
        announcement.eventId = round.eventId;
        announcement.createdBy = SecurityUtil.currentUserId();
        announcement.trackId = null;
        announcement.targetRole = "TeamMember";
        announcement.title = "Đã công bố kết quả " + round.roundName;
        announcement.content = "Kết quả vòng " + round.roundName + " đã được tổng hợp theo điểm trung bình có trọng số, xếp hạng theo từng hạng mục và công bố trên Dashboard.";
        announcement.isPublished = true;
        announcements.save(announcement);

        return published;
    }
}
