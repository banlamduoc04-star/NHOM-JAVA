package com.seal.hackathon.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.seal.hackathon.entity.TeamMember;

public interface TeamMemberRepository extends JpaRepository<TeamMember, Integer> {

    // Lấy toàn bộ thành viên của một đội
    List<TeamMember> findByTeamId(Integer teamId);

    // Tìm thành viên theo đội và người dùng
    Optional<TeamMember> findByTeamIdAndUserId(
            Integer teamId,
            Integer userId
    );

    // Kiểm tra người dùng đã thuộc đội hay chưa
    boolean existsByTeamIdAndUserId(
            Integer teamId,
            Integer userId
    );

    // Đếm số lượng thành viên trong đội
    long countByTeamId(Integer teamId);

    // Xóa thành viên khỏi đội
    void deleteByTeamIdAndUserId(
            Integer teamId,
            Integer userId
    );

    // Lấy tất cả đội mà một người dùng đang tham gia
    List<TeamMember> findByUserId(Integer userId);
}