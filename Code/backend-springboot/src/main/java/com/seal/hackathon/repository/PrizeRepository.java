package com.seal.hackathon.repository;

import com.seal.hackathon.entity.Prize;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface PrizeRepository extends JpaRepository<Prize, Integer> {
    List<Prize> findByEventId(Integer eventId);
    List<Prize> findByTrackId(Integer trackId);
    List<Prize> findByEventIdAndTrackId(Integer eventId, Integer trackId);
}
