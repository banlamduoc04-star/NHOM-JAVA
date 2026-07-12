package com.seal.hackathon.controller;

import com.seal.hackathon.config.GlobalExceptionHandler.ResourceNotFoundException;
import com.seal.hackathon.dto.CommonDtos.CreateTeamRequest;
import com.seal.hackathon.dto.CommonDtos.UpdateTeamStatusRequest;
import com.seal.hackathon.entity.AppUser;
import com.seal.hackathon.entity.Team;
import com.seal.hackathon.entity.TeamJoinRequest;
import com.seal.hackathon.entity.TeamMember;
import com.seal.hackathon.repository.*;
import com.seal.hackathon.security.SecurityUtil;
import com.seal.hackathon.service.AssignmentAccessService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * REST controller quản lý các thao tác liên quan đến "Team" (đội thi) trong hệ thống hackathon:
 * tạo đội, xem danh sách đội, cập nhật tên đội, và duyệt/đổi trạng thái đội.
 * Toàn bộ logic nghiệp vụ gốc được giữ nguyên, chỉ bổ sung comment giải thích và chỉnh format.
 */
@RestController
@RequestMapping("/api/teams")
public class TeamsController {

    private final TeamRepository teams;
    private final TeamMemberRepository members;
    private final HackathonEventRepository events;
    private final TrackRepository tracks;
    private final AuditLogRepository auditLogs;
    private final AppUserRepository users;
    private final TeamJoinRequestRepository joinRequests;
    private final TrackMentorRepository mentorAssignments;
    private final AssignmentAccessService assignmentAccess;

    public TeamsController(
            TeamRepository teams,
            TeamMemberRepository members,
            HackathonEventRepository events,
            TrackRepository tracks,
            AuditLogRepository auditLogs,
            AppUserRepository users,
            TeamJoinRequestRepository joinRequests,
            TrackMentorRepository mentorAssignments,
            AssignmentAccessService assignmentAccess
    ) {
        this.teams = teams;
        this.members = members;
        this.events = events;
        this.tracks = tracks;
        this.auditLogs = auditLogs;
        this.users = users;
        this.joinRequests = joinRequests;
        this.mentorAssignments = mentorAssignments;
        this.assignmentAccess = assignmentAccess;
    }

    // Lấy danh sách đội thi, có thể lọc theo eventId và/hoặc trackId.
    @GetMapping
    public List<Team> getTeams(
            @RequestParam(required = false) Integer eventId,
            @RequestParam(required = false) Integer trackId
    ){

        List<Team> data;

        if(eventId != null && trackId != null){
            data = teams.findByEventIdAndTrackId(eventId, trackId);
        } 
        else if(eventId != null){
            data = teams.findByEventId(eventId);
        } 
        else if(trackId != null){
            data = teams.findByTrackId(trackId);
        } 
        else{
            data = teams.findAll();
        }

        // Admin thấy tất cả, không cần lọc thêm.
        if(SecurityUtil.isAdmin()){
            return data;
        }

        Integer uid = SecurityUtil.currentUserId();
        String role = SecurityUtil.currentRole();

        // Tập trackId mà user hiện tại đang là mentor được phân công.
        Set<Integer> mentorTrackIds = mentorAssignments.findByMentorId(uid).stream()
                .map(assignment -> assignment.trackId)
                .collect(java.util.stream.Collectors.toSet());

        // Tập teamId mà user hiện tại đang là thành viên.
        Set<Integer> ownTeamIds = members.findByUserId(uid).stream()
                .map(member -> member.teamId)
                .collect(java.util.stream.Collectors.toSet());

        if ("TeamMember".equals(role) && ownTeamIds.isEmpty()){
            // Thành viên chưa có đội vẫn được xem danh sách để gửi yêu cầu tham gia.
            return data;
        }

        // Lọc: chỉ giữ lại đội của mình, đội thuộc track mình mentor, hoặc đội được cấp quyền qua assignmentAccess.
        return data.stream()
                .filter(team ->
                        ownTeamIds.contains(team.teamId)
                                || mentorTrackIds.contains(team.trackId)
                                || assignmentAccess.canAccessTeam(uid, team.trackId, team.teamId)
                )
                .toList();
    }

    /**
     * Trả về danh sách các đội mà user hiện tại đang là thành viên.
     */
    @GetMapping("/my")
    public List<Team> getMyTeams() {

        Integer userId = SecurityUtil.currentUserId();

        return members.findByUserId(userId).stream()
                .map(member -> teams.findById(member.teamId).orElse(null))
                .filter(Objects::nonNull)
                .toList();
    }

    // Trả về "trạng thái đội" hiện tại của user (dùng cho màn hình client hiển thị bước tiếp theo):
     
