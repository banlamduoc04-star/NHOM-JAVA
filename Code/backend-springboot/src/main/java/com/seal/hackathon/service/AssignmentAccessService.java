package com.seal.hackathon.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.seal.hackathon.entity.JudgeAssignment;
import com.seal.hackathon.entity.Team;
import com.seal.hackathon.repository.AssignmentTeamRepository;
import com.seal.hackathon.repository.JudgeAssignmentRepository;
import com.seal.hackathon.repository.TeamMemberRepository;
import com.seal.hackathon.repository.TeamRepository;

@Service
public class AssignmentAccessService {
    private final JudgeAssignmentRepository assignments;
    private final AssignmentTeamRepository assignmentTeams;
    private final TeamRepository teams;
    private final TeamMemberRepository members;

    public AssignmentAccessService(
            JudgeAssignmentRepository assignments,
            AssignmentTeamRepository assignmentTeams,
            TeamRepository teams,
            TeamMemberRepository members
    ) {
        this.assignments = assignments;
        this.assignmentTeams = assignmentTeams;
        this.teams = teams;
        this.members = members;
    }

    public boolean canAccessSubmission(Integer userId, Integer roundId, Integer trackId, Integer teamId) {
        if (userId == null) return false;
        return assignments.findByJudgeIdAndRoundId(userId, roundId).stream()
                .filter(assignment -> trackId.equals(assignment.trackId))
                .anyMatch(assignment -> appliesToTeam(assignment, teamId));
    }

    public boolean canAccessTeam(Integer userId, Integer trackId, Integer teamId) {
        if (userId == null) return false;
        return assignments.findByJudgeId(userId).stream()
                .filter(assignment -> trackId.equals(assignment.trackId))
                .anyMatch(assignment -> appliesToTeam(assignment, teamId));
    }

    public List<Integer> explicitTeamIds(Integer assignmentId) {
        return assignmentTeams.findByAssignmentId(assignmentId).stream().map(link -> link.teamId).toList();
    }

    private boolean appliesToTeam(JudgeAssignment assignment, Integer teamId) {
        Team team = teams.findById(teamId).orElse(null);
        if (team == null || !"Approved".equalsIgnoreCase(team.status)) return false;
        long memberCount = members.countByTeamId(teamId);
        if (memberCount < 3 || memberCount > 5) return false;
        List<Integer> explicitIds = explicitTeamIds(assignment.assignmentId);
        return explicitIds.isEmpty() || explicitIds.contains(teamId);
    }
}
