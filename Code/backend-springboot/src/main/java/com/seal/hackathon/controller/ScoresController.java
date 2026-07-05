package com.seal.hackathon.controller;

import com.seal.hackathon.config.GlobalExceptionHandler.ResourceNotFoundException;
import com.seal.hackathon.dto.CommonDtos.CreateScoreRequest;
import com.seal.hackathon.entity.*;
import com.seal.hackathon.repository.*;
import com.seal.hackathon.security.SecurityUtil;
import com.seal.hackathon.service.AuditService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/scores")
public class ScoresController {
    private final ScoreRepository scores; private final SubmissionRepository submissions; private final EventCriterionRepository criteria; private final TeamRepository teams; private final JudgeAssignmentRepository assignments; private final AuditService audit;
    public ScoresController(ScoreRepository scores, SubmissionRepository submissions, EventCriterionRepository criteria, TeamRepository teams, JudgeAssignmentRepository assignments, AuditService audit) { this.scores=scores; this.submissions=submissions; this.criteria=criteria; this.teams=teams; this.assignments=assignments; this.audit=audit; }
    @PostMapping @PreAuthorize("hasAnyRole('Judge','GuestJudge')")
    public Score createOrUpdate(@Valid @RequestBody CreateScoreRequest r) {
        Integer judgeId = SecurityUtil.currentUserId();
        Submission sub = submissions.findById(r.submissionId()).orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài nộp"));
        Team team = teams.findById(sub.teamId).orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đội thi"));
        EventCriterion criterion = criteria.findById(r.criterionId()).orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tiêu chí"));
        if (r.scoreValue().compareTo(BigDecimal.ZERO) < 0 || r.scoreValue().compareTo(criterion.maxScore) > 0) throw new IllegalArgumentException("Điểm phải nằm trong khoảng từ 0 đến điểm tối đa của tiêu chí");
        if (!assignments.existsByRoundIdAndTrackIdAndJudgeId(sub.roundId, team.trackId, judgeId)) throw new IllegalArgumentException("Giám khảo chưa được phân công cho vòng và hạng mục này");
        Score s = scores.findBySubmissionIdAndJudgeIdAndCriterionId(r.submissionId(), judgeId, r.criterionId()).orElseGet(Score::new);
        s.submissionId=r.submissionId(); s.judgeId=judgeId; s.criterionId=r.criterionId(); s.scoreValue=r.scoreValue(); s.comment=r.comment(); s.scoredAt= LocalDateTime.now();
        Score saved = scores.save(s);
        audit.log(judgeId, "UPSERT_SCORE", "Score", saved.scoreId, null, saved.scoreValue.toString());
        return saved;
    }
    @GetMapping("/team/{teamId}") public List<Score> getTeamScores(@PathVariable Integer teamId) { return scores.findByTeamId(teamId); }
}
