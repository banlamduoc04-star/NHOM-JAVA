package com.seal.hackathon.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.seal.hackathon.entity.EventCriterion;

public interface EventCriterionRepository extends JpaRepository<EventCriterion, Integer> {
    List<EventCriterion> findByEventId(Integer eventId);
    List<EventCriterion> findByEventIdAndIsActive(Integer eventId, Boolean isActive);
}
