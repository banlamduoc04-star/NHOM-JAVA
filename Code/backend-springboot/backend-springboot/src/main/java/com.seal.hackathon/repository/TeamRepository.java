package com.seal.hackathon.repository;

import com.seal.hackathon.entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface TeamRepository extends JpaRepository<Team, Integer> {
    List<Team> findByEventId(Integer eventId);
    List<Team> findByTrackId(Integer trackId);
    List<Team> findByEventIdAndTrackId(Integer eventId, Integer trackId);
    Optional<Team> findByEventIdAndLeaderId(Integer eventId, Integer leaderId);
}
