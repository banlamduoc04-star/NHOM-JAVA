package com.seal.hackathon.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.seal.hackathon.config.GlobalExceptionHandler.ResourceNotFoundException;
import com.seal.hackathon.dto.CommonDtos.*;
import com.seal.hackathon.dto.CommonDtos.ApplyTemplateRequest;
import com.seal.hackathon.dto.CommonDtos.CreateCriterionTemplateItemRequest;
import com.seal.hackathon.dto.CommonDtos.CreateCriterionTemplateRequest;
import com.seal.hackathon.dto.CommonDtos.UpdateCriterionTemplateStatusRequest;
import com.seal.hackathon.entity.CriterionTemplate;
import com.seal.hackathon.entity.CriterionTemplateItem;
import com.seal.hackathon.entity.EventCriterion;
import com.seal.hackathon.repository.CriterionTemplateItemRepository;
import com.seal.hackathon.repository.CriterionTemplateRepository;
import com.seal.hackathon.repository.EventCriterionRepository;
import com.seal.hackathon.repository.HackathonEventRepository;

import jakarta.transaction.Transactional;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/criterion-templates")
public class CriterionTemplatesController {

    private final CriterionTemplateRepository templates;
    private final CriterionTemplateItemRepository items;
    private final HackathonEventRepository events;
    private final EventCriterionRepository criteria;

    public CriterionTemplatesController(
            CriterionTemplateRepository templates,
            CriterionTemplateItemRepository items,
            HackathonEventRepository events,
            EventCriterionRepository criteria
    ) {
        this.templates = templates;
        this.items = items;
        this.events = events;
        this.criteria = criteria;
    }

    @GetMapping
    public List<CriterionTemplate> getTemplates() {
        return templates.findAll();
    }

    @GetMapping("/{templateId}/items")
    public List<CriterionTemplateItem> getItems(
            @PathVariable Integer templateId
    ) {
        return items.findByTemplateIdOrderByDisplayOrderAsc(templateId);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('EventCoordinator','Admin')")
    public CriterionTemplate createTemplate(
            @Valid @RequestBody CreateCriterionTemplateRequest r
    ) {
        CriterionTemplate t = new CriterionTemplate();

        t.templateName = r.templateName();
        t.description = r.description();
        t.isActive = true;

        CriterionTemplate saved = templates.save(t);

        if (r.items() != null) {
            for (CreateCriterionTemplateItemRequest i : r.items()) {
                CriterionTemplateItem item =
                        new CriterionTemplateItem();

                item.templateId = saved.templateId;
                item.criterionName = i.criterionName();
                item.maxScore = i.maxScore();
                item.weight = i.weight();

                item.displayOrder = i.displayOrder() == null
                        ? 1
                        : i.displayOrder();

                items.save(item);
            }
        }

        return saved;
    }

    @PostMapping("/{templateId}/apply-to-event/{eventId}")
    @PreAuthorize("hasAnyRole('EventCoordinator','Admin')")
    @Transactional
    public List<EventCriterion> applyTemplate(
            @PathVariable Integer templateId,
            @PathVariable Integer eventId,
            @RequestBody(required = false) ApplyTemplateRequest r
    ) {
        if (!templates.existsById(templateId)) {
            throw new ResourceNotFoundException(
                    "Không tìm thấy mẫu tiêu chí"
            );
        }

        if (!events.existsById(eventId)) {
            throw new ResourceNotFoundException(
                    "Không tìm thấy sự kiện"
            );
        }

        if (r != null && Boolean.TRUE.equals(r.replaceExisting())) {
            for (EventCriterion c : criteria.findByEventId(eventId)) {
                criteria.delete(c);
            }
        }

        List<EventCriterion> created = new ArrayList<>();

        for (
                CriterionTemplateItem item :
                items.findByTemplateIdOrderByDisplayOrderAsc(templateId)
        ) {
            EventCriterion c = new EventCriterion();

            c.eventId = eventId;
            c.criterionName = item.criterionName;
            c.maxScore = item.maxScore;
            c.weight = item.weight;
            c.isActive = true;

            created.add(criteria.save(c));
        }

        return created;
    }

    @PatchMapping("/{templateId}/status")
    @PreAuthorize("hasAnyRole('EventCoordinator','Admin')")
    public CriterionTemplate updateStatus(
            @PathVariable Integer templateId,
            @RequestBody UpdateCriterionTemplateStatusRequest r
    ) {
        CriterionTemplate t = templates.findById(templateId)
                .orElseThrow(
                        () -> new ResourceNotFoundException(
                                "Không tìm thấy mẫu tiêu chí"
                        )
                );

        t.isActive = Boolean.TRUE.equals(r.isActive());

        return templates.save(t);
    }
}
