package com.seal.hackathon.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.seal.hackathon.entity.HackathonRound;

public interface HackathonRoundRepository extends JpaRepository<HackathonRound, Integer> {
    List<HackathonRound> findByEventIdOrderByRoundOrderAsc(Integer eventId);
}
