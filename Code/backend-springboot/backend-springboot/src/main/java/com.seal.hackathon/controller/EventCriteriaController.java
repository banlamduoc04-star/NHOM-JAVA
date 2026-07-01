package com.seal.hackathon.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.seal.hackathon.config.GlobalExceptionHandler.ResourceNotFoundException;
import com.seal.hackathon.dto.CommonDtos.*;
import com.seal.hackathon.dto.CommonDtos.CreateEventCriterionRequest;
import com.seal.hackathon.dto.CommonDtos.UpdateEventCriterionRequest;
import com.seal.hackathon.entity.EventCriterion;
import com.seal.hackathon.repository.EventCriterionRepository;
import com.seal.hackathon.repository.HackathonEventRepository;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/event-criteria")
public class EventCriteriaController {
    private final EventCriterionRepository criteria; private final HackathonEventRepository events;
    public EventCriteriaController(EventCriterionRepository criteria, HackathonEventRepository events) { this.criteria=criteria; this.events=events; }
    @GetMapping("/event/{eventId}") public List<EventCriterion> getByEvent(@PathVariable Integer eventId, @RequestParam(defaultValue="false") boolean includeInactive) { return includeInactive ? criteria.findByEventId(eventId) : criteria.findByEventIdAndIsActive(eventId, true); }
    @PostMapping @PreAuthorize("hasRole('EventCoordinator')") public EventCriterion create(@Valid @RequestBody CreateEventCriterionRequest r) { if(!events.existsById(r.eventId())) throw new ResourceNotFoundException("Không tìm thấy sự kiện"); EventCriterion c=new EventCriterion(); c.eventId=r.eventId(); c.criterionName=r.criterionName(); c.maxScore=r.maxScore(); c.weight=r.weight(); c.isActive=true; return criteria.save(c); }
    @PutMapping("/{criterionId}") @PreAuthorize("hasRole('EventCoordinator')") public EventCriterion update(@PathVariable Integer criterionId, @RequestBody UpdateEventCriterionRequest r) { EventCriterion c=criteria.findById(criterionId).orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tiêu chí")); if(r.criterionName()!=null) c.criterionName=r.criterionName(); if(r.maxScore()!=null) c.maxScore=r.maxScore(); if(r.weight()!=null) c.weight=r.weight(); if(r.isActive()!=null) c.isActive=r.isActive(); return criteria.save(c); }
    @DeleteMapping("/{criterionId}") @PreAuthorize("hasRole('EventCoordinator')") public EventCriterion deactivate(@PathVariable Integer criterionId) { EventCriterion c=criteria.findById(criterionId).orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tiêu chí")); c.isActive=false; return criteria.save(c); }
}