    @GetMapping("/my-state")
    public Map<String, Object> getMyTeamState(
            @RequestParam(required = false) Integer eventId
    ) {

        Integer userId = SecurityUtil.currentUserId();

        // Danh sách đội của user, lọc theo eventId nếu có truyền vào.
        List<Team> myTeams = members.findByUserId(userId).stream()
                .map(member -> teams.findById(member.teamId).orElse(null))
                .filter(Objects::nonNull)
                .filter(team -> eventId == null || eventId.equals(team.eventId))
                .toList();

        // Các yêu cầu tham gia đội đang chờ duyệt (PENDING), cũng lọc theo eventId nếu có.
        List<TeamJoinRequest> pendingRequests = joinRequests.findByUserIdAndStatus(userId, "PENDING").stream()
                .filter(request -> {
                    Team team = teams.findById(request.teamId).orElse(null);
                    return team != null && (eventId == null || eventId.equals(team.eventId));
                })
                .toList();

        String state = !myTeams.isEmpty()
                ? "JOINED_TEAM"
                : (!pendingRequests.isEmpty() ? "PENDING_REQUEST" : "NO_TEAM");

        boolean isLeader = myTeams.stream()
                .anyMatch(team -> userId.equals(team.leaderId));

        Map<String, Object> res = new LinkedHashMap<>();

        res.put("state", state);
        res.put("isLeader", isLeader);
        res.put("teams", myTeams);
        res.put("pendingRequests", pendingRequests);

        return res;
    }

    // Lấy danh sách đội kèm các thông tin thống kê/hiển thị 
     
    @GetMapping("/with-stats")
    public List<Map<String, Object>> getTeamsWithStats(
            @RequestParam(required = false) Integer eventId,
            @RequestParam(required = false) Integer trackId
    ) {

        Integer currentUserId = SecurityUtil.currentUserId();

        return getTeams(eventId, trackId).stream()
                .map(team -> {
                    Map<String, Object> row = new LinkedHashMap<>();

                    row.put("teamId", team.teamId);
                    row.put("eventId", team.eventId);
                    row.put("trackId", team.trackId);
                    row.put("teamName", team.teamName);
                    row.put("leaderId", team.leaderId);
                    row.put("leaderName", users.findById(team.leaderId).map(u -> u.fullName).orElse("#" + team.leaderId));
                    row.put("status", team.status);
                    row.put("createdAt", team.createdAt);
                    row.put("memberCount", members.countByTeamId(team.teamId));
                    row.put("maxMembers", 5); // Số thành viên tối đa cố định = 5 (hard-coded theo quy định cuộc thi).
                    row.put("isLeader", currentUserId != null && currentUserId.equals(team.leaderId));
                    row.put("isMember", currentUserId != null && members.existsByTeamIdAndUserId(team.teamId, currentUserId));
                    row.put(
                            "currentUserMemberRole",
                            currentUserId == null
                                    ? null
                                    : members.findByTeamIdAndUserId(team.teamId, currentUserId).map(m -> m.memberRole).orElse(null)
                    );
                    row.put("hasPendingRequest", currentUserId != null && joinRequests.existsByTeamIdAndUserIdAndStatus(team.teamId, currentUserId, "PENDING"));

                    return row;
                })
                .toList();
    }

    /**
     * Lấy thông tin chi tiết 1 đội theo id.
     * Nếu người gọi không phải Admin, phải thỏa 1 trong các điều kiện:
     * - Là TeamMember (được phép "browse" xem thông tin đội để phục vụ tham gia).
     * - Là mentor được phân công cho track của đội đó.
     * - Được assignmentAccess cấp quyền truy cập đội đó.
     * Nếu không thỏa điều kiện nào, SecurityUtil.require sẽ ném lỗi từ chối truy cập.
     */
    @GetMapping("/{teamId}")
    public Team getTeam(
            @PathVariable Integer teamId
    ) {

        Team team = teams.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đội thi"));

        if (!SecurityUtil.isAdmin()) {
            Integer userId = SecurityUtil.currentUserId();
            String role = SecurityUtil.currentRole();

            boolean teamMemberCanBrowse = "TeamMember".equals(role);
            boolean isAssignedMentor = mentorAssignments.existsByTrackIdAndMentorId(team.trackId, userId);
            boolean isAssignedByAssignment = assignmentAccess.canAccessTeam(userId, team.trackId, team.teamId);

            SecurityUtil.require(teamMemberCanBrowse || isAssignedMentor || isAssignedByAssignment);
        }

        return team;
    }

    // Tạo đội mới. Chỉ TeamMember, EventCoordinator, hoặc Admin mới được phép gọi.
     
