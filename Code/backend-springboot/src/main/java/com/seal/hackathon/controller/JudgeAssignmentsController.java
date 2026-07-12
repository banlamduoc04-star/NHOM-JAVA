package com.seal.hackathon.controller;

import com.seal.hackathon.config.GlobalExceptionHandler.ResourceNotFoundException;
import com.seal.hackathon.dto.CommonDtos.CreateJudgeAssignmentRequest;
import com.seal.hackathon.entity.AppUser;
import com.seal.hackathon.entity.AssignmentTeam;
import com.seal.hackathon.entity.HackathonRound;
import com.seal.hackathon.entity.JudgeAssignment;
import com.seal.hackathon.entity.Team;
import com.seal.hackathon.entity.Track;
import com.seal.hackathon.repository.AppUserRepository;
import com.seal.hackathon.repository.AssignmentTeamRepository;
import com.seal.hackathon.repository.HackathonEventRepository;
import com.seal.hackathon.repository.HackathonRoundRepository;
import com.seal.hackathon.repository.JudgeAssignmentRepository;
import com.seal.hackathon.repository.TeamMemberRepository;
import com.seal.hackathon.repository.TeamRepository;
import com.seal.hackathon.repository.TrackRepository;
import com.seal.hackathon.security.SecurityUtil;

import jakarta.transaction.Transactional;
import jakarta.validation.Valid;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/judge-assignments")
public class JudgeAssignmentsController {

    private static final Set<String> ASSIGNABLE_ROLES =
            Set.of("Judge", "GuestJudge", "Mentor");

    private final JudgeAssignmentRepository assignments;
    private final AssignmentTeamRepository assignmentTeams;
    private final AppUserRepository users;
    private final HackathonRoundRepository rounds;
    private final TrackRepository tracks;
    private final HackathonEventRepository events;
    private final TeamRepository teams;
    private final TeamMemberRepository members;

    public JudgeAssignmentsController(
            JudgeAssignmentRepository assignments,
            AssignmentTeamRepository assignmentTeams,
            AppUserRepository users,
            HackathonRoundRepository rounds,
            TrackRepository tracks,
            HackathonEventRepository events,
            TeamRepository teams,
            TeamMemberRepository members
    ) {
        this.assignments = assignments;
        this.assignmentTeams = assignmentTeams;
        this.users = users;
        this.rounds = rounds;
        this.tracks = tracks;
        this.events = events;
        this.teams = teams;
        this.members = members;
    }

    @PostMapping
    @Transactional
    @PreAuthorize("hasAnyRole('EventCoordinator','Admin')")
    public JudgeAssignment create(
            @Valid @RequestBody CreateJudgeAssignmentRequest request
    ) {
        List<Integer> selectedTeamIds =
                validateAssignmentRequest(request);

        if (assignments.existsByRoundIdAndTrackIdAndJudgeId(
                request.roundId(),
                request.trackId(),
                request.judgeId()
        )) {
            throw new IllegalArgumentException(
                    "Người này đã được phân công cho vòng và hạng mục này"
            );
        }

        JudgeAssignment assignment = new JudgeAssignment();

        assignment.roundId = request.roundId();
        assignment.trackId = request.trackId();
        assignment.judgeId = request.judgeId();

        JudgeAssignment saved = assignments.save(assignment);

        saveTeamLinks(saved.assignmentId, selectedTeamIds);

        return saved;
    }

