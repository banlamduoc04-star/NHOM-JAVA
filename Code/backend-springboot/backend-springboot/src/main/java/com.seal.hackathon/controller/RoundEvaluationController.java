package com.seal.hackathon.controller;

import com.seal.hackathon.entity.*;
import com.seal.hackathon.repository.*;
import com.seal.hackathon.security.SecurityUtil;
import com.seal.hackathon.service.RankingService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/rounds")
public class RoundEvaluationController {
    private final RankingService rankingService; private final RoundResultRepository results; private final SubmissionRepository submissions; private final ScoreRepository scores; private final JudgeAssignmentRepository assignments;
    public RoundEvaluationController(RankingService rankingService, RoundResultRepository results, SubmissionRepository submissions, ScoreRepository scores, JudgeAssignmentRepository assignments) { this.rankingService=rankingService; this.results=results; this.submissions=submissions; this.scores=scores; this.assignments=assignments; }
    @GetMapping("/{roundId}/standings") public List<RankingService.RankingItem> standings(@PathVariable Integer roundId, @RequestParam(required=false) Integer trackId) { return rankingService.calculateRoundRanking(roundId, trackId); }
    @GetMapping("/{roundId}/score-completeness") public Map<String,Object> completeness(@PathVariable Integer roundId) {
        List<Submission> subs=submissions.findByRoundId(roundId); List<JudgeAssignment> jas=assignments.findByRoundId(roundId); List<Score> sc=scores.findByRoundId(roundId);
        Map<Integer, Long> bySub=sc.stream().collect(Collectors.groupingBy(s -> s.submissionId, Collectors.counting()));
        Map<String,Object> m=new LinkedHashMap<>(); m.put("roundId", roundId); m.put("submissionCount", subs.size()); m.put("judgeAssignmentCount", jas.size()); m.put("scoreCount", sc.size()); m.put("scoresBySubmission", bySub); return m;
    }
    @PostMapping("/{roundId}/evaluate-elimination") @PreAuthorize("hasRole('EventCoordinator')") public List<RoundResult> evaluate(@PathVariable Integer roundId) { return rankingService.evaluateRound(roundId, SecurityUtil.currentUserId()); }
    @GetMapping("/{roundId}/submissions") public List<Submission> submissions(@PathVariable Integer roundId) { return submissions.findByRoundId(roundId); }
}
