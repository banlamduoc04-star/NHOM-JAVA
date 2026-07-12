package com.seal.hackathon.controller;

import com.seal.hackathon.config.GlobalExceptionHandler.ResourceNotFoundException;
import com.seal.hackathon.dto.CommonDtos.EliminateSubmissionRequest;
import com.seal.hackathon.dto.CommonDtos.SubmitWorkRequest;
import com.seal.hackathon.entity.*;
import com.seal.hackathon.repository.*;
import com.seal.hackathon.security.SecurityUtil;
import com.seal.hackathon.service.AssignmentAccessService;
import com.seal.hackathon.service.AuditService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/submissions")
public class SubmissionsController {
    private final SubmissionRepository submissions;
    private final TeamRepository teams;
    private final HackathonRoundRepository rounds;
    private final TeamMemberRepository members;
    private final TrackMentorRepository mentors;
    private final AssignmentAccessService assignmentAccess;
    private final AuditService audit;

    public SubmissionsController(
            SubmissionRepository submissions,
            TeamRepository teams,
            HackathonRoundRepository rounds,
            TeamMemberRepository members,
            TrackMentorRepository mentors,
            AssignmentAccessService assignmentAccess,
            AuditService audit
    ) {
        this.submissions=submissions;
        this.teams=teams;
        this.rounds=rounds;
        this.members=members;
        this.mentors=mentors;
        this.assignmentAccess=assignmentAccess;
        this.audit=audit;
    }

    @GetMapping
    public List<Submission> getSubmissions(@RequestParam(required=false) Integer roundId, @RequestParam(required=false) Integer teamId) {
        List<Submission> data;
        if (roundId != null && teamId != null) data = submissions.findByRoundIdAndTeamId(roundId, teamId);
        else if (roundId != null) data = submissions.findByRoundId(roundId);
        else if (teamId != null) data = submissions.findByTeamId(teamId);
        else data = submissions.findAll();
        return filterReadable(data);
    }

    @GetMapping("/team/{teamId}")
    public List<Submission> byTeam(@PathVariable Integer teamId) {
        return filterReadable(submissions.findByTeamId(teamId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('TeamMember','EventCoordinator','Admin')")
    public Submission submitWork(@Valid @RequestBody SubmitWorkRequest r) {
        Team team = teams.findById(r.teamId()).orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đội thi"));
        HackathonRound round = rounds.findById(r.roundId()).orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy vòng thi"));
        if (!SecurityUtil.isAdmin()) {
            SecurityUtil.require(isLeader(team.teamId));
        }
        if (round.submissionDeadline != null && round.submissionDeadline.isBefore(LocalDateTime.now())) throw new IllegalArgumentException("Đã quá hạn nộp bài");
        if (!"Approved".equalsIgnoreCase(team.status)) throw new IllegalArgumentException("Đội cần được phê duyệt trước khi nộp bài");
        long memberCount = members.countByTeamId(team.teamId);
        if (memberCount < 3 || memberCount > 5) throw new IllegalArgumentException("Đội thi phải có từ 3 đến 5 thành viên");
        Submission s = submissions.findByTeamIdAndRoundId(r.teamId(), r.roundId()).orElseGet(Submission::new);
        s.teamId=r.teamId();
        s.roundId=r.roundId();
        s.repositoryUrl=r.repositoryUrl();
        s.demoUrl=r.demoUrl();
        s.reportUrl=r.reportUrl();
        s.submittedAt=LocalDateTime.now();
        return submissions.save(s);
    }

    @PostMapping("/{submissionId}/eliminate")
    @PreAuthorize("hasAnyRole('EventCoordinator','Admin')")
    public Submission eliminate(@PathVariable Integer submissionId, @RequestBody EliminateSubmissionRequest r) {
        Submission s = submissions.findById(submissionId).orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài nộp"));
        s.isEliminated=true;
        s.eliminationReason=r.reason();
        s.eliminatedBy= SecurityUtil.currentUserId();
        s.eliminatedAt=LocalDateTime.now();
        Submission saved = submissions.save(s);
        audit.log(SecurityUtil.currentUserId(), "ELIMINATE_SUBMISSION", "Submission", submissionId, null, r.reason());
        return saved;
    }

    private List<Submission> filterReadable(List<Submission> data) {
        if (SecurityUtil.isAdmin()) return data;
        Integer userId = SecurityUtil.currentUserId();
        String role = SecurityUtil.currentRole();

        Set<Integer> ownTeamIds = "TeamMember".equals(role)
                ? members.findByUserId(userId).stream().map(m -> m.teamId).collect(Collectors.toSet())
                : Set.of();
        Set<Integer> mentorTrackIds = mentors.findByMentorId(userId).stream().map(m -> m.trackId).collect(Collectors.toSet());

        return data.stream().filter(s -> {
            if (ownTeamIds.contains(s.teamId)) return true;
            Team team = teams.findById(s.teamId).orElse(null);
            if (team == null) return false;
            if (mentorTrackIds.contains(team.trackId)) return true;
            return assignmentAccess.canAccessSubmission(userId, s.roundId, team.trackId, team.teamId);
        }).toList();
    }

    private boolean isLeader(Integer teamId) {
        Integer userId = SecurityUtil.currentUserId();
        if (userId == null) return false;
        return members.findByTeamIdAndUserId(teamId, userId)
                .map(member -> "Leader".equalsIgnoreCase(member.memberRole))
                .orElse(false);
    }
}
