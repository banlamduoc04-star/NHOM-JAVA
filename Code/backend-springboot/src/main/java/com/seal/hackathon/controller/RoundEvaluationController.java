package com.seal.hackathon.controller;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.seal.hackathon.entity.JudgeAssignment;
import com.seal.hackathon.entity.Score;
import com.seal.hackathon.entity.Submission;
import com.seal.hackathon.repository.JudgeAssignmentRepository;
import com.seal.hackathon.repository.RoundResultRepository;
import com.seal.hackathon.repository.ScoreRepository;
import com.seal.hackathon.repository.SubmissionRepository;
import com.seal.hackathon.repository.TeamMemberRepository;
import com.seal.hackathon.security.SecurityUtil;
import com.seal.hackathon.service.RankingService;

@RestController
@RequestMapping("/api/rounds")
public class RoundEvaluationController {

    private final RankingService rankingService;
    private final RoundResultRepository results;
    private final SubmissionRepository submissions;
    private final ScoreRepository scores;
    private final JudgeAssignmentRepository assignments;
    private final TeamMemberRepository members;

    public RoundEvaluationController(
            RankingService rankingService,
            RoundResultRepository results,
            SubmissionRepository submissions,
            ScoreRepository scores,
            JudgeAssignmentRepository assignments,
            TeamMemberRepository members
    ) {
        this.rankingService = rankingService;
        this.results = results;
        this.submissions = submissions;
        this.scores = scores;
        this.assignments = assignments;
        this.members = members;
    }

    @GetMapping("/{roundId}/standings")
    public List<RankingService.RankingItem> standings(
            @PathVariable Integer roundId,
            @RequestParam(required = false) Integer trackId
    ) {
        List<RankingService.RankingItem> data =
                rankingService.calculateRoundRanking(
                        roundId,
                        trackId
                );

        if (!"TeamMember".equals(SecurityUtil.currentRole())) {
            return data;
        }

        Integer userId = SecurityUtil.currentUserId();

        return data.stream()
                .filter(
                        item -> Boolean.TRUE.equals(
                                item.isPublished()
                        )
                )
                .filter(
                        item -> members.existsByTeamIdAndUserId(
                                item.teamId(),
                                userId
                        )
                )
                .toList();
    }

    @GetMapping("/{roundId}/score-completeness")
    public Map<String, Object> completeness(
            @PathVariable Integer roundId
    ) {
        List<Submission> subs =
                submissions.findByRoundId(roundId);

        List<JudgeAssignment> jas =
                assignments.findByRoundId(roundId);

        List<Score> sc =
                scores.findByRoundId(roundId);

        Map<Integer, Long> bySub = sc.stream()
                .collect(
                        Collectors.groupingBy(
                                s -> s.submissionId,
                                Collectors.counting()
                        )
                );

        Map<String, Object> m = new LinkedHashMap<>();

        m.put("roundId", roundId);
        m.put("submissionCount", subs.size());
        m.put("judgeAssignmentCount", jas.size());
        m.put("scoreCount", sc.size());
        m.put("scoresBySubmission", bySub);

        return m;
    }

    @PostMapping("/{roundId}/evaluate-elimination")
    @PreAuthorize("hasAnyRole('EventCoordinator','Admin')")
    public List<RankingService.RankingItem> evaluate(
            @PathVariable Integer roundId
    ) {
        return rankingService.calculateRoundRanking(
                roundId,
                null
        );
    }

    @GetMapping("/{roundId}/submissions")
    public List<Submission> submissions(
            @PathVariable Integer roundId
    ) {
        return submissions.findByRoundId(roundId);
    }
}