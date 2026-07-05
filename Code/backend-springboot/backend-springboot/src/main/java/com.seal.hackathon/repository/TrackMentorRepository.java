package com.seal.hackathon.repository;

import com.seal.hackathon.entity.TrackMentor;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface TrackMentorRepository extends JpaRepository<TrackMentor, Integer> {
    List<TrackMentor> findByTrackId(Integer trackId);
    List<TrackMentor> findByMentorId(Integer mentorId);
    boolean existsByTrackIdAndMentorId(Integer trackId, Integer mentorId);
}
