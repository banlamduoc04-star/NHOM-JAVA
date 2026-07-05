package com.seal.hackathon.repository;

import com.seal.hackathon.entity.HackathonRound;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface HackathonRoundRepository extends JpaRepository<HackathonRound, Integer> {
    List<HackathonRound> findByEventIdOrderByRoundOrderAsc(Integer eventId);
}
