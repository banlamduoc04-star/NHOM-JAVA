package com.seal.hackathon.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.seal.hackathon.entity.CriterionTemplateItem;

public interface CriterionTemplateItemRepository extends JpaRepository<CriterionTemplateItem, Integer> {
    List<CriterionTemplateItem> findByTemplateIdOrderByDisplayOrderAsc(Integer templateId);
    void deleteByTemplateId(Integer templateId);
}
