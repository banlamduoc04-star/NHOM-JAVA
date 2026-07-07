package com.seal.hackathon.repository;

import com.seal.hackathon.entity.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface AnnouncementRepository extends JpaRepository<Announcement, Integer> {

    // Announcement Search
    List<Announcement> findByEventId(Integer eventId);

    List<Announcement> findByEventIdAndTrackId(
            Integer eventId,
            Integer trackId
    );
}