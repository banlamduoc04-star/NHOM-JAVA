package com.seal.hackathon.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.seal.hackathon.entity.Team;

public interface TeamRepository extends JpaRepository<Team, Integer> {

    // Tìm đội theo sự kiện hoặc hạng mục
    List<Team> findByEventId(Integer eventId);

    List<Team> findByTrackId(Integer trackId);

    List<Team> findByEventIdAndTrackId(
            Integer eventId,
            Integer trackId
    );

    // Kiểm tra trưởng nhóm đã có đội trong sự kiện hay chưa
    Optional<Team> findByEventIdAndLeaderId(
            Integer eventId,
            Integer leaderId
    );

    // Lấy tất cả đội do một người làm trưởng nhóm
    List<Team> findByLeaderId(Integer leaderId);

    // Kiểm tra hạng mục đã có đội đăng ký chưa
    boolean existsByTrackId(Integer trackId);
}