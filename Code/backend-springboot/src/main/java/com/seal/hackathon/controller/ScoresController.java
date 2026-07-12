package com.seal.hackathon.controller;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.seal.hackathon.config.GlobalExceptionHandler.ResourceNotFoundException;
import com.seal.hackathon.dto.CommonDtos.CreateScoreRequest;
import com.seal.hackathon.entity.AppUser;
import com.seal.hackathon.entity.EventCriterion;
import com.seal.hackathon.entity.HackathonEvent;
import com.seal.hackathon.entity.HackathonRound;
import com.seal.hackathon.entity.Score;
import com.seal.hackathon.entity.Submission;
import com.seal.hackathon.entity.Team;
import com.seal.hackathon.entity.Track;
import com.seal.hackathon.repository.AppUserRepository;
import com.seal.hackathon.repository.EventCriterionRepository;
import com.seal.hackathon.repository.HackathonEventRepository;
import com.seal.hackathon.repository.HackathonRoundRepository;
import com.seal.hackathon.repository.RoundResultRepository;
import com.seal.hackathon.repository.ScoreRepository;
import com.seal.hackathon.repository.SubmissionRepository;
import com.seal.hackathon.repository.TeamMemberRepository;
import com.seal.hackathon.repository.TeamRepository;
import com.seal.hackathon.repository.TrackRepository;
import com.seal.hackathon.security.SecurityUtil;
import com.seal.hackathon.service.AssignmentAccessService;
import com.seal.hackathon.service.AuditService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/scores")
public class ScoresController {
    private final ScoreRepository scores;
    private final SubmissionRepository submissions;
    private final EventCriterionRepository criteria;
    private final TeamRepository teams;
    private final TeamMemberRepository members;
    private final AssignmentAccessService assignmentAccess;
    private final HackathonRoundRepository rounds;
    private final TrackRepository tracks;
    private final HackathonEventRepository events;
    private final AppUserRepository users;
    private final AuditService audit;
    private final RoundResultRepository roundResults;

