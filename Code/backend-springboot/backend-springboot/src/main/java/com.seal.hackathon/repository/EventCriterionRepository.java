package com.seal.hackathon.repository;

import com.seal.hackathon.entity.EventCriterion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface EventCriterionRepository extends JpaRepository<EventCriterion, Integer> {
    List<EventCriterion> findByEventId(Integer eventId);
    List<EventCriterion> findByEventIdAndIsActive(Integer eventId, Boolean isActive);
}
