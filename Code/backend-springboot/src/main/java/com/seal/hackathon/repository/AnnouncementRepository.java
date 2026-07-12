package com.seal.hackathon.repository;

import com.seal.hackathon.entity.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.*;

public interface AnnouncementRepository extends JpaRepository<Announcement, Integer> {

    // Lấy tất cả thông báo của một sự kiện
    List<Announcement> findByEventId(Integer eventId);

    // Lấy thông báo theo sự kiện và hạng mục (track)
    List<Announcement> findByEventIdAndTrackId(
            Integer eventId,
            Integer trackId
    );
}