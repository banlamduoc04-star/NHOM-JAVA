package com.seal.hackathon.repository;

import com.seal.hackathon.entity.Track;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface TrackRepository extends JpaRepository<Track, Integer> {
    List<Track> findByEventId(Integer eventId);
}
