package com.seal.hackathon.controller;

import com.seal.hackathon.config.GlobalExceptionHandler.ResourceNotFoundException;
import com.seal.hackathon.entity.Team;
import com.seal.hackathon.entity.TeamJoinRequest;
import com.seal.hackathon.entity.TeamMember;
import com.seal.hackathon.repository.TeamJoinRequestRepository;
import com.seal.hackathon.repository.TeamMemberRepository;
import com.seal.hackathon.repository.TeamRepository;
import com.seal.hackathon.security.SecurityUtil;
import jakarta.transaction.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/team-requests")
public class TeamJoinRequestsController {

    private final TeamRepository teams;
    private final TeamMemberRepository members;
    private final TeamJoinRequestRepository repo;

    public TeamJoinRequestsController(
            TeamRepository teams,
            TeamMemberRepository members,
            TeamJoinRequestRepository repo
    ) {
        this.teams = teams;
        this.members = members;
        this.repo = repo;
    }

    @PostMapping("/join/{teamId}")
    @Transactional
    public TeamJoinRequest join(@PathVariable Integer teamId) {

        Team team = teams.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đội thi"));

        Integer userId = SecurityUtil.currentUserId();

        // Chỉ TeamMember mới được gửi yêu cầu tham gia đội
        SecurityUtil.require("TeamMember".equals(SecurityUtil.currentRole()));

        if ("Rejected".equalsIgnoreCase(team.status)) {
            throw new IllegalArgumentException(
                    "Đội đã bị từ chối nên không thể gửi yêu cầu tham gia"
            );
        }

        // Mỗi người chỉ được thuộc một đội trong cùng sự kiện
        ensureUserHasNoTeamInEvent(userId, team.eventId, null);

        if (members.countByTeamId(teamId) >= 5) {
            throw new IllegalArgumentException(
                    "Đội đã đủ số lượng thành viên tối đa"
            );
        }

        if (repo.existsByTeamIdAndUserIdAndStatus(teamId, userId, "PENDING")) {
            throw new IllegalArgumentException(
                    "Bạn đã gửi yêu cầu tham gia đội này"
            );
        }

        boolean hasPendingInEvent = repo.findByUserIdAndStatus(userId, "PENDING")
                .stream()
                .anyMatch(request -> isRequestInEvent(request, team.eventId));

        if (hasPendingInEvent) {
            throw new IllegalArgumentException(
                    "Bạn đang có yêu cầu tham gia đang chờ xử lý trong sự kiện này"
            );
        }

        TeamJoinRequest request = new TeamJoinRequest();
        request.teamId = teamId;
        request.userId = userId;
        request.status = "PENDING";

        return repo.save(request);
    }

    @GetMapping("/my")
    public List<TeamJoinRequest> myRequests() {
        return repo.findByUserId(SecurityUtil.currentUserId());
    }

    @DeleteMapping("/join/{teamId}")
    @Transactional
    public void cancel(@PathVariable Integer teamId) {

        Integer userId = SecurityUtil.currentUserId();

        TeamJoinRequest request = repo
                .findByTeamIdAndUserIdAndStatus(teamId, userId, "PENDING")
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy yêu cầu tham gia đang chờ xử lý"));

        repo.delete(request);
    }

    @GetMapping("/team/{teamId}")
    public List<TeamJoinRequest> list(@PathVariable Integer teamId) {

        // Chỉ trưởng nhóm hoặc Admin mới xem được danh sách yêu cầu
        SecurityUtil.require(SecurityUtil.isAdmin() || isLeader(teamId));

        return repo.findByTeamId(teamId);
    }

    @PutMapping("/{id}/approve")
    @Transactional
    public TeamJoinRequest approve(@PathVariable Integer id) {

        TeamJoinRequest request = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy yêu cầu tham gia"));

        SecurityUtil.require(SecurityUtil.isAdmin() || isLeader(request.teamId));

        if (!"PENDING".equalsIgnoreCase(request.status)) {
            throw new IllegalArgumentException("Yêu cầu đã được xử lý");
        }

        Team team = teams.findById(request.teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đội thi"));

        if (members.countByTeamId(request.teamId) >= 5) {
            throw new IllegalArgumentException(
                    "Đội đã đủ số lượng thành viên tối đa"
            );
        }

        ensureUserHasNoTeamInEvent(
                request.userId,
                team.eventId,
                request.teamId
        );

        // Thêm thành viên vào đội nếu chưa tồn tại
        if (!members.existsByTeamIdAndUserId(request.teamId, request.userId)) {
            members.save(makeMember(request));
        }

        request.status = "APPROVED";
        TeamJoinRequest saved = repo.save(request);

        // Hủy các yêu cầu khác của người dùng trong cùng sự kiện
        repo.findByUserIdAndStatus(request.userId, "PENDING")
                .stream()
                .filter(other -> !other.id.equals(request.id))
                .filter(other -> isRequestInEvent(other, team.eventId))
                .forEach(other -> {
                    other.status = "CANCELLED";
                    repo.save(other);
                });

        return saved;
    }

    @PutMapping("/{id}/reject")
    @Transactional
    public TeamJoinRequest reject(@PathVariable Integer id) {

        TeamJoinRequest request = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy yêu cầu tham gia"));

        SecurityUtil.require(SecurityUtil.isAdmin() || isLeader(request.teamId));

        if (!"PENDING".equalsIgnoreCase(request.status)) {
            throw new IllegalArgumentException("Yêu cầu đã được xử lý");
        }

        request.status = "REJECTED";

        return repo.save(request);
    }

    /**
     * Tạo bản ghi TeamMember khi yêu cầu tham gia được duyệt.
     */
    private TeamMember makeMember(TeamJoinRequest request) {

        TeamMember member = new TeamMember();
        member.teamId = request.teamId;
        member.userId = request.userId;
        member.memberRole = "Member";

        return member;
    }

    /**
     * Kiểm tra người dùng đã thuộc đội nào khác
     * trong cùng sự kiện hay chưa.
     */
    private void ensureUserHasNoTeamInEvent(
            Integer userId,
            Integer eventId,
            Integer allowedTeamId
    ) {

        for (TeamMember existing : members.findByUserId(userId)) {

            Team other = teams.findById(existing.teamId).orElse(null);

            if (other != null
                    && other.eventId.equals(eventId)
                    && (allowedTeamId == null
                    || !allowedTeamId.equals(other.teamId))) {

                throw new IllegalArgumentException(
                        "Người dùng đã tham gia đội khác trong sự kiện này"
                );
            }
        }
    }
    /**
     * Kiểm tra yêu cầu tham gia có thuộc cùng sự kiện hay không.
     */
    private boolean isRequestInEvent(
            TeamJoinRequest request,
            Integer eventId
    ) {

        Team team = teams.findById(request.teamId).orElse(null);

        return team != null && team.eventId.equals(eventId);
    }

    /**
     * Kiểm tra người dùng hiện tại có phải trưởng nhóm không.
     */
    private boolean isLeader(Integer teamId) {

        Integer userId = SecurityUtil.currentUserId();

        if (userId == null) {
            return false;
        }

        return members.findByTeamIdAndUserId(teamId, userId)
                .map(member -> "Leader".equalsIgnoreCase(member.memberRole))
                .orElse(false);
    }
}