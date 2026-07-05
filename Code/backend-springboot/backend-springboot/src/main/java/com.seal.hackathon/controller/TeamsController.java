package com.seal.hackathon.controller;

import com.seal.hackathon.config.GlobalExceptionHandler.ResourceNotFoundException;
import com.seal.hackathon.dto.CommonDtos.*;
import com.seal.hackathon.entity.Team;
import com.seal.hackathon.entity.TeamMember;
import com.seal.hackathon.repository.*;
import com.seal.hackathon.security.SecurityUtil;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teams")
public class TeamsController {
    private final TeamRepository teams; private final TeamMemberRepository members; private final HackathonEventRepository events; private final TrackRepository tracks; private final AuditLogRepository auditLogs;
    public TeamsController(TeamRepository teams, TeamMemberRepository members, HackathonEventRepository events, TrackRepository tracks, AuditLogRepository auditLogs) { this.teams = teams; this.members = members; this.events = events; this.tracks = tracks; this.auditLogs = auditLogs; }
    @GetMapping public List<Team> getTeams(@RequestParam(required=false) Integer eventId, @RequestParam(required=false) Integer trackId) {
        if (eventId != null && trackId != null) return teams.findByEventIdAndTrackId(eventId, trackId);
        if (eventId != null) return teams.findByEventId(eventId);
        if (trackId != null) return teams.findByTrackId(trackId);
        return teams.findAll();
    }
    @GetMapping("/{teamId}") public Team getTeam(@PathVariable Integer teamId) { return teams.findById(teamId).orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đội thi")); }
    @PostMapping @PreAuthorize("hasAnyRole('TeamMember','EventCoordinator')")
    public Team createTeam(@Valid @RequestBody CreateTeamRequest r) {
        if (!events.existsById(r.eventId())) throw new ResourceNotFoundException("Không tìm thấy sự kiện");
        if (!tracks.existsById(r.trackId())) throw new ResourceNotFoundException("Không tìm thấy hạng mục");
        Integer leaderId = SecurityUtil.currentUserId();
        if (leaderId == null) throw new IllegalArgumentException("Thiếu thông tin người dùng đã xác thực");
        if (teams.findByEventIdAndLeaderId(r.eventId(), leaderId).isPresent()) throw new IllegalArgumentException("Trưởng nhóm đã có đội trong sự kiện này");
        Team t = new Team(); t.eventId=r.eventId(); t.trackId=r.trackId(); t.teamName=r.teamName(); t.leaderId=leaderId; t.status="Pending";
        Team saved = teams.save(t);
        TeamMember leader = new TeamMember(); leader.teamId=saved.teamId; leader.userId=leaderId; leader.memberRole="Leader"; members.save(leader);
        return saved;
    }
    @PatchMapping("/{teamId}/status") @PreAuthorize("hasRole('EventCoordinator')")
    public Team updateStatus(@PathVariable Integer teamId, @RequestBody UpdateTeamStatusRequest r) {
        Team t = getTeam(teamId);
        if ("Approved".equalsIgnoreCase(r.status())) {
            long memberCount = members.countByTeamId(teamId);
            if (memberCount < 3 || memberCount > 5) {
                throw new IllegalArgumentException("Đội chỉ được duyệt khi có từ 3 đến 5 thành viên");
            }
        }
        String oldStatus = t.status;
        t.status = r.status();
        Team saved = teams.save(t);
        com.seal.hackathon.entity.AuditLog log = new com.seal.hackathon.entity.AuditLog();
        log.userId = SecurityUtil.currentUserId();
        log.actionName = "UPDATE_TEAM_STATUS";
        log.entityName = "Team";
        log.entityId = teamId;
        log.oldValue = oldStatus;
        log.newValue = r.status() + (r.reason() == null ? "" : " - " + r.reason());
        auditLogs.save(log);
        return saved;
    }
}