    @PostMapping
    @PreAuthorize("hasAnyRole('TeamMember','EventCoordinator','Admin')")
    public Team createTeam(
            @Valid @RequestBody CreateTeamRequest r
    ) {

        if (!events.existsById(r.eventId())) {
            throw new ResourceNotFoundException("Không tìm thấy sự kiện");
        }

        if (!tracks.existsById(r.trackId())) {
            throw new ResourceNotFoundException("Không tìm thấy hạng mục");
        }

        Integer currentUserId = SecurityUtil.currentUserId();

        if (currentUserId == null) {
            throw new IllegalArgumentException("Thiếu thông tin người dùng đã xác thực");
        }

        // Admin có thể chỉ định leaderId khác, người dùng thường thì leader = chính họ.
        Integer leaderId = SecurityUtil.isAdmin() && r.leaderId() != null
                ? r.leaderId()
                : currentUserId;

        // Không cho leader tạo 2 đội trong cùng 1 event.
        if (teams.findByEventIdAndLeaderId(r.eventId(), leaderId).isPresent()) {
            throw new IllegalArgumentException("Trưởng nhóm đã có đội trong sự kiện này");
        }

        // Không cho user (dù là thành viên thường) tham gia 2 đội khác nhau trong cùng 1 event.
        for (TeamMember existing : members.findByUserId(leaderId)) {
            Team other = teams.findById(existing.teamId).orElse(null);

            if (other != null && other.eventId.equals(r.eventId())) {
                throw new IllegalArgumentException("Người dùng đã tham gia đội khác trong sự kiện này");
            }
        }

        // Tạo đội mới với trạng thái mặc định "Pending" (chờ duyệt).
        Team t = new Team();

        t.eventId = r.eventId();
        t.trackId = r.trackId();
        t.teamName = r.teamName();
        t.leaderId = leaderId;
        t.status = "Pending";

        Team saved = teams.save(t);

        // Tự động thêm leader làm thành viên đầu tiên của đội với vai trò "Leader".
        TeamMember leader = new TeamMember();

        leader.teamId = saved.teamId;
        leader.userId = leaderId;
        leader.memberRole = "Leader";

        members.save(leader);

        // Hủy các yêu cầu tham gia đội khác (nếu có) của leader trong cùng event này.
        cancelPendingRequestsInEvent(leaderId, saved.eventId);

        return saved;
    }

    /**
     * Cập nhật tên đội. Chỉ Admin hoặc leader của chính đội đó mới được phép sửa.
     * Nếu teamName rỗng/blank thì bỏ qua, không cập nhật.
     */
    @PatchMapping("/{teamId}")
    public Team updateTeam(
            @PathVariable Integer teamId,
            @RequestBody Map<String, String> body
    ){

        Team team = getTeam(teamId);

        SecurityUtil.require(SecurityUtil.isAdmin() || isLeader(teamId));

        String teamName = body.get("teamName");

        if (teamName != null && !teamName.isBlank()){
            team.teamName = teamName.trim();
        }

        return teams.save(team);
    }

    /**
     * Cập nhật trạng thái đội (ví dụ: Pending -> Approved/Rejected...).
     * Chỉ EventCoordinator hoặc Admin mới được phép gọi.
     * Ràng buộc: khi duyệt đội (status = "Approved"), số lượng thành viên phải nằm trong khoảng [3, 5].
     * Mỗi lần đổi trạng thái đều ghi lại audit log (trạng thái cũ, trạng thái mới, lý do nếu có).
     */
    @PatchMapping("/{teamId}/status")
    @PreAuthorize("hasAnyRole('EventCoordinator','Admin')")
    public Team updateStatus(
        @PathVariable Integer teamId, 
        @RequestBody UpdateTeamStatusRequest r){

        Team t = getTeam(teamId);

        if ("Approved".equalsIgnoreCase(r.status())){
            long memberCount = members.countByTeamId(teamId);

            if (memberCount < 3 || memberCount > 5){
                throw new IllegalArgumentException("Đội chỉ được duyệt khi có từ 3 đến 5 thành viên");
            }
        }

        String oldStatus = t.status;
        t.status = r.status();

        Team saved = teams.save(t);

        // Ghi log audit cho hành động đổi trạng thái đội.
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

    /**
     * Hủy (chuyển sang "CANCELLED") toàn bộ các join request đang PENDING của userId
     * trong phạm vi 1 event cụ thể. Dùng khi user vừa tạo/tham gia được 1 đội trong event đó,
     * nên các yêu cầu tham gia đội khác cùng event trở nên không còn cần thiết.
     */
    private void cancelPendingRequestsInEvent(Integer userId, Integer eventId){

        joinRequests.findByUserIdAndStatus(userId, "PENDING").stream()
                .filter(request -> {
                    Team team = teams.findById(request.teamId).orElse(null);
                    return team != null && eventId.equals(team.eventId);
                })
                .forEach(request -> {
                    request.status = "CANCELLED";
                    joinRequests.save(request);
                });
    }

    /**
     * Kiểm tra user hiện tại có phải là "Leader" của đội teamId hay không.
     * Trả về false nếu chưa đăng nhập hoặc không phải thành viên/không có vai trò Leader.
     */
    private boolean isLeader(Integer teamId){

        Integer userId = SecurityUtil.currentUserId();

        if (userId == null){
            return false;
        }

        return members.findByTeamIdAndUserId(teamId, userId)
                .map(m -> "Leader".equalsIgnoreCase(m.memberRole))
                .orElse(false);
    }
}