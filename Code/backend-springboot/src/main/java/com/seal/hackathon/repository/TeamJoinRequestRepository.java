package com.seal.hackathon.repository;

import com.seal.hackathon.entity.TeamJoinRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface TeamJoinRequestRepository extends JpaRepository<TeamJoinRequest, Integer> {

    // Lấy danh sách yêu cầu tham gia của một đội
    List<TeamJoinRequest> findByTeamId(Integer teamId);

    // Lấy tất cả yêu cầu của một người dùng
    List<TeamJoinRequest> findByUserId(Integer userId);

    // Lọc yêu cầu theo người dùng và trạng thái
    List<TeamJoinRequest> findByUserIdAndStatus(
            Integer userId,
            String status
    );

    // Tìm một yêu cầu cụ thể
    Optional<TeamJoinRequest> findByTeamIdAndUserIdAndStatus(
            Integer teamId,
            Integer userId,
            String status
    );

    // Kiểm tra yêu cầu đã tồn tại hay chưa
    boolean existsByTeamIdAndUserIdAndStatus(
            Integer teamId,
            Integer userId,
            String status
    );

    // Xóa yêu cầu theo đội, người dùng và trạng thái
    void deleteByTeamIdAndUserIdAndStatus(
            Integer teamId,
            Integer userId,
            String status
    );
}