    public ScoresController(
            ScoreRepository scores,
            SubmissionRepository submissions,
            EventCriterionRepository criteria,
            TeamRepository teams,
            TeamMemberRepository members,
            AssignmentAccessService assignmentAccess,
            HackathonRoundRepository rounds,
            TrackRepository tracks,
            HackathonEventRepository events,
            AppUserRepository users,
            AuditService audit,
            RoundResultRepository roundResults
    ) {
        this.scores = scores;
        this.submissions = submissions;
        this.criteria = criteria;
        this.teams = teams;
        this.members = members;
        this.assignmentAccess = assignmentAccess;
        this.rounds = rounds;
        this.tracks = tracks;
        this.events = events;
        this.users = users;
        this.audit = audit;
        this.roundResults = roundResults;
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public Score createOrUpdate(@Valid @RequestBody CreateScoreRequest request) {
        Integer judgeId = SecurityUtil.currentUserId();
        Submission submission = submissions.findById(request.submissionId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài nộp"));
        Team team = teams.findById(submission.teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đội thi"));
        if (!roundResults.findByRoundId(submission.roundId).isEmpty()) {
            throw new IllegalArgumentException("Kết quả vòng này đã được công bố nên không thể thay đổi điểm");
        }
        EventCriterion criterion = criteria.findById(request.criterionId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tiêu chí"));

        if (!Boolean.TRUE.equals(criterion.isActive)) throw new IllegalArgumentException("Tiêu chí đã ngưng áp dụng");
        if (!criterion.eventId.equals(team.eventId)) throw new IllegalArgumentException("Tiêu chí không thuộc sự kiện của đội");
        if (criterion.trackId != null && !criterion.trackId.equals(team.trackId)) throw new IllegalArgumentException("Tiêu chí không áp dụng cho hạng mục của đội");
        if (criterion.roundId != null && !criterion.roundId.equals(submission.roundId)) throw new IllegalArgumentException("Tiêu chí không áp dụng cho vòng thi này");
        if (request.scoreValue().compareTo(BigDecimal.ZERO) < 0 || request.scoreValue().compareTo(criterion.maxScore) > 0) {
            throw new IllegalArgumentException("Điểm phải nằm trong khoảng từ 0 đến điểm tối đa của tiêu chí");
        }

        if (!SecurityUtil.isAdmin()) {
            String role = SecurityUtil.currentRole();
            boolean judgeRole = "Judge".equals(role) || "GuestJudge".equals(role);
            SecurityUtil.require(judgeRole && assignmentAccess.canAccessSubmission(judgeId, submission.roundId, team.trackId, team.teamId));
        }

        Score score = scores.findBySubmissionIdAndJudgeIdAndCriterionId(request.submissionId(), judgeId, request.criterionId())
                .orElseGet(Score::new);
        score.submissionId = request.submissionId();
        score.judgeId = judgeId;
        score.criterionId = request.criterionId();
        score.scoreValue = request.scoreValue();
        score.comment = request.comment();
        score.scoredAt = LocalDateTime.now();
        Score saved = scores.save(score);
        audit.log(judgeId, "UPSERT_SCORE", "Score", saved.scoreId, null, saved.scoreValue.toString());
        return saved;
    }

    @GetMapping("/my")
    public List<Score> getMyScores(@RequestParam(required=false) Integer submissionId) {
        Integer userId = SecurityUtil.currentUserId();
        return scores.findByJudgeId(userId).stream()
                .filter(score -> submissionId == null || submissionId.equals(score.submissionId))
                .toList();
    }

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('EventCoordinator','Admin')")
    public List<Map<String, Object>> getSummary(
            @RequestParam(required=false) Integer eventId,
            @RequestParam(required=false) Integer trackId,
            @RequestParam(required=false) Integer roundId
    ) {
        List<Score> source = roundId == null ? scores.findAll() : scores.findByRoundId(roundId);
        Map<String, List<Score>> groups = new LinkedHashMap<>();
        for (Score score : source) {
            groups.computeIfAbsent(score.submissionId + ":" + score.judgeId, ignored -> new ArrayList<>()).add(score);
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (List<Score> group : groups.values()) {
            Score first = group.get(0);
            Submission submission = submissions.findById(first.submissionId).orElse(null);
            if (submission == null) continue;
            Team team = teams.findById(submission.teamId).orElse(null);
            HackathonRound round = rounds.findById(submission.roundId).orElse(null);
            if (team == null || round == null) continue;
            if (eventId != null && !eventId.equals(team.eventId)) continue;
            if (trackId != null && !trackId.equals(team.trackId)) continue;
            if (roundId != null && !roundId.equals(round.roundId)) continue;

            Track track = tracks.findById(team.trackId).orElse(null);
            HackathonEvent event = events.findById(team.eventId).orElse(null);
            AppUser judge = users.findById(first.judgeId).orElse(null);
            Map<String, BigDecimal> criterionScores = new LinkedHashMap<>();
            BigDecimal total = BigDecimal.ZERO;
            for (Score item : group) {
                EventCriterion criterion = criteria.findById(item.criterionId).orElse(null);
                String name = criterion == null ? "Criterion #" + item.criterionId : criterion.criterionName;
                criterionScores.put(name, item.scoreValue);
                total = total.add(item.scoreValue);
            }
            BigDecimal average = group.isEmpty()
                    ? BigDecimal.ZERO
                    : total.divide(BigDecimal.valueOf(group.size()), 2, RoundingMode.HALF_UP);

            Map<String, Object> row = new LinkedHashMap<>();
            row.put("eventId", team.eventId);
            row.put("eventName", event == null ? "#" + team.eventId : event.eventName);
            row.put("trackId", team.trackId);
            row.put("categoryName", track == null ? "#" + team.trackId : track.trackName);
            row.put("roundId", round.roundId);
            row.put("roundName", round.roundName);
            row.put("submissionId", submission.submissionId);
            row.put("teamId", team.teamId);
            row.put("teamName", team.teamName);
            row.put("judgeId", first.judgeId);
            row.put("judgeName", judge == null ? "#" + first.judgeId : judge.fullName);
            row.put("criterionScores", criterionScores);
            row.put("totalScore", total);
            row.put("averageScore", average);
            result.add(row);
        }
        return result;
    }

    @GetMapping("/team/{teamId}")
    public List<Score> getTeamScores(@PathVariable Integer teamId) {
        List<Score> teamScores = scores.findByTeamId(teamId);
        if (SecurityUtil.isAdmin()) return teamScores;

        Integer userId = SecurityUtil.currentUserId();
        Team team = teams.findById(teamId).orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đội thi"));
        if (members.existsByTeamIdAndUserId(teamId, userId)) {
            return teamScores.stream()
                    .filter(score -> submissions.findById(score.submissionId)
                            .map(submission -> roundResults.findByRoundIdAndTeamId(submission.roundId, teamId).isPresent())
                            .orElse(false))
                    .toList();
        }

        String role = SecurityUtil.currentRole();
        boolean judgeRole = "Judge".equals(role) || "GuestJudge".equals(role);
        SecurityUtil.require(judgeRole && assignmentAccess.canAccessTeam(userId, team.trackId, team.teamId));
        return teamScores.stream()
                .filter(score -> userId.equals(score.judgeId))
                .filter(score -> submissions.findById(score.submissionId)
                        .map(submission -> assignmentAccess.canAccessSubmission(userId, submission.roundId, team.trackId, team.teamId))
                        .orElse(false))
                .toList();
    }
}