    @PutMapping("/{assignmentId}")
    @Transactional
    @PreAuthorize("hasAnyRole('EventCoordinator','Admin')")
    public JudgeAssignment update(
            @PathVariable Integer assignmentId,
            @Valid @RequestBody CreateJudgeAssignmentRequest request
    ) {
        JudgeAssignment assignment = assignments.findById(assignmentId)
                .orElseThrow(
                        () -> new ResourceNotFoundException(
                                "Không tìm thấy phân công"
                        )
                );

        List<Integer> selectedTeamIds =
                validateAssignmentRequest(request);

        boolean duplicate = assignments
                .findByRoundIdAndTrackId(
                        request.roundId(),
                        request.trackId()
                )
                .stream()
                .anyMatch(
                        item -> request.judgeId().equals(item.judgeId)
                                && !assignmentId.equals(item.assignmentId)
                );

        if (duplicate) {
            throw new IllegalArgumentException(
                    "Người này đã được phân công cho vòng và hạng mục này"
            );
        }

        assignment.roundId = request.roundId();
        assignment.trackId = request.trackId();
        assignment.judgeId = request.judgeId();

        JudgeAssignment saved = assignments.save(assignment);

        assignmentTeams.deleteByAssignmentId(assignmentId);
        assignmentTeams.flush();

        saveTeamLinks(assignmentId, selectedTeamIds);

        return saved;
    }

    @GetMapping
    public List<JudgeAssignment> getAll() {
        return visibleAssignments();
    }

    @GetMapping("/my")
    public List<JudgeAssignment> getMyAssignments() {
        return assignments.findByJudgeId(
                SecurityUtil.currentUserId()
        );
    }

    @GetMapping("/details")
    public List<Map<String, Object>> getDetails() {
        return visibleAssignments()
                .stream()
                .map(this::toDetail)
                .toList();
    }

    @GetMapping("/my/details")
    public List<Map<String, Object>> getMyDetails() {
        return assignments
                .findByJudgeId(SecurityUtil.currentUserId())
                .stream()
                .map(this::toDetail)
                .toList();
    }

    @DeleteMapping("/{assignmentId}")
    @Transactional
    @PreAuthorize("hasAnyRole('EventCoordinator','Admin')")
    public void delete(
            @PathVariable Integer assignmentId
    ) {
        if (!assignments.existsById(assignmentId)) {
            throw new ResourceNotFoundException(
                    "Không tìm thấy phân công"
            );
        }

        assignmentTeams.deleteByAssignmentId(assignmentId);
        assignments.deleteById(assignmentId);
    }

    private List<JudgeAssignment> visibleAssignments() {
        return SecurityUtil.isAdmin()
                ? assignments.findAll()
                : assignments.findByJudgeId(
                        SecurityUtil.currentUserId()
                );
    }

    private Map<String, Object> toDetail(
            JudgeAssignment assignment
    ) {
        HackathonRound round = rounds
                .findById(assignment.roundId)
                .orElse(null);

        Track track = tracks
                .findById(assignment.trackId)
                .orElse(null);

        AppUser assignee = users
                .findById(assignment.judgeId)
                .orElse(null);

        Integer eventId = round != null
                ? round.eventId
                : (track == null ? null : track.eventId);

        Set<Integer> explicitTeamIds = assignmentTeams
                .findByAssignmentId(assignment.assignmentId)
                .stream()
                .map(link -> link.teamId)
                .collect(java.util.stream.Collectors.toSet());

        List<Map<String, Object>> assignedTeams = track == null
                ? List.of()
                : teams.findByTrackId(track.trackId)
                        .stream()
                        .filter(
                                team -> eventId == null
                                        || eventId.equals(team.eventId)
                        )
                        .filter(this::isEligibleTeam)
                        .filter(
                                team -> explicitTeamIds.isEmpty()
                                        || explicitTeamIds.contains(team.teamId)
                        )
                        .map(this::teamSummary)
                        .toList();

        Map<String, Object> row = new LinkedHashMap<>();

        row.put("assignmentId", assignment.assignmentId);
        row.put("eventId", eventId);

        row.put(
                "eventName",
                eventId == null
                        ? null
                        : events.findById(eventId)
                                .map(e -> e.eventName)
                                .orElse("#" + eventId)
        );

        row.put("trackId", assignment.trackId);

        row.put(
                "categoryName",
                track == null
                        ? "#" + assignment.trackId
                        : track.trackName
        );

        row.put("roundId", assignment.roundId);

        row.put(
                "roundName",
                round == null
                        ? "#" + assignment.roundId
                        : round.roundName
        );

        row.put("assigneeId", assignment.judgeId);

        row.put(
                "assigneeName",
                assignee == null
                        ? "#" + assignment.judgeId
                        : assignee.fullName
        );

        row.put(
                "assigneeRole",
                assignee == null
                        ? null
                        : assignee.roleName
        );

        row.put("assignedAt", assignment.assignedAt);
        row.put("teams", assignedTeams);
        row.put("teamCount", assignedTeams.size());
        row.put("allTeamsInCategory", explicitTeamIds.isEmpty());

        return row;
    }

