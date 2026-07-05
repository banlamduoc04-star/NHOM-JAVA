package com.seal.hackathon.controller;

import com.seal.hackathon.config.GlobalExceptionHandler.ResourceNotFoundException;
import com.seal.hackathon.dto.CommonDtos.*;
import com.seal.hackathon.entity.*;
import com.seal.hackathon.repository.*;
import com.seal.hackathon.security.SecurityUtil;
import com.seal.hackathon.service.AuditService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/submissions")
public class SubmissionsController {
    private final SubmissionRepository submissions; private final TeamRepository teams; private final HackathonRoundRepository rounds; private final TeamMemberRepository members; private final AuditService audit;
    public SubmissionsController(SubmissionRepository submissions, TeamRepository teams, HackathonRoundRepository rounds, TeamMemberRepository members, AuditService audit) { this.submissions=submissions; this.teams=teams; this.rounds=rounds; this.members=members; this.audit=audit; }
    @GetMapping public List<Submission> getSubmissions(@RequestParam(required=false) Integer roundId, @RequestParam(required=false) Integer teamId) {
        if (roundId != null && teamId != null) return submissions.findByRoundIdAndTeamId(roundId, teamId);
        if (roundId != null) return submissions.findByRoundId(roundId);
        if (teamId != null) return submissions.findByTeamId(teamId);
        return submissions.findAll();
    }
    @GetMapping("/team/{teamId}") public List<Submission> byTeam(@PathVariable Integer teamId) { return submissions.findByTeamId(teamId); }
    @PostMapping @PreAuthorize("hasAnyRole('TeamMember','EventCoordinator')")
    public Submission submitWork(@Valid @RequestBody SubmitWorkRequest r) {
        Team team = teams.findById(r.teamId()).orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đội thi"));
        HackathonRound round = rounds.findById(r.roundId()).orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy vòng thi"));
        if (round.submissionDeadline != null && round.submissionDeadline.isBefore(LocalDateTime.now())) throw new IllegalArgumentException("Đã quá hạn nộp bài");
        if (!"Approved".equalsIgnoreCase(team.status)) throw new IllegalArgumentException("Đội cần được phê duyệt trước khi nộp bài");
        long memberCount = members.countByTeamId(team.teamId);
        if (memberCount < 3 || memberCount > 5) throw new IllegalArgumentException("Đội thi phải có từ 3 đến 5 thành viên");
        Submission s = submissions.findByTeamIdAndRoundId(r.teamId(), r.roundId()).orElseGet(Submission::new);
        s.teamId=r.teamId(); s.roundId=r.roundId(); s.repositoryUrl=r.repositoryUrl(); s.demoUrl=r.demoUrl(); s.reportUrl=r.reportUrl(); s.submittedAt=LocalDateTime.now();
        return submissions.save(s);
    }
    @PostMapping("/{submissionId}/eliminate") @PreAuthorize("hasRole('EventCoordinator')")
    public Submission eliminate(@PathVariable Integer submissionId, @RequestBody EliminateSubmissionRequest r) {
        Submission s = submissions.findById(submissionId).orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài nộp"));
        s.isEliminated=true; s.eliminationReason=r.reason(); s.eliminatedBy= SecurityUtil.currentUserId(); s.eliminatedAt=LocalDateTime.now();
        Submission saved = submissions.save(s);
        audit.log(SecurityUtil.currentUserId(), "ELIMINATE_SUBMISSION", "Submission", submissionId, null, r.reason());
        return saved;
    }
}
