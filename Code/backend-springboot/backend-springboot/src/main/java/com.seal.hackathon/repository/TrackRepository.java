package com.seal.hackathon.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.seal.hackathon.entity.Track;

public interface TrackRepository extends JpaRepository<Track, Integer> {
    List<Track> findByEventId(Integer eventId);
}