    private Map<String, Object> teamSummary(
            Team team
    ) {
        Map<String, Object> row = new LinkedHashMap<>();

        row.put("teamId", team.teamId);
        row.put("teamName", team.teamName);
        row.put("status", team.status);
        row.put(
                "memberCount",
                members.countByTeamId(team.teamId)
        );

        return row;
    }

    private List<Integer> validateAssignmentRequest(
            CreateJudgeAssignmentRequest request
    ) {
        HackathonRound round = rounds
                .findById(request.roundId())
                .orElseThrow(
                        () -> new ResourceNotFoundException(
                                "Không tìm thấy vòng thi"
                        )
                );

        Track track = tracks
                .findById(request.trackId())
                .orElseThrow(
                        () -> new ResourceNotFoundException(
                                "Không tìm thấy hạng mục"
                        )
                );

        if (!round.eventId.equals(track.eventId)) {
            throw new IllegalArgumentException(
                    "Vòng thi và hạng mục phải thuộc cùng một sự kiện"
            );
        }

        AppUser assignee = users
                .findById(request.judgeId())
                .orElseThrow(
                        () -> new ResourceNotFoundException(
                                "Không tìm thấy người được phân công"
                        )
                );

        if (!ASSIGNABLE_ROLES.contains(assignee.roleName)) {
            throw new IllegalArgumentException(
                    "Assignment chỉ dành cho Judge, Guest Judge hoặc Mentor"
            );
        }

        if (!Boolean.TRUE.equals(assignee.isApproved)
                || "Locked".equalsIgnoreCase(assignee.accountStatus)) {
            throw new IllegalArgumentException(
                    "Tài khoản được phân công phải đang hoạt động"
            );
        }

        List<Integer> selectedTeamIds = request.teamIds() == null
                ? List.of()
                : new LinkedHashSet<>(request.teamIds())
                        .stream()
                        .toList();

        for (Integer teamId : selectedTeamIds) {
            Team team = teams.findById(teamId)
                    .orElseThrow(
                            () -> new ResourceNotFoundException(
                                    "Không tìm thấy đội #" + teamId
                            )
                    );

            if (!track.eventId.equals(team.eventId)
                    || !track.trackId.equals(team.trackId)) {
                throw new IllegalArgumentException(
                        "Tất cả đội được gán phải thuộc đúng Event "
                                + "và Category của phân công"
                );
            }

            if (!isEligibleTeam(team)) {
                throw new IllegalArgumentException(
                        "Chỉ được phân công đội đã duyệt "
                                + "và có từ 3 đến 5 thành viên"
                );
            }
        }

        return selectedTeamIds;
    }

    private void saveTeamLinks(
            Integer assignmentId,
            List<Integer> selectedTeamIds
    ) {
        for (Integer teamId : selectedTeamIds) {
            AssignmentTeam link = new AssignmentTeam();

            link.assignmentId = assignmentId;
            link.teamId = teamId;

            assignmentTeams.save(link);
        }
    }

    private boolean isEligibleTeam(
            Team team
    ) {
        long memberCount =
                members.countByTeamId(team.teamId);

        return "Approved".equalsIgnoreCase(team.status)
                && memberCount >= 3
                && memberCount <= 5;
    }
}
