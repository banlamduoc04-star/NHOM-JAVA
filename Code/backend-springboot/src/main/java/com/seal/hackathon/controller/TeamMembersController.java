package com.seal.hackathon.controller;

import com.seal.hackathon.config.GlobalExceptionHandler.ResourceNotFoundException;
import com.seal.hackathon.dto.CommonDtos.AddMemberRequest;
import com.seal.hackathon.entity.Team;
import com.seal.hackathon.entity.TeamMember;
import com.seal.hackathon.repository.*;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/team-members")
public class TeamMembersController {
    private final TeamMemberRepository members; private final TeamRepository teams; private final AppUserRepository users;
    public TeamMembersController(TeamMemberRepository members, TeamRepository teams, AppUserRepository users) { this.members=members; this.teams=teams; this.users=users; }
    @GetMapping("/{teamId}") public List<TeamMember> getMembers(@PathVariable Integer teamId) { return members.findByTeamId(teamId); }
    @PostMapping @PreAuthorize("hasAnyRole('TeamMember','EventCoordinator')")
    public TeamMember addMember(@Valid @RequestBody AddMemberRequest r) {
        Team team = teams.findById(r.teamId()).orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đội thi"));
        if (!users.existsById(r.userId())) throw new ResourceNotFoundException("Không tìm thấy người dùng");
        if (members.existsByTeamIdAndUserId(r.teamId(), r.userId())) throw new IllegalArgumentException("Người dùng đã thuộc đội này");
        long count = members.countByTeamId(r.teamId());
        if (count >= 5) throw new IllegalArgumentException("Một đội SEAL chỉ được tối đa 5 thành viên");
        for (TeamMember existing : members.findByUserId(r.userId())) {
            Team other = teams.findById(existing.teamId).orElse(null);
            if (other != null && other.eventId.equals(team.eventId)) throw new IllegalArgumentException("Người dùng đã tham gia đội khác trong sự kiện này");
        }
        TeamMember m = new TeamMember(); m.teamId=r.teamId(); m.userId=r.userId(); m.memberRole=r.memberRole()==null?"Member":r.memberRole(); return members.save(m);
    }
    @DeleteMapping("/{teamId}/{userId}") @PreAuthorize("hasAnyRole('TeamMember','EventCoordinator')") @Transactional
    public void remove(@PathVariable Integer teamId, @PathVariable Integer userId) { members.deleteByTeamIdAndUserId(teamId, userId); }
}
