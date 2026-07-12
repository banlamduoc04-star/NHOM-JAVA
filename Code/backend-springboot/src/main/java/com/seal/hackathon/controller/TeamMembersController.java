package com.seal.hackathon.controller;

import com.seal.hackathon.config.GlobalExceptionHandler.ResourceNotFoundException;
import com.seal.hackathon.dto.CommonDtos.AddMemberRequest;
import com.seal.hackathon.entity.Team;
import com.seal.hackathon.entity.TeamMember;
import com.seal.hackathon.repository.*;
import com.seal.hackathon.security.SecurityUtil;
import com.seal.hackathon.service.AssignmentAccessService;

import jakarta.transaction.Transactional;
import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/team-members")
public class TeamMembersController {

    private final TeamMemberRepository members;
    private final TeamRepository teams;
    private final AppUserRepository users;
    private final TrackMentorRepository mentorAssignments;
    private final AssignmentAccessService assignmentAccess;

    public TeamMembersController(
            TeamMemberRepository members,
            TeamRepository teams,
            AppUserRepository users,
            TrackMentorRepository mentorAssignments,
            AssignmentAccessService assignmentAccess
    ) {
        this.members = members;
        this.teams = teams;
        this.users = users;
        this.mentorAssignments = mentorAssignments;
        this.assignmentAccess = assignmentAccess;
    }

    @GetMapping("/{teamId}")
    public List<TeamMember> getMembers(@PathVariable Integer teamId) {

        Team team = teams.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đội thi"));

        if (!SecurityUtil.isAdmin()) {

            Integer userId = SecurityUtil.currentUserId();

            // Chỉ thành viên đội, Mentor hoặc Judge được phân công mới được xem
            boolean isMember =
                    members.existsByTeamIdAndUserId(team.teamId, userId);
            boolean isAssignedMentor =
                    mentorAssignments.existsByTrackIdAndMentorId(
                            team.trackId,
                            userId
                    );
            boolean isAssignedJudge =
                    assignmentAccess.canAccessTeam(
                            userId,
                            team.trackId,
                            team.teamId
                    );

            SecurityUtil.require(
                    isMember
                            || isAssignedMentor
                            || isAssignedJudge
            );
        }
        return members.findByTeamId(teamId);
    }

    @PostMapping
    public TeamMember addMember(
            @Valid @RequestBody AddMemberRequest r
    ) {

        Team team = teams.findById(r.teamId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đội thi"));

        // Chỉ Leader hoặc Admin được thêm thành viên
        SecurityUtil.require(
                SecurityUtil.isAdmin()
                        || isLeader(r.teamId())
        );

        if (!users.existsById(r.userId())) {
            throw new ResourceNotFoundException("Không tìm thấy người dùng");
        }
        if (members.existsByTeamIdAndUserId(r.teamId(), r.userId())) {
            throw new IllegalArgumentException("Người dùng đã thuộc đội này");
        }

        // Một đội chỉ được tối đa 5 thành viên
        long count = members.countByTeamId(r.teamId());

        if (count >= 5) {
            throw new IllegalArgumentException(
                    "Một đội SEAL chỉ được tối đa 5 thành viên"
            );
        }

        // Một người không được tham gia nhiều đội trong cùng một sự kiện
        for (TeamMember existing : members.findByUserId(r.userId())) {

            Team other = teams.findById(existing.teamId).orElse(null);
            if (other != null && other.eventId.equals(team.eventId)) {
                throw new IllegalArgumentException(
                        "Người dùng đã tham gia đội khác trong sự kiện này"
                );
            }
        }

        TeamMember m = new TeamMember();
        m.teamId = r.teamId();
        m.userId = r.userId();
        m.memberRole =
                r.memberRole() == null
                        ? "Member"
                        : r.memberRole();

        return members.save(m);
    }

    @DeleteMapping("/{teamId}/{userId}")
    @Transactional
    public void remove(
            @PathVariable Integer teamId,
            @PathVariable Integer userId
    ) {
        SecurityUtil.require(
                SecurityUtil.isAdmin()
                        || isLeader(teamId)
        );
        Team team = teams.findById(teamId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Không tìm thấy đội thi"));

        // Không cho phép xóa Leader khỏi đội
        if (isLeaderUser(teamId, userId)) {
            throw new IllegalArgumentException(
                    "Không thể xóa trưởng nhóm khỏi đội"
            );
        }
        // Đội đã được duyệt phải luôn duy trì tối thiểu 3 thành viên
        if ("Approved".equalsIgnoreCase(team.status)
                && members.countByTeamId(teamId) <= 3) {
            throw new IllegalArgumentException(
                    "Đội đã được duyệt phải luôn duy trì ít nhất 3 thành viên"
            );
        }
        members.deleteByTeamIdAndUserId(teamId, userId);
    }

    // Kiểm tra người dùng hiện tại có phải Leader của đội hay không
    private boolean isLeader(Integer teamId) {
        Integer userId = SecurityUtil.currentUserId();
        if (userId == null) {
            return false;
        }
        return members.findByTeamIdAndUserId(teamId, userId)
                .map(m -> "Leader".equalsIgnoreCase(m.memberRole))
                .orElse(false);
    }
    // Kiểm tra một người dùng bất kỳ có phải Leader hay không
    private boolean isLeaderUser(Integer teamId, Integer userId) {
        
        return members.findByTeamIdAndUserId(teamId, userId)
                .map(m -> "Leader".equalsIgnoreCase(m.memberRole))
                .orElse(false);
    }
